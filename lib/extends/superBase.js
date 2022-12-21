"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const throw_1 = require("../error/throw");
const loginUserInfo_1 = require("../authorization/loginUserInfo");
class superBase extends throw_1.default {
    getIp(ctx) {
        const req = ctx.req;
        return (req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress);
    }
    getLoginUserInfo(ctx) {
        return (0, loginUserInfo_1.getLoginUserInfo)(ctx);
    }
}
exports.default = superBase;
//# sourceMappingURL=superBase.js.map