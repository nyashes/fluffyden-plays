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
        var realParts = [""];
        var i = 0;
        if (part.length > 1) {
            for (var _i = 0, part_1 = part; _i < part_1.length; _i++) {
                var p = part_1[_i];
                var concat = realParts[i] + "\r\n" + p;
                if (p.length >= 5000) {
                    var parag = p.split(".");
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
        var last;
        for (var i_1 = 0; i_1 < part.length; ++i_1) {
            var bk = breakdance(part[i_1]);
            if (bk != "")
                last = this.channel.send(bk);
        }
        return last;
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