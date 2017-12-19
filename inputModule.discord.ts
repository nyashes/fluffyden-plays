import * as discord from "discord.js"
import * as breakdance from "breakdance"

export default class inputModule
{
    public client: discord.Client;
    private channel: discord.TextChannel;
    public constructor(aChannel: string, auth: string)
    {
        this.client = new discord.Client();

        this.client.on("ready", () => {
            this.channel = this.client.channels.filter(
                (c: discord.Channel, k, a) => 
                    c.type == "text" && 
                    (c as discord.TextChannel).name == aChannel).first() as discord.TextChannel;

            this.say("discord inputModule loaded");
        });
        this.client.login(auth);
    }

    public sendImage(path: string)
    {
        return this.channel.send("", { files: [path] });
    }

    public say(msg: string)
    {
        let part = msg.split("\n");
        let realParts = [""];
        let i = 0;
        if (part.length > 1) {
            for (let p of part) {
                let concat = realParts[i] + "\r\n" + p;
                if (p.length >= 5000) {
                    let parag = p.split(".");
                    realParts.push(parag.slice(0, parag.length / 4).join("."));
                    realParts.push(parag.slice(parag.length / 4 + 1, parag.length / 2).join("."));
                    realParts.push(parag.slice(parag.length / 2 + 1, 3 * parag.length / 4).join("."));
                    realParts.push(parag.slice(3 * parag.length / 4 + 1).join("."));
                }
                else if (concat.length < 5000)
                    realParts[i] = concat;
                else {
                    ++i;
                    realParts.push(p);
                }
            }
            part = realParts;
        }
        let last;
        for (let i = 0; i < part.length; ++i) {
            let bk = breakdance(part[i]);
            if (bk != "")
               last = this.channel.send(bk);
        }
        return last;
    }

    public addListener(fn: any)
    {
        this.client.on("message", message => {
            if (message.channel == this.channel)
                fn(message.author.id, message.content);
        });
    }
}