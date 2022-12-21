"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLoginUserInfo = exports.checkJWT = exports.getLoginUserInfo = exports.statusKey = void 0;
const jwt = require("jsonwebtoken");
const frameworkConfig_1 = require("../frameworkConfig");
const statusKey = 'loginUserInfo';
exports.statusKey = statusKey;
const checkJWT = (ctx) => {
    const header = ctx.header;
    const loginUserInfo = jwt.verify(header['authorization'], frameworkConfig_1.frameworkConfig.jwt_salt);
    return loginUserInfo;
};
exports.checkJWT = checkJWT;
const setLoginUserInfo = (ctx, loginUserInfo) => {
    ctx.state[statusKey] = loginUserInfo;
};
exports.setLoginUserInfo = setLoginUserInfo;
const getLoginUserInfo = (ctx) => {
    let loginUserInfo = ctx.state[statusKey];
    if (!loginUserInfo) {
        try {
            loginUserInfo = checkJWT(ctx);
        }
        catch (e) { }
    }
    return loginUserInfo || {};
};
exports.getLoginUserInfo = getLoginUserInfo;
exports.default = getLoginUserInfo;
//# sourceMappingURL=loginUserInfo.js.map