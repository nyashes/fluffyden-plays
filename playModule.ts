import Player from "./player"
import Move from "./move"
import inputModule from "./inputModule.twitch"
import outputModule from "./outputModule.CoC"
import macroParser from "./macroParser"

export default class playModule {
    private players: {[key: string]: Player} = {};    
    private currentMoves: {[key: string]: Move} = {"start": new Move("1")};
    private specialCommands: {[key: string]: any} = {};

    private totalPower: number = 0;
    private autoscreen: boolean = false;


    private inputHandler;
    private outputHandler;

    public constructor(inputModule: any, outputModule: any)
    {
        this.inputHandler = inputModule;
        this.outputHandler = outputModule;

        this.inputHandler.addListener((from, message) => {
            if (message[0] == "!") this.parseCommand(from, message.slice(1));
        });

        this.specialCommands["join"] = (st: string[], player: Player) => {
            this.inputHandler.say("welcome #" + player.name + " !");
        }

        this.specialCommands["screen"] = () => {
            this.outputHandler.keyboardStream.write("screencap");
            setTimeout(() => {
                this.inputHandler.sendImage("./current.jpg");
            }, 1500);
        }

        this.specialCommands["macro"] = (st: string[], player: Player) => {
            player.currentMacro = undefined;
            player.currentMacro = new macroParser(
                (move) => this.parseCommand(player.name, move, true), 
                (move) => 
                    this.currentMoves[move] ||
                    this.specialCommands[move]
            ).parse(st.slice(1).join(" "));
            player.currentMacro.playNextMove();
        }

        this.specialCommands["autoscreen"] = (st) => {
            if (st[1] == "on") {
                this.autoscreen = true;
                this.inputHandler.say("autoscreen is enabled");
            }
            else if (st[1] == "off") {
                this.autoscreen = false;
                this.inputHandler.say("autoscreen is disabled");
            }
        }

        //timeout players after 1 minute (so they do not clutter the voting pool)
        setInterval(() => 
        {
            let now = (new Date).getTime();
            for (let player in this.players)
                if (now - this.players[player].lastActive > 60000)
                    this.leave(player);

        }, 30000);
    }

    public join(aPlayer: string, aPower: number = 1): Player
    {
        let p = this.players[aPlayer];
        if (p) this.leave(aPlayer);
        p = new Player();
        p.name = aPlayer;
        p.power = aPower;
        this.totalPower += p.power;
        this.players[aPlayer] = p;

        return p;
    }

    public leave(aPlayer: string)
    {
        let p = this.players[aPlayer];
        if (!p) return;

        this.totalPower -= p.power;
        delete this.players[aPlayer];
    }

    public parseCommand(aPlayer: string, aCommand: string, isMacro?: boolean)
    {
        let parts = aCommand.split(" ");
        aCommand = parts[0];
        let m = this.currentMoves[aCommand];
        let p = this.players[aPlayer];

        if (!isMacro) {
            if (!p) p = this.join(aPlayer); 
            p.lastActive = (new Date()).getTime();
        }
        if (p) {
            if (!m) 
            {
                if (this.specialCommands[aCommand])
                {
                    if (isMacro && aCommand == "macro")
                        return;
                    this.specialCommands[aCommand](parts, p);
                }
                return;
            }
        
            this.voteForMove(p, m, aCommand);
        }
    }

    public voteForMove(p: Player, m: Move, aMove: string)
    {

        if (m.popularity.indexOf(p.name) == -1)
            for (var i = 0; i < p.power; ++i)
                m.popularity.push(p.name);
        
        
        if (m.popularity.length > this.totalPower * m.threshold) {
            this.inputHandler.say("doing " + aMove);
            this.doMove(m);
        }
        else
            this.inputHandler.say(aMove + ": " + m.popularity.length + "/" + (this.totalPower * m.threshold + 1));
        
        //"C:\Users\nem-e\AppData\Roaming\Macromedia\Flash Player\Logs";
    }

    public doMove(aMove: Move)
    {
        if (this.outputHandler.keyboardStream)
            this.outputHandler.keyboardStream.write(aMove.moveAction);
        else 
            console.log(aMove.moveAction);
        this.currentMoves = {};

        if (this.autoscreen) setTimeout(() => this.specialCommands["screen"](), 500);
        
        setTimeout(() => {
            this.inputHandler.say(this.outputHandler.getStoryText());
            let currentMoves = this.outputHandler.getActionList();

            let moves = "";
            for (let move in currentMoves)
                moves += "!" + move + ", ";

            this.inputHandler.say("available moves: " + moves.slice(0, -2)).then(() => {
                this.currentMoves = currentMoves;
                for (let p in this.players)
                    if (this.players[p].currentMacro)
                        if (!this.players[p].currentMacro.playNextMove())
                            this.players[p].currentMacro = undefined;
            });
        }, 2000);
    }
}