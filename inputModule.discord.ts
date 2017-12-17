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
        for (let i = 0; i < part.length; ++i) {
            let bk = breakdance(part[i]);
            if (bk != "")
                this.channel.send(bk + "\n");
        }
    }

    public addListener(fn: any)
    {
        this.client.on("message", message => {
            if (message.channel == this.channel)
                fn(message.author.id, message.content);
        });
    }
}