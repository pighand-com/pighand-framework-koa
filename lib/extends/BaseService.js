"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crud_1 = require("../db/crud");
const superBase_1 = require("./superBase");
const dbTypeEnum_1 = require("../db/dbTypeEnum");
exports.default = (modelObject) => {
    return class BaseService extends superBase_1.default {
        model;
        db;
        autoWpc;
        isLogicalDelete = false;
        constructor() {
            super();
            this.model = modelObject;
            this.db = new crud_1.default(this.model);
            this.autoWpc = this.db.getWhereParamConfig();
            const dbType = this.db.getDbType();
            if (dbType == dbTypeEnum_1.DbType.MONGO) {
                const { schema = {} } = this.model || {};
                const { paths = {} } = schema;
                if (paths['deleted'] || paths['delete']) {
                    this.isLogicalDelete = true;
                }
            }
            else if (dbType == dbTypeEnum_1.DbType.MYSQL) {
                const { schema = {} } = this.model || {};
                const { paths = {} } = schema;
                if (paths['deleted'] || paths['delete']) {
                    this.isLogicalDelete = true;
                }
            }
        }
        getPageOrListData(result) {
            const data = Array.isArray(result) ? result : result.list;
            return data;
        }
        async formatPageOrListResult(result, fun) {
            const data = this.getPageOrListData(result);
            const formatDate = await fun(data);
            if (Array.isArray(result)) {
                return formatDate;
            }
            return {
                page: result.page,
                list: formatDate,
            };
        }
        async integrationCreate(ctx, params) {
            return await this.db.create(params, { ctx });
        }
        async integrationQuery(ctx, params) {
            const where = await this.db.getWhereParam(this.autoWpc, params);
            return await this.db.query(where, { page: params });
        }
        async integrationFind(id) {
            return await this.db.find(id);
        }
        async integrationUpdate(ctx, id, params) {
            await this.db.update(id, params, { ctx });
        }
        async integrationDelete(ctx, id) {
            if (this.isLogicalDelete) {
                await this.db.logicalDelete(this.model, id, { ctx });
            }
            else {
                await this.db.physicsDelete(id);
            }
        }
        async integrationDeleteMany(ctx, where) {
            if (this.isLogicalDelete) {
                await this.db.logicalDelete(this.model, where, { ctx });
            }
            else {
                await this.db.physicsDelete(where);
            }
        }
    };
};
//# sourceMappingURL=BaseService.js.map