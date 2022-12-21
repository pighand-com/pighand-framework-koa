"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(ctx, data, err, code) {
    const body = {
        code: code || 200,
        data: data || '',
        error: err || '',
    };
    ctx.response.status = code === 404 ? code : 200;
    ctx.response.type = 'application/json';
    ctx.response.body = body;
    return body;
}
exports.default = default_1;
//# sourceMappingURL=result.js.map