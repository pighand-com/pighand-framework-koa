"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const throw_1 = require("../error/throw");
const mongoose = require("mongoose");
const sequelize_typescript_1 = require("sequelize-typescript");
const dbTypeEnum_1 = require("./dbTypeEnum");
const crud_1 = require("./mongo/crud");
const crud_2 = require("./mysql/crud");
const querySchema_1 = require("./querySchema");
const versionSchema_1 = require("./versionSchema");
const loginUserInfo_1 = require("../authorization/loginUserInfo");
const frameworkConfig_1 = require("../frameworkConfig");
class Curd {
    defModelObject;
    constructor(model) {
        this.defModelObject = model;
    }
    getDbType(model) {
        model = model || this.defModelObject;
        if (!model) {
            return;
        }
        if (model instanceof mongoose.Model) {
            return dbTypeEnum_1.DbType.MONGO;
        }
        else if (model instanceof sequelize_typescript_1.Model) {
            return dbTypeEnum_1.DbType.MYSQL;
        }
        new throw_1.default().throw('model类型不支持', 500);
    }
    getWhereParamConfig(model) {
        const realModel = model || this.defModelObject;
        if (!realModel) {
            return;
        }
        const dbType = this.getDbType(realModel);
        if (dbType === dbTypeEnum_1.DbType.MYSQL) {
            return crud_2.default.getWhereParamConfig(model || this.defModelObject);
        }
        else if (dbType === dbTypeEnum_1.DbType.MONGO) {
            const models = model || this.defModelObject;
            return crud_1.default.getWhereParamConfig(realModel);
        }
    }
    async create(params, modelOrVersion, version) {
        let realModel = this.defModelObject;
        if (modelOrVersion instanceof versionSchema_1.versionSchema) {
            version = modelOrVersion;
        }
        else {
            realModel = modelOrVersion;
        }
        const dbType = this.getDbType(realModel);
        let { now = new Date(), loginUserId, ctx } = version || {};
        if (!loginUserId && ctx) {
            const loginUserInfo = (0, loginUserInfo_1.getLoginUserInfo)(ctx);
            loginUserId = loginUserInfo[frameworkConfig_1.frameworkConfig.jwt_user_id];
        }
        const createParams = {
            [frameworkConfig_1.frameworkConfig.dbVersion.createdAtColumn]: now,
            [frameworkConfig_1.frameworkConfig.dbVersion.creatorColumn]: loginUserId,
            [frameworkConfig_1.frameworkConfig.dbVersion.updatedAtColumn]: now,
            [frameworkConfig_1.frameworkConfig.dbVersion.updaterColumn]: loginUserId,
            [frameworkConfig_1.frameworkConfig.dbVersion.logicalDeleteColumn]: [
                frameworkConfig_1.frameworkConfig.dbVersion.logicalDeleteFalse,
            ],
            ...(params || {}),
        };
        if (dbType === dbTypeEnum_1.DbType.MYSQL) {
            return await crud_2.default.create(realModel, createParams);
        }
        else if (dbType === dbTypeEnum_1.DbType.MONGO) {
            return await crud_1.default.create(realModel, createParams);
        }
    }
    getWhereParam(wpcOrModel, params) {
        let wpc = wpcOrModel;
        let realModel = this.defModelObject;
        if (wpcOrModel instanceof (mongoose.Model) ||
            wpcOrModel instanceof sequelize_typescript_1.Model) {
            wpc = this.getWhereParamConfig(wpcOrModel);
            realModel = wpcOrModel;
        }
        const dbType = this.getDbType(realModel);
        if (dbType === dbTypeEnum_1.DbType.MYSQL) {
            return crud_2.default.getWhereParam(wpc, params);
        }
        else if (dbType === dbTypeEnum_1.DbType.MONGO) {
            return crud_1.default.getWhereParam(wpc, params);
        }
    }
    async query(whereParam, model, option) {
        let realModel = this.defModelObject;
        let realOption = option;
        if (model instanceof querySchema_1.listOptionSchema ||
            model instanceof querySchema_1.pageOptionSchema) {
            realOption = model;
        }
        else {
            realModel = model;
        }
        const dbType = this.getDbType(realModel);
        if (dbType === dbTypeEnum_1.DbType.MYSQL) {
            return await crud_2.default.query(realModel, whereParam, realOption);
        }
        else if (dbType === dbTypeEnum_1.DbType.MONGO) {
            return await crud_1.default.query(realModel, whereParam, realOption);
        }
    }
    async find(id, model) {
        const realModel = model || this.defModelObject;
        const dbType = this.getDbType(realModel);
        if (dbType === dbTypeEnum_1.DbType.MYSQL) {
            return await crud_2.default.find(realModel, id);
        }
        else if (dbType === dbTypeEnum_1.DbType.MONGO) {
            return await crud_1.default.find(realModel, id);
        }
    }
    async update(where, params, model, version) {
        let realModel = this.defModelObject;
        if (model instanceof versionSchema_1.versionSchema) {
            version = model;
        }
        else {
            realModel = model;
        }
        const dbType = this.getDbType(realModel);
        let { now = new Date(), loginUserId, ctx } = version || {};
        if (!loginUserId && ctx) {
            const loginUserInfo = (0, loginUserInfo_1.getLoginUserInfo)(ctx);
            loginUserId = loginUserInfo[frameworkConfig_1.frameworkConfig.jwt_user_id];
        }
        const updateParams = {
            [frameworkConfig_1.frameworkConfig.dbVersion.updatedAtColumn]: now,
            [frameworkConfig_1.frameworkConfig.dbVersion.updaterColumn]: loginUserId,
            ...params,
        };
        if (dbType === dbTypeEnum_1.DbType.MYSQL) {
            await crud_2.default.update(model, updateParams, params);
        }
        else if (dbType === dbTypeEnum_1.DbType.MONGO) {
            await crud_1.default.update(model, updateParams, params);
        }
    }
    async logicalDelete(model, where, version) {
        const realModel = model || this.defModelObject;
        const dbType = this.getDbType(realModel);
        let whereParams = where;
        if (where instanceof String ||
            where instanceof Number ||
            mongoose.isValidObjectId(where)) {
            whereParams = {
                [frameworkConfig_1.frameworkConfig.jwt_user_id]: where,
            };
        }
        let { now = new Date(), loginUserId, ctx } = version || {};
        if (!loginUserId && ctx) {
            const loginUserInfo = (0, loginUserInfo_1.getLoginUserInfo)(ctx);
            loginUserId = loginUserInfo[frameworkConfig_1.frameworkConfig.jwt_user_id];
        }
        const updateParams = {
            [frameworkConfig_1.frameworkConfig.dbVersion.logicalDeleteColumn]: [
                frameworkConfig_1.frameworkConfig.dbVersion.logicalDeleteTrue,
            ],
            [frameworkConfig_1.frameworkConfig.dbVersion.logicalDeletedAtColumn]: now,
            [frameworkConfig_1.frameworkConfig.dbVersion.logicalDeleterColumn]: loginUserId,
        };
        if (dbType === dbTypeEnum_1.DbType.MYSQL) {
            await crud_2.default.update(realModel, whereParams, updateParams);
        }
        else if (dbType === dbTypeEnum_1.DbType.MONGO) {
            await crud_1.default.update(realModel, whereParams, updateParams);
        }
    }
    async physicsDelete(where, model) {
        const realModel = model || this.defModelObject;
        const dbType = this.getDbType(realModel);
        let whereParams = where;
        if (where instanceof String ||
            where instanceof Number ||
            mongoose.isValidObjectId(where)) {
            whereParams = {
                [frameworkConfig_1.frameworkConfig.jwt_user_id]: where,
            };
        }
        if (dbType === dbTypeEnum_1.DbType.MYSQL) {
            await crud_2.default.delete(realModel, whereParams);
        }
        else if (dbType === dbTypeEnum_1.DbType.MONGO) {
            await crud_1.default.delete(realModel, whereParams);
        }
    }
}
exports.default = Curd;
//# sourceMappingURL=crud.js.map