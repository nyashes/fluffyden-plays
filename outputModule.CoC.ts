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

    private static textPattern: RegExp = /<\?mainview (.*?) mainview\?>/g
    private static actionPattern: RegExp = /<\?action([0-9]+?)( !disabled)? (.+?) action[0-9]+\?>/g

    public keyboardStream: any;

    public constructor()
    {
        let inputHandlerP = child_process.spawn('bgInputHandler.exe');
        inputHandlerP.stdin.setEncoding('utf-8');
        this.keyboardStream = inputHandlerP.stdin;

        this.fileHandle = new tail.Tail("C:/Users/nem-e/AppData/Roaming/Macromedia/Flash Player/Logs/flashlog.txt");

        this.fileHandle.on("line", (d: string) => {
            this.rawLog += d;
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
            this.stringBuffer += match[1] + "\n";
        }

        while (match = outputModule.actionPattern.exec(this.rawLog))
        {
            if (!match[2])
                this.actionBuffer[match[3].split(" ")[0].toLowerCase()] = new Move(this.parseMove(parseInt(match[1])));
        }

        this.actionBuffer["save"] = new Move("{F2}1");
        this.actionBuffer["load"] = new Move("{F7}1");

        this.rawLog = "";
    }
}
