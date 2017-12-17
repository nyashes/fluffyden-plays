import * as irc from 'irc';

export default class inputModule
{
    public client: any;
    private username: string;
    public constructor(aUsername: string, auth: string)
    {
        this.username = aUsername;
        this.client = new irc.Client("irc.chat.twitch.tv", aUsername, 
        {
            port: 6667,
            password: auth,
            channels: ['#' + aUsername]
        });
        this.client.addListener('error', function(message) {
            console.error('error: ', message);
        });
        this.client.connect(1, () =>
        {
            this.client.join('#' + aUsername, () => 
            {
                this.say("fluffyden plays loaded");
            }); 
        });
    }

    public say(msg: string)
    {
        return this.client.say("#" + this.username, msg);
    }

    public addListener(fn: any)
    {
        this.client.addListener('message#' + this.username, fn);
    }
}