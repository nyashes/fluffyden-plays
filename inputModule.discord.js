"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var discord = require("discord.js");
var breakdance = require("breakdance");
var inputModule = (function () {
    function inputModule(aChannel, auth) {
        var _this = this;
        this.client = new discord.Client();
        this.client.on("ready", function () {
            _this.channel = _this.client.channels.filter(function (c, k, a) {
                return c.type == "text" &&
                    c.name == aChannel;
            }).first();
            _this.say("discord inputModule loaded");
        });
        this.client.login(auth);
    }
    inputModule.prototype.sendImage = function (path) {
        return this.channel.send("", { files: [path] });
    };
    inputModule.prototype.say = function (msg) {
        var part = msg.split("\n");
        for (var i = 0; i < part.length; ++i) {
            var bk = breakdance(part[i]);
            if (bk != "")
                this.channel.send(bk + "\n");
        }
    };
    inputModule.prototype.addListener = function (fn) {
        var _this = this;
        this.client.on("message", function (message) {
            if (message.channel == _this.channel)
                fn(message.author.id, message.content);
        });
    };
    return inputModule;
}());
exports.default = inputModule;
//# sourceMappingURL=inputModule.discord.js.map