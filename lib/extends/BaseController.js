"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("../result/result");
const checkParamsUtil_1 = require("../utils/checkParamsUtil");
const superBase_1 = require("./superBase");
const BaseController = (service) => {
    return class BaseController extends superBase_1.default {
        getParams(ctx) {
            return ctx.body || ctx.query;
        }
        result(ctx, data, code) {
            return (0, result_1.default)(ctx, data, null, code);
        }
        checkParams(params, checks, parentText = '') {
            (0, checkParamsUtil_1.checkParams)(params, checks, parentText);
        }
    };
};
exports.default = BaseController;
//# sourceMappingURL=BaseController.js.map