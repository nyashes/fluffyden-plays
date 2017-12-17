"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var move_1 = require("./move");
var child_process = require("child_process");
var tail = require("tail");
var outputModule = (function () {
    function outputModule() {
        var _this = this;
        this.rawLog = "";
        this.stringBuffer = "";
        this.actionBuffer = {};
        var inputHandlerP = child_process.spawn('bgInputHandler.exe');
        inputHandlerP.stdin.setEncoding('utf-8');
        this.keyboardStream = inputHandlerP.stdin;
        this.fileHandle = new tail.Tail("C:/Users/nem-e/AppData/Roaming/Macromedia/Flash Player/Logs/flashlog.txt");
        this.fileHandle.on("line", function (d) {
            _this.rawLog += d;
        });
    }
    outputModule.prototype.getStoryText = function () {
        this.process();
        var tmp = this.stringBuffer;
        this.stringBuffer = "";
        return tmp;
    };
    outputModule.prototype.getActionList = function () {
        this.process();
        var tmp = __assign({}, this.actionBuffer);
        this.actionBuffer = [];
        return tmp;
    };
    outputModule.prototype.parseMove = function (move) {
        move += 1;
        switch (move) {
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
    };
    outputModule.prototype.process = function () {
        var match;
        while (match = outputModule.textPattern.exec(this.rawLog)) {
            this.stringBuffer += match[1] + "\n";
        }
        while (match = outputModule.actionPattern.exec(this.rawLog)) {
            if (!match[2])
                this.actionBuffer[match[3].split(" ")[0].toLowerCase()] = new move_1.default(this.parseMove(parseInt(match[1])));
        }
        this.actionBuffer["save"] = new move_1.default("{F2}1");
        this.actionBuffer["load"] = new move_1.default("{F7}1");
        this.rawLog = "";
    };
    outputModule.textPattern = /<\?mainview (.*?) mainview\?>/g;
    outputModule.actionPattern = /<\?action([0-9]+?)( !disabled)? (.+?) action[0-9]+\?>/g;
    return outputModule;
}());
exports.default = outputModule;
//# sourceMappingURL=outputModule.CoC.js.map