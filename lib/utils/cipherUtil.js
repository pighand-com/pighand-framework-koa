"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.generatePassword = void 0;
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
const generatePassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
            if (err) {
                reject(err);
            }
            else {
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(hash);
                    }
                });
            }
        });
    });
};
exports.generatePassword = generatePassword;
const comparePassword = (password, hash) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, res) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
};
exports.comparePassword = comparePassword;
//# sourceMappingURL=cipherUtil.js.map