"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./routes/auth"));
const characters_1 = __importDefault(require("./routes/characters"));
exports.default = () => {
    const router = (0, express_1.Router)();
    (0, auth_1.default)(router);
    (0, characters_1.default)(router);
    return router;
};
//# sourceMappingURL=index.js.map