"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const querySchema_1 = require("../querySchema");
const frameworkConfig_1 = require("../../frameworkConfig");
const whereParamConfigCache = new Map();
class Crud {
    objectIdColumn = [];
    async create(model, params) {
        return await model.create(params);
    }
    getWhereParamConfig(model) {
        const wpc = whereParamConfigCache.get(model.tableName) || {};
        if (!model) {
            return wpc;
        }
        wpc.in = { id: null };
        const { paths = {} } = model.schema;
        Object.keys(paths).forEach((column) => {
            const { instance } = paths[column];
            switch (instance) {
                case 'String':
                    wpc.like = [...(wpc.like || []), column];
                    break;
                case 'Array':
                    break;
                case 'Date':
                    wpc.between = [...(wpc.between || []), column];
                    break;
                case 'ObjectID':
                    wpc.in = { ...(wpc.in || {}), [column]: null };
                    wpc.mongoObjectIdColumns = [
                        ...(wpc.mongoObjectIdColumns || []),
                        column,
                    ];
                    this.objectIdColumn = [
                        ...(wpc.mongoObjectIdColumns || []),
                        column,
                    ];
                    break;
                default:
                    break;
            }
            if (column === 'deleted' && instance === 'Boolean') {
                wpc.def = { [column]: false };
            }
        });
        return wpc;
    }
    getWhereParam(wpc, params) {
        const { def: queryDef = {}, in: queryIn = {} } = wpc;
        let where = {
            ...queryDef,
        };
        Object.keys(queryIn).forEach((key) => {
            if ((!queryIn[key] || (queryIn[key] && queryIn[key].length <= 0)) &&
                !params[key]) {
                return;
            }
            let queryInValue = queryIn[key] || String(params[key]).split(',');
            where[frameworkConfig_1.frameworkConfig?.wpcColumnMapping[key] || key] = {
                $in: queryInValue,
            };
        });
        Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value === '') {
                return;
            }
            const dbKeyColumn = frameworkConfig_1.frameworkConfig?.wpcColumnMapping[key] || key;
            if (wpc.eq && wpc.eq.includes(key)) {
                where[dbKeyColumn] = value;
            }
            else if (wpc.like && wpc.like.includes(key)) {
                where[dbKeyColumn] = { $regex: value, $options: 'i' };
            }
            else if (wpc.between) {
                if (dbKeyColumn.endsWith(querySchema_1.betweenEndingEnum.BEGIN) &&
                    wpc.between.includes(dbKeyColumn.substr(0, dbKeyColumn.length - querySchema_1.betweenEndingEnum.BEGIN.length))) {
                    where[dbKeyColumn.substr(0, dbKeyColumn.length - querySchema_1.betweenEndingEnum.BEGIN.length)] = {
                        $gte: value,
                    };
                }
                else if (dbKeyColumn.endsWith(querySchema_1.betweenEndingEnum.END) &&
                    wpc.between.includes(dbKeyColumn.substr(0, dbKeyColumn.length - querySchema_1.betweenEndingEnum.END.length))) {
                    where[dbKeyColumn.substr(0, dbKeyColumn.length - querySchema_1.betweenEndingEnum.END.length)] = {
                        $gte: value,
                    };
                }
            }
        });
        return where;
    }
    getPageParam(params) {
        if (Object.keys(params || {}).length === 0) {
            return null;
        }
        let size = 0;
        let current = 0;
        if (params.size || params.current) {
            size = params.size ? params.size : 10;
            current = params.current ? params.current : 1;
        }
        if (size > 0 && current > 0) {
            return {
                limit: Number(size),
                offset: (current - 1) * size,
            };
        }
        return null;
    }
    async query(model, whereParam, option) {
        const { page, attributes, include, order } = option;
        const pageParams = this.getPageParam(page);
        const includeParams = {};
        if (attributes) {
            if ((Array.isArray(attributes) && attributes.length > 0) ||
                !Array.isArray(attributes)) {
                includeParams.attributes = attributes;
            }
        }
        if (include) {
            includeParams.include = include;
        }
        if (order) {
            includeParams.order = order;
        }
        let result = {};
        const hasLimit = pageParams
            ? Object.prototype.hasOwnProperty.call(pageParams, 'limit')
            : 0;
        const hasOffset = pageParams
            ? Object.prototype.hasOwnProperty.call(pageParams, 'offset')
            : 0;
        if (pageParams && hasLimit && hasOffset) {
            pageParams.where = whereParam;
            Object.assign(pageParams, includeParams);
            if (pageParams.distinct === undefined)
                pageParams.distinct = true;
            result = await model.findAndCountAll(pageParams);
            return {
                page: {
                    total: result.count,
                    size: Number(pageParams.size),
                    current: Number(pageParams.current),
                },
                list: result.rows,
            };
        }
        const listParams = {
            where: whereParam,
        };
        Object.assign(listParams, includeParams);
        const allData = await model.findAll(listParams);
        return allData;
    }
    async find(model, id) {
        const result = await model.findByPk(id);
        return result;
    }
    async update(model, where, params) {
        if (typeof where !== 'object') {
            where = { id: where };
        }
        await model.update(params, where);
    }
    async delete(model, where) {
        if (typeof where !== 'object') {
            where = { _id: where };
        }
        await model.destroy(where);
    }
}
exports.default = new Crud();
//# sourceMappingURL=crud.js.map