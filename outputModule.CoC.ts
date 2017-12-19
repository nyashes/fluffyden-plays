import Move from "./move"
import * as fs from "fs"
import * as child_process from 'child_process'
import * as tail from 'tail'

export default class outputModule
{
    private fileHandle: any;
    private rawLog: string = "";
    private stringBuffer: string = "";
    private actionBuffer: any = {};

    private static textPattern: RegExp = /<\?mainview ([\s\S]*?) mainview\?>/g
    private static actionPattern: RegExp = /<\?action([0-9]+?)( !disabled)? ([\s\S]+?) action[0-9]+\?>/g

    private static enhancementPatterns: RegExp[] = [
        /<\/?font.*?>/g
    ];
    public keyboardStream: any;

    public constructor()
    {
        let inputHandlerP = child_process.spawn('bgInputHandler.exe');
        inputHandlerP.stdin.setEncoding('utf-8');
        this.keyboardStream = inputHandlerP.stdin;

        this.fileHandle = new tail.Tail("C:/Users/nem-e/AppData/Roaming/Macromedia/Flash Player/Logs/flashlog.txt");

        this.fileHandle.on("line", (d: string) => {
            this.rawLog += d + "\n";
        });
    }

    public getStoryText(): string
    {
        this.process();

        let tmp = this.stringBuffer;
        this.stringBuffer = "";
        return tmp;
    }

    public getActionList(): any
    {
        this.process();

        let tmp = {...this.actionBuffer};
        this.actionBuffer = [];
        return tmp;
    }

    private parseMove(move: number): string
    {
        move += 1;
        switch (move)
        {
            case 10:
                return "0";
            case 11:
                return "a";
            case 12:
                return "s";
            case 13:
                return "d";
            case 14:
                return "f";
            case 15:
                return "g";
            default:
                return "" + move;
        }
    }

    public process()
    {
        let match;
        while (match = outputModule.textPattern.exec(this.rawLog))
        {
            for (let pattern of outputModule.enhancementPatterns)
                match[1] = (match[1] as string).replace(pattern, "");
            this.stringBuffer += match[1];
        }

        while (match = outputModule.actionPattern.exec(this.rawLog))
        {
            if (!match[2])
                this.actionBuffer[
                    (match[3] as string).split("(")[0]
                    .replace(" ", "-")
                    .slice(0, -1)
                    .toLowerCase()
                ] = new Move(this.parseMove(parseInt(match[1])));
        }

        if (this.actionBuffer["camp-actions"])
        {
            this.actionBuffer["save"] = new Move("{F2}1");
            this.actionBuffer["load"] = new Move("{F7}1");
            this.actionBuffer["level"] = new Move("l");
        }

        this.rawLog = "";
    }
}
