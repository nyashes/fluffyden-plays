export default class macroParser
{
    private playMovefn;
    private canDofn;
    public constructor (playMovefn: any, canDofn: any)
    {
        this.playMovefn = playMovefn;
        this.canDofn = canDofn;
    }

    public parse(moveMacro: string): macro {
        return new macro(this.parseTreeInternal(new stringExplorer(moveMacro)));
    }

    private parseTreeInternal(moveMacro: stringExplorer): block
    {
        let tokenBuffer: string = "";
        let macro: block[]= [];
        let char: string;

        let flushBuffer = () => {
            if (tokenBuffer)
                macro.push(new simpleBlock(tokenBuffer, this.playMovefn, this.canDofn));

            tokenBuffer = "";
        }

        while (char = moveMacro.consume())
        {
            switch(char)
            {
                case "?":
                    flushBuffer();
                    macro[macro.length - 1] = new tryBlock(macro[macro.length - 1]);
                    break;
                case "*":
                    flushBuffer();
                    macro[macro.length - 1] = new repeaterBlock(macro[macro.length - 1]);
                    break;
                case " ":
                    flushBuffer();
                    break;
                case"(":
                    flushBuffer();
                    macro.push(this.parseTreeInternal(moveMacro));
                    break;
                case ")":
                    flushBuffer();
                    return new compositeBlock(macro);
                default:
                    tokenBuffer += char;
                    break;
            }
        }
        flushBuffer();

        if (macro.length == 1)
            return macro[0];
        else
            return new compositeBlock(macro);
    }
}

class macro
{
    private intBlock: block;
    constructor(intBlock: block)
    {
        this.intBlock = intBlock;
    }

    playNextMove(): boolean
    {
        //dragon magic, yes it does what it says
        do {
            if (this.intBlock.over())
                return false;
            if (!this.intBlock.can())
                return false;
        } while (this.intBlock.play());

        return true;
    }
}

class stringExplorer
{
    private source: string;
    private idx: number = 0;

    constructor(source: string)
    {
        this.source = source;
    }

    end():boolean { return this.idx >= this.source.length; }
    peek():string { return this.end() ? "" : this.source[this.idx]; }
    consume():string { return this.end() ? "" : this.source[this.idx++]; }
}

interface block
{
    play(): boolean; //return = has a move
    can(): boolean;
    over(): boolean;
    reset(): void;
}

class baseBlock
{
    private isOver: boolean = false;
    public over() { return this.isOver; }
    public reset() { this.isOver = false; }
    protected setOver() { this.isOver = true; }
}

class simpleBlock extends baseBlock implements block
{

    public constructor(move: string, playMovefn: any, canDofn: any)
    {
        super();
        this.play = () => { playMovefn(move); this.setOver(); return false; }
        this.can = () => canDofn(move);
    }

    public play: () => boolean;
    public can: () => boolean;
}

class compositeBlock extends baseBlock implements block
{
    private current: number = 0;
    private sequenceNotBroken: boolean = false;
    private blocks: block[];
    public constructor(blocks: block[])
    {
        super();
        this.blocks = blocks;
    }

    public reset() {
        super.reset(); 
        this.current = 0; 
        for (let b of this.blocks)
            b.reset;
    }

    public play() { 
        if (this.can()) {
            let result = this.blocks[this.current].play();
            if (this.blocks[this.current].over())
                ++this.current;

            if (this.current == this.blocks.length)
                this.setOver();
            
            return result;
        }
        else {
            return true;
        }
    }

    public can() {
        return this.blocks[this.current].can();
    }
}

class repeaterBlock extends baseBlock implements block
{
    private b: block;
    public constructor(b: block)
    {
        super();
        this.b = b;
        this.can = () => this.b.can();
    }

    public play() { 
        if (this.b.can()) {
            let result = this.b.play(); 
            if (this.b.over()) {
                this.b.reset();
            }

            return result;
        }
        else {
            return true;
        }
    }

    public reset() {
        super.reset();
        this.b.reset();
    }

    public can: () => boolean;
}

class tryBlock extends baseBlock implements block
{
    private b: block;
    public constructor(b: block)
    {
        super();
        this.b = b;
        this.can = () => true;
    }

    public play() { 
        if (this.b.can()) {  
            let r = this.b.play();
            if (this.b.over())
                this.setOver();

            return r;
        }
        else {
            this.setOver();
            return true;
        }
    }
    public can: () => boolean;    
}