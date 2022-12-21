"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loginUserInfo_1 = require("./loginUserInfo");
function checkToken(isCheckToken = true) {
    return async (ctx, next) => {
        const header = ctx.header;
        if (header['authorization']) {
            let loginUserInfo = {};
            try {
                loginUserInfo = (0, loginUserInfo_1.checkJWT)(ctx);
            }
            catch (e) {
                if (isCheckToken) {
                    ctx.throw(401, '无权限');
                }
            }
            (0, loginUserInfo_1.setLoginUserInfo)(ctx, loginUserInfo);
        }
        else {
            if (isCheckToken) {
                ctx.throw(401, '无权限');
            }
        }
        await next();
    };
}
exports.default = checkToken;
//# sourceMappingURL=checkToken.js.map