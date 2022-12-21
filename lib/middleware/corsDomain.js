"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function corsDomain(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Credentials', 'true');
    ctx.set('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE');
    ctx.set('Access-Control-Allow-Headers', 'x-requested-with,Authorization,Content-Type,Accept');
    if (ctx.method == 'OPTIONS') {
        ctx.response.status = 200;
    }
    await next();
}
exports.default = corsDomain;
//# sourceMappingURL=corsDomain.js.map