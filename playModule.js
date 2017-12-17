"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var player_1 = require("./player");
var move_1 = require("./move");
var playModule = (function () {
    function playModule(inputModule, outputModule) {
        var _this = this;
        this.players = {};
        this.currentMoves = { "start": new move_1.default("1") };
        this.specialCommands = {};
        this.totalPower = 0;
        this.autoscreen = false;
        this.inputHandler = inputModule;
        this.outputHandler = outputModule;
        this.inputHandler.addListener(function (from, message) {
            if (message[0] == "!")
                _this.voteForMove(from, message.slice(1));
        });
        this.specialCommands["screen"] = function () {
            _this.outputHandler.keyboardStream.write("screencap");
            setTimeout(function () {
                _this.inputHandler.sendImage("./current.jpg");
            }, 1500);
        };
        this.specialCommands["autoscreen"] = function (st) {
            if (st[1] == "on") {
                _this.autoscreen = true;
                _this.inputHandler.say("autoscreen is enabled");
            }
            else if (st[1] == "off") {
                _this.autoscreen = false;
                _this.inputHandler.say("autoscreen is disabled");
            }
        };
        //timeout players after 1 minute (so they do not clutter the voting pool)
        setInterval(function () {
            var now = (new Date).getTime();
            for (var player in _this.players)
                if (now - _this.players[player].lastActive > 60000)
                    _this.leave(player);
        }, 30000);
    }
    playModule.prototype.join = function (aPlayer, aPower) {
        if (aPower === void 0) { aPower = 1; }
        var p = this.players[aPlayer];
        if (p)
            this.leave(aPlayer);
        p = new player_1.default();
        p.name = aPlayer;
        p.power = aPower;
        this.totalPower += p.power;
        this.players[aPlayer] = p;
        return p;
    };
    playModule.prototype.leave = function (aPlayer) {
        var p = this.players[aPlayer];
        if (!p)
            return;
        this.totalPower -= p.power;
        delete this.players[aPlayer];
    };
    playModule.prototype.voteForMove = function (aPlayer, aMove) {
        var parts = aMove.split(" ");
        aMove = parts[0];
        var m = this.currentMoves[aMove];
        var p = this.players[aPlayer];
        if (!m) {
            if (this.specialCommands[aMove]) {
                this.specialCommands[aMove](parts);
            }
            return;
        }
        if (!p)
            p = this.join(aPlayer);
        p.lastActive = (new Date()).getTime();
        if (m.popularity.indexOf(aPlayer) == -1)
            for (var i = 0; i < p.power; ++i)
                m.popularity.push(aPlayer);
        if (m.popularity.length > this.totalPower * m.threshold) {
            this.inputHandler.say("doing " + aMove);
            this.doMove(m);
        }
        else
            this.inputHandler.say(aMove + ": " + m.popularity.length + "/" + (this.totalPower * m.threshold + 1));
        //"C:\Users\nem-e\AppData\Roaming\Macromedia\Flash Player\Logs";
    };
    playModule.prototype.doMove = function (aMove) {
        var _this = this;
        if (this.outputHandler.keyboardStream)
            this.outputHandler.keyboardStream.write(aMove.moveAction);
        else
            console.log(aMove.moveAction);
        this.currentMoves = {};
        if (this.autoscreen)
            setTimeout(function () { return _this.specialCommands["screen"](); }, 500);
        setTimeout(function () {
            _this.inputHandler.say(_this.outputHandler.getStoryText());
            _this.currentMoves = _this.outputHandler.getActionList();
            var moves = "";
            for (var move in _this.currentMoves)
                moves += "!" + move + ", ";
            _this.inputHandler.say("available moves: " + moves.slice(0, -2));
        }, 2000);
    };
    return playModule;
}());
exports.default = playModule;
//# sourceMappingURL=playModule.js.map