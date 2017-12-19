"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var player_1 = require("./player");
var move_1 = require("./move");
var macroParser_1 = require("./macroParser");
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
                _this.parseCommand(from, message.slice(1));
        });
        this.specialCommands["join"] = function (st, player) {
            _this.inputHandler.say("welcome #" + player.name + " !");
        };
        this.specialCommands["screen"] = function () {
            _this.outputHandler.keyboardStream.write("screencap");
            setTimeout(function () {
                _this.inputHandler.sendImage("./current.jpg");
            }, 1500);
        };
        this.specialCommands["macro"] = function (st, player) {
            player.currentMacro = undefined;
            player.currentMacro = new macroParser_1.default(function (move) { return _this.parseCommand(player.name, move, true); }, function (move) {
                return _this.currentMoves[move] ||
                    _this.specialCommands[move];
            }).parse(st.slice(1).join(" "));
            player.currentMacro.playNextMove();
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
    playModule.prototype.parseCommand = function (aPlayer, aCommand, isMacro) {
        var parts = aCommand.split(" ");
        aCommand = parts[0];
        var m = this.currentMoves[aCommand];
        var p = this.players[aPlayer];
        if (!isMacro) {
            if (!p)
                p = this.join(aPlayer);
            p.lastActive = (new Date()).getTime();
        }
        if (p) {
            if (!m) {
                if (this.specialCommands[aCommand]) {
                    if (isMacro && aCommand == "macro")
                        return;
                    this.specialCommands[aCommand](parts, p);
                }
                return;
            }
            this.voteForMove(p, m, aCommand);
        }
    };
    playModule.prototype.voteForMove = function (p, m, aMove) {
        if (m.popularity.indexOf(p.name) == -1)
            for (var i = 0; i < p.power; ++i)
                m.popularity.push(p.name);
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
            var currentMoves = _this.outputHandler.getActionList();
            var moves = "";
            for (var move in currentMoves)
                moves += "!" + move + ", ";
            _this.inputHandler.say("available moves: " + moves.slice(0, -2)).then(function () {
                _this.currentMoves = currentMoves;
                for (var p in _this.players)
                    if (_this.players[p].currentMacro)
                        if (!_this.players[p].currentMacro.playNextMove())
                            _this.players[p].currentMacro = undefined;
            });
        }, 2000);
    };
    return playModule;
}());
exports.default = playModule;
//# sourceMappingURL=playModule.js.map