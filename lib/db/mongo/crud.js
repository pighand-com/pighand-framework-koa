"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const querySchema_1 = require("../querySchema");
const frameworkConfig_1 = require("../../frameworkConfig");
const whereParamConfigCache = new Map();
class Crud {
    objectIdColumn = [];
    async create(model, params) {
        const createModel = new model(params);
        await createModel.save();
        return createModel;
    }
    getWhereParamConfig(model) {
        const wpc = whereParamConfigCache.get(model.name) || {};
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
                    wpc.in = { ...(wpc.in || {}), [column]: null };
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
        const { def: queryDef = {}, in: queryIn = {}, mongoObjectIdColumns = this.objectIdColumn, } = wpc;
        let where = {
            ...queryDef,
        };
        Object.keys(queryIn).forEach((key) => {
            if ((!queryIn[key] || (queryIn[key] && queryIn[key].length <= 0)) &&
                !params[key]) {
                return;
            }
            let queryInValue = queryIn[key] || String(params[key]).split(',');
            if (mongoObjectIdColumns && mongoObjectIdColumns.includes(key)) {
                queryInValue = queryInValue
                    .filter((item) => item)
                    .map((item) => new mongoose.Types.ObjectId(item));
            }
            where[frameworkConfig_1.frameworkConfig?.wpcColumnMapping[key] || key] = {
                $in: queryInValue,
            };
        });
        Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value === '') {
                return;
            }
            if (mongoObjectIdColumns && mongoObjectIdColumns.includes(key)) {
                value = new mongoose.Types.ObjectId(value);
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
    async query(model, whereParam, option) {
        const { lookups, project, sort, unwinds } = option || {};
        const tmpOption = option;
        const { page: pageParam = {} } = tmpOption || {};
        let queryParams = [];
        queryParams.push({
            $match: whereParam || {},
        });
        if (lookups) {
            lookups.forEach((lookup) => {
                queryParams.push({
                    $lookup: lookup,
                });
            });
        }
        if (project) {
            queryParams.push({
                $project: project,
            });
        }
        if (unwinds) {
            unwinds.forEach((unwind) => {
                queryParams.push({
                    $unwind: unwind,
                });
            });
        }
        if (sort) {
            queryParams.push({
                $sort: sort,
            });
        }
        if (pageParam && pageParam.size && pageParam.current) {
            queryParams.push({
                $skip: Number(pageParam.size) *
                    (Number(pageParam.current) * 1 - 1),
            });
            queryParams.push({
                $limit: Number(pageParam.size) * 1,
            });
        }
        if (pageParam && pageParam.size && pageParam.current) {
            let [list, count] = await Promise.all([
                model.aggregate(queryParams),
                model.countDocuments(whereParam),
            ]);
            return {
                page: {
                    total: count,
                    size: Number(pageParam.size),
                    current: Number(pageParam.current),
                },
                list,
            };
        }
        else {
            const list = await model.aggregate(queryParams);
            return list;
        }
    }
    async find(model, id) {
        const result = await model.findById(id);
        return result;
    }
    async update(model, where, params) {
        if (typeof where !== 'object') {
            where = { _id: where };
        }
        await model.updateMany(where, params);
    }
    async delete(model, where) {
        if (typeof where !== 'object') {
            where = { _id: where };
        }
        await model.deleteMany(where);
    }
}
exports.default = new Crud();
//# sourceMappingURL=crud.js.map