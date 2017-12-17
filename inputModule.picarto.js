"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var picarto = require("./picarto.api.js");
var inputModule = (function () {
    function inputModule(aUsername, auth) {
        this.username = aUsername;
        picarto.initSocket();
    }
    inputModule.prototype.say = function (msg) {
        var myMessage = this.newMessage.create({ message: msg });
        var buffer = this.newMessage.encode(myMessage).finish();
        return this.client.say("#" + this.username, msg);
    };
    inputModule.prototype.addListener = function (fn) {
        this.client.addListener('message#' + this.username, fn);
    };
    return inputModule;
}());
exports.default = inputModule;
//# sourceMappingURL=inputModule.picarto.js.map