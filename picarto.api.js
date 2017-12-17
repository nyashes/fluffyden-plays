
var io = require("socket.io-client");  
var jade = require('jade');
var http = require('http');
var picarto = require("./picarto.js");

var api = {};

api.version = "1.2.1";
api.Events = new EventEmitter;
api.Events.setMaxListeners(0);
api.readOnly = {};
api.jade = jade;
api.sharedStorage = storage.create({ dir: process.cwd() + "/storage/shared_storage" });
api.sharedStorage.initSync();

function initSocket(token,channel) {
    if(!channel) return;
    // Connect all the socket events with the EventEmitter of the API
    socket[channel.toLowerCase()] = io.connect("https://nd1.picarto.tv:443", {
        secure: true,
        forceNew: true,
        query: "token=" + token
    }).on("connect", function () {
        console.log("Connected to " + channel);
        api.Events.emit("connected");
    }).on("disconnect", function (reason) {
        console.log("Disconnected from " + channel);
        api.Events.emit("disconnected", reason);
    }).on("reconnect", function () {
        api.Events.emit("reconnected");
    }).on("reconnect_attempt", function () {
        api.Events.emit("reconnect_attempt");
    }).on("chatMode", function (data) {
        api.Events.emit("chatMode", data);
    }).on("srvMsg", function (data) {
        api.Events.emit("srvMsg", data);
    }).on("channelUsers", function (data) {
        api.user_manager.updateUserList(channel, data);
        api.Events.emit("channelUsers", data, channel);
    }).on("userMsg", function (data) {
        if(inputLog.indexOf(data.id) == -1){
            inputLog.push(data.id);
            if(inputLog.length > 50) inputLog.shift();
            data.msg = entities.decode(data.msg);
            data.channel = channel;
            data.whisper = false;
            api.Events.emit("userMsg", api.user_manager.updateUserData(data));
        } else {
            api.Events.emit("userMsgDuplicate", api.user_manager.updateUserData(data));
        }
    }).on("meMsg", function (data) {
        api.Events.emit("meMsg", data);
    }).on("globalMsg", function (data) {
        api.Events.emit("globalMsg", data);
    }).on("clearChat", function () {
        api.Events.emit("clearChat");
    }).on("commandHelp", function () {
        api.Events.emit("commandHelp");
    }).on("modToolsVisible", function (modToolsEnabled) {
        api.Events.emit("modToolsVisible", modToolsEnabled);
    }).on("modList", function (data) {
        api.Events.emit("modList", data);
    }).on("whisper", function (data) {
        if(inputLog.indexOf(data.id) == -1){
            inputLog.push(data.id);
            if(inputLog.length > 50) inputLog.shift();
            data.msg = entities.decode(data.msg);
            data.channel = channel;
            data.whisper = true;
            api.Events.emit("whisper", api.user_manager.updateUserData(data));
        } else {
            api.Events.emit("whisperDuplicate", api.user_manager.updateUserData(data));
        }
    }).on("color", function (data) {
        api.Events.emit("color", data);
    }).on("onlineState", function (data) {
        api.Events.emit("onlineState", data);
    }).on("raffleUsers", function (data) {
        api.Events.emit("raffleUsers", data);
    }).on("wonRaffle", function (data) {
        api.Events.emit("wonRaffle", data);
    }).on("runPoll", function () {
        api.Events.emit("runPoll");
    }).on("showPoll", function (data) {
        api.Events.emit("showPoll", data);
    }).on("pollVotes", function (data) {
        api.Events.emit("pollVotes", data)
    }).on("voteResponse", function () {
        api.Events.emit("voteResponse");
    }).on("finishPoll", function (data) {
        api.Events.emit("finishPoll", data);
    }).on("gameMode", function (data) {
        api.Events.emit("gameMode", data);
    }).on("adultMode", function (data) {
        api.Events.emit("adultMode", data);
    }).on("commissionsAvailable", function (data) {
        api.Events.emit("commissionsAvailable", data);
    }).on("clearUser", function (data) {
        api.Events.emit("clearUser", data);
    }).on("removeMsg", function (data) {
        api.Events.emit("removeMsg", data);
    }).on("warnAdult", function () {
        api.Events.emit("warnAdult");
    }).on("warnGaming", function () {
        api.Events.emit("warnGaming");
    }).on("warnMovies", function () {
        api.Events.emit("warnMovies");
    }).on("multiStatus", function (data) {
        api.Events.emit("multiStatus", data);
    });
    
    api.Messages = {
        send: function (message,channel) {
            if(typeof channel == 'undefined'){
                channel = Object.keys(socket)[0];
            } else if(typeof socket[channel.toLowerCase()] === 'undefined' || socket[channel.toLowerCase()].disconnected) {
                console.log("Failed to send, channel is not connected");
                return;
            } 
            if (api.readOnly[channel.toLowerCase()]) {
                console.log("Bot runs in ReadOnly Mode. Messages can not be sent");
                return;
            }
            if(api.mute_manager.isMuted(channel)){
                return;
            }
            if (message.length > 255) {
                socket[channel.toLowerCase()].emit("chatMsg", {
                    msg: "This message was too long for Picarto: " + message.length + " characters. Sorry."
                });
                console.log("This message was too long for Picarto: " + message.length + " characters. Sorry.");
                return;
            }
            socket[channel.toLowerCase()].emit("chatMsg", {
                msg: message.toString()
            });
        },
        whisper: function (to, message,channel) {
            if(typeof channel == 'undefined'){
                channel = Object.keys(socket)[0];
            } else if(typeof socket[channel.toLowerCase()] === 'undefined'  || socket[channel.toLowerCase()].disconnected) {
                console.log("Failed to send, channel is not connected");
                return;
            } 
            if (api.readOnly[channel.toLowerCase()]) {
                console.log("Bot runs in ReadOnly Mode. Messages can not be sent");
                return;
            }
            if(api.mute_manager.isMuted(channel)){
                return;
            }
            if ((message.length + 4 + to.length) > 255) {
                socket[channel.toLowerCase()].emit("chatMsg", {
                    msg: "/w " + to + " This message was too long for Picarto: " + message.length + " characters. Sorry."
                });
                console.log("This message was too long for Picarto: " + message.length + " characters. Sorry.");
                return;
            }
            socket[channel.toLowerCase()].emit("chatMsg", {
                msg: "/w " + to + " " + message.toString()
            });
        }
    }
    api.setColor = function (color,channel) {
        if(typeof channel == 'undefined'){
                channel = Object.keys(socket)[0];
        }
        if (color.startsWith("#")) {
            color = color.substring(1);
        }
        socket[channel.toLowerCase()].emit("setColor", color.toUpperCase());
    }
}

module.exports = {
    api: api,
    initSocket: initSocket,
}