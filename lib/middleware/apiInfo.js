"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function apiInfo(ctx, next) {
    const beginTime = new Date().getTime();
    await next();
    const endTime = new Date().getTime();
    console.log(`时间：${endTime - beginTime} 接口：${ctx.url}`);
}
exports.default = apiInfo;
//# sourceMappingURL=apiInfo.js.map