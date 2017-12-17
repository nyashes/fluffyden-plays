"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var irc = require("irc");
var inputModule = (function () {
    function inputModule(aUsername, auth) {
        var _this = this;
        this.username = aUsername;
        this.client = new irc.Client("irc.chat.twitch.tv", aUsername, {
            port: 6667,
            password: auth,
            channels: ['#' + aUsername]
        });
        this.client.addListener('error', function (message) {
            console.error('error: ', message);
        });
        this.client.connect(1, function () {
            _this.client.join('#' + aUsername, function () {
                _this.say("fluffyden plays loaded");
            });
        });
    }
    inputModule.prototype.say = function (msg) {
        return this.client.say("#" + this.username, msg);
    };
    inputModule.prototype.addListener = function (fn) {
        this.client.addListener('message#' + this.username, fn);
    };
    return inputModule;
}());
exports.default = inputModule;
//# sourceMappingURL=inputModule.twitch.js.map