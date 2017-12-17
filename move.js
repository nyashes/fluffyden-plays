"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Move = (function () {
    function Move(action) {
        this.popularity = [];
        this.threshold = 0.5;
        this.moveAction = action;
    }
    return Move;
}());
exports.default = Move;
//# sourceMappingURL=move.js.map