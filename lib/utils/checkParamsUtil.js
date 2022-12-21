"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkParams = void 0;
const lodash = require("lodash");
const checkParams = (params, checks, parentText = '') => {
    const err = new Error();
    err.status = 400;
    checks.forEach((check) => {
        let hasInput = false;
        let requiredText = '';
        parentText = parentText || check.parentText;
        Object.keys(params).forEach((key) => {
            const text = parentText
                ? `${parentText}${params[key]}`
                : params[key];
            const { jsonDataType = '', lengthMin = 0, lengthMax, jsonCheckData = [], jsonAllowMoreKey = true, regexType = '', } = check;
            const value = params[key];
            const type = Array.isArray(value)
                ? 'jsonArray'
                : typeof value;
            if ((value || value === '') &&
                check.dataType &&
                type !== check.dataType) {
                let typeStr;
                switch (check.dataType) {
                    case 'number':
                        typeStr = '数字';
                        break;
                    case 'jsonObject':
                        typeStr = 'json';
                        break;
                    case 'jsonArray':
                        typeStr = '数组';
                        break;
                    case 'boolean':
                        typeStr = '布尔';
                        break;
                    default:
                        typeStr = '字符串';
                        break;
                }
                err.message = `${text}类型不是${typeStr}`;
                throw err;
            }
            if (check.dataType === 'jsonArray' || check.dataType === 'object') {
                if (jsonDataType && check.dataType === 'jsonArray') {
                    (value || []).forEach((jsonItem) => {
                        if (typeof jsonItem !== jsonDataType) {
                            let typeStr;
                            switch (jsonDataType) {
                                case 'number':
                                    typeStr = '数字';
                                    break;
                                default:
                                    typeStr = '字符串';
                                    break;
                            }
                            err.message = `${text}数据类型必须是${typeStr}`;
                            throw err;
                        }
                    });
                }
                if (jsonCheckData.length > 0) {
                    if (check.dataType === 'object') {
                        (0, exports.checkParams)(value, jsonCheckData, text);
                    }
                    else {
                        (value || []).forEach((item) => {
                            (0, exports.checkParams)(item, jsonCheckData, text);
                        });
                    }
                }
                if (jsonAllowMoreKey === false) {
                    const ruleKeys = jsonCheckData.map((item) => {
                        return Object.keys(params[key]);
                    });
                    const ruleKeysFlatten = lodash.flattenDeep(ruleKeys);
                    const paramsJsonKeys = Object.keys(value);
                    const diff = lodash.difference(paramsJsonKeys, ruleKeysFlatten);
                    if (diff.length > 0) {
                        err.message = `${text}格式不正确，不能包含${diff.join('、')}`;
                        throw err;
                    }
                }
            }
            if (value && (lengthMin || lengthMax)) {
                if (check.dataType === 'jsonArray') {
                    const lengthText = '个数';
                    if (lengthMax && value.length > lengthMax) {
                        err.message = `${text}${lengthText}不能超过${lengthMax}个`;
                        throw err;
                    }
                    if (lengthMin && value.length < lengthMin) {
                        err.message = `${text}${lengthText}不能少于${lengthMin}个`;
                        throw err;
                    }
                }
                else {
                    const valueLength = String(value).length;
                    const lengthText = type === 'number' ? '' : '长度';
                    if (lengthMax && valueLength > lengthMax) {
                        err.message = `${text}${lengthText}不能超过${lengthMax}`;
                        throw err;
                    }
                    if (lengthMin && valueLength < lengthMin) {
                        err.message = `${text}${lengthText}不能小于${lengthMin}`;
                        throw err;
                    }
                }
            }
            if ((value !== undefined &&
                value !== null &&
                value !== '' &&
                type !== 'jsonObject' &&
                type !== 'jsonArray') ||
                (type === 'jsonObject' && Object.keys(value).length !== 0) ||
                (type === 'jsonArray' && value.length !== 0)) {
                hasInput = true;
            }
            if (requiredText) {
                requiredText += `或${text}`;
            }
            else {
                requiredText = text;
            }
            if (regexType && hasInput) {
                switch (regexType) {
                    case 'mobile':
                        if (!/^1[3456789]\d{9}$/.test(value)) {
                            err.message = '手机号格式不正确';
                            throw err;
                        }
                        break;
                    case 'email':
                        if (!/^\w+@[a-zA-Z0-9]{2,10}(?:\.[a-z]{2,4}){1,3}$/.test(value)) {
                            err.message = '邮箱格式不正确';
                            throw err;
                        }
                        break;
                    case 'mobileFixed':
                        if (!(/^1[3456789]\d{9}$/.test(value) ||
                            /^(0[1-9]\d{1,2}-)\d{6,7}$/.test(value))) {
                            err.message = '电话格式不正确';
                            throw err;
                        }
                        break;
                    default:
                        break;
                }
            }
        });
        if (check.required !== false && !hasInput) {
            err.message = `请输入${requiredText}`;
            throw err;
        }
    });
};
exports.checkParams = checkParams;
//# sourceMappingURL=checkParamsUtil.js.map