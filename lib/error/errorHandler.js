"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("../result/result");
const throw_1 = require("./throw");
async function errorHandler(ctx, next) {
    try {
        await next();
    }
    catch (e) {
        if (!e.status || e.status == 500) {
            console.log(e.stack);
        }
        const status = e.status ? e.status : 500;
        let data;
        let message = e.message;
        try {
            const errorMessageFormat = JSON.parse(message);
            if (errorMessageFormat.type === throw_1.errorMessageType) {
                data = errorMessageFormat.data;
                message = errorMessageFormat.message;
            }
        }
        catch (e) { }
        (0, result_1.default)(ctx, data, message, status);
    }
}
exports.default = errorHandler;
//# sourceMappingURL=errorHandler.js.map