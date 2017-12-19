"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var macroParser = (function () {
    function macroParser(playMovefn, canDofn) {
        this.playMovefn = playMovefn;
        this.canDofn = canDofn;
    }
    macroParser.prototype.parse = function (moveMacro) {
        return new macro(this.parseTreeInternal(new stringExplorer(moveMacro)));
    };
    macroParser.prototype.parseTreeInternal = function (moveMacro) {
        var _this = this;
        var tokenBuffer = "";
        var macro = [];
        var char;
        var flushBuffer = function () {
            if (tokenBuffer)
                macro.push(new simpleBlock(tokenBuffer, _this.playMovefn, _this.canDofn));
            tokenBuffer = "";
        };
        while (char = moveMacro.consume()) {
            switch (char) {
                case "?":
                    flushBuffer();
                    macro[macro.length - 1] = new tryBlock(macro[macro.length - 1]);
                    break;
                case "*":
                    flushBuffer();
                    macro[macro.length - 1] = new repeaterBlock(macro[macro.length - 1]);
                    break;
                case " ":
                    flushBuffer();
                    break;
                case "(":
                    flushBuffer();
                    macro.push(this.parseTreeInternal(moveMacro));
                    break;
                case ")":
                    flushBuffer();
                    return new compositeBlock(macro);
                default:
                    tokenBuffer += char;
                    break;
            }
        }
        flushBuffer();
        if (macro.length == 1)
            return macro[0];
        else
            return new compositeBlock(macro);
    };
    return macroParser;
}());
exports.default = macroParser;
var macro = (function () {
    function macro(intBlock) {
        this.intBlock = intBlock;
    }
    macro.prototype.playNextMove = function () {
        //dragon magic, yes it does what it says
        do {
            if (this.intBlock.over())
                return false;
            if (!this.intBlock.can())
                return false;
        } while (this.intBlock.play());
        return true;
    };
    return macro;
}());
var stringExplorer = (function () {
    function stringExplorer(source) {
        this.idx = 0;
        this.source = source;
    }
    stringExplorer.prototype.end = function () { return this.idx >= this.source.length; };
    stringExplorer.prototype.peek = function () { return this.end() ? "" : this.source[this.idx]; };
    stringExplorer.prototype.consume = function () { return this.end() ? "" : this.source[this.idx++]; };
    return stringExplorer;
}());
var baseBlock = (function () {
    function baseBlock() {
        this.isOver = false;
    }
    baseBlock.prototype.over = function () { return this.isOver; };
    baseBlock.prototype.reset = function () { this.isOver = false; };
    baseBlock.prototype.setOver = function () { this.isOver = true; };
    return baseBlock;
}());
var simpleBlock = (function (_super) {
    __extends(simpleBlock, _super);
    function simpleBlock(move, playMovefn, canDofn) {
        var _this = _super.call(this) || this;
        _this.play = function () { playMovefn(move); _this.setOver(); return false; };
        _this.can = function () { return canDofn(move); };
        return _this;
    }
    return simpleBlock;
}(baseBlock));
var compositeBlock = (function (_super) {
    __extends(compositeBlock, _super);
    function compositeBlock(blocks) {
        var _this = _super.call(this) || this;
        _this.current = 0;
        _this.sequenceNotBroken = false;
        _this.blocks = blocks;
        return _this;
    }
    compositeBlock.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.current = 0;
        for (var _i = 0, _a = this.blocks; _i < _a.length; _i++) {
            var b = _a[_i];
            b.reset;
        }
    };
    compositeBlock.prototype.play = function () {
        if (this.can()) {
            var result = this.blocks[this.current].play();
            if (this.blocks[this.current].over())
                ++this.current;
            if (this.current == this.blocks.length)
                this.setOver();
            return result;
        }
        else {
            return true;
        }
    };
    compositeBlock.prototype.can = function () {
        return this.blocks[this.current].can();
    };
    return compositeBlock;
}(baseBlock));
var repeaterBlock = (function (_super) {
    __extends(repeaterBlock, _super);
    function repeaterBlock(b) {
        var _this = _super.call(this) || this;
        _this.b = b;
        _this.can = function () { return _this.b.can(); };
        return _this;
    }
    repeaterBlock.prototype.play = function () {
        if (this.b.can()) {
            var result = this.b.play();
            if (this.b.over()) {
                this.b.reset();
            }
            return result;
        }
        else {
            return true;
        }
    };
    repeaterBlock.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.b.reset();
    };
    return repeaterBlock;
}(baseBlock));
var tryBlock = (function (_super) {
    __extends(tryBlock, _super);
    function tryBlock(b) {
        var _this = _super.call(this) || this;
        _this.b = b;
        _this.can = function () { return true; };
        return _this;
    }
    tryBlock.prototype.play = function () {
        if (this.b.can()) {
            var r = this.b.play();
            if (this.b.over())
                this.setOver();
            return r;
        }
        else {
            this.setOver();
            return true;
        }
    };
    return tryBlock;
}(baseBlock));
//# sourceMappingURL=macroParser.js.map