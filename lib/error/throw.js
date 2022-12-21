"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Throw = exports.errorMessageType = void 0;
const errorMessageType = 'errorMessageFormat';
exports.errorMessageType = errorMessageType;
class Throw {
    throw(message, dataOrStatus, status) {
        const data = !dataOrStatus || typeof dataOrStatus === 'number'
            ? null
            : dataOrStatus;
        const realStatus = dataOrStatus && typeof dataOrStatus === 'number'
            ? dataOrStatus
            : status || 500;
        const messageFormatString = {
            type: errorMessageType,
            message,
            data,
        };
        const err = new Error(JSON.stringify(messageFormatString));
        err.status = realStatus;
        throw err;
    }
    errorMessageFormat(message, data) {
        const messageJSON = {
            type: errorMessageType,
            message,
            data,
        };
        return JSON.stringify(messageJSON);
    }
}
exports.Throw = Throw;
exports.default = Throw;
//# sourceMappingURL=throw.js.map