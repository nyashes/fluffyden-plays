import * as picarto from './picarto.api.js'

export default class inputModule
{
    public client: any;
    private username: string;
    public constructor(aUsername: string, auth: string)
    {
        this.username = aUsername;
        picarto.initSocket();
    }

    public say(msg: string)
    {
        let myMessage = this.newMessage.create( {message: msg} );
        let buffer = this.newMessage.encode(myMessage).finish();

        return this.client.say("#" + this.username, msg);
    }

    public addListener(fn: any)
    {
        this.client.addListener('message#' + this.username, fn);
    }
}