import * as mongoose from 'mongoose';
import {
    pageResultSchema,
    listOptionSchema,
    pageOptionSchema,
    betweenEndingEnum,
    whereParamConfig,
} from '../querySchema';
import { frameworkConfig } from '../../frameworkConfig';

const whereParamConfigCache: Map<string, whereParamConfig> = new Map();

class Crud {
    objectIdColumn: Array<string> = [];

    /**
     * 创建
     * @param {mode} model
     * @param {json} params
     * @returns {json} create info
     */
    async create(
        model: mongoose.Model<any>,
        params: object,
    ): Promise<mongoose.Document> {
        const createModel: mongoose.Document = new model(params);
        await createModel.save();

        return createModel;
    }

    /**
     * 根据model设置查询规则
     * @param model
     * @returns whereParamConfig
     */
    getWhereParamConfig(model: mongoose.Model<any>): whereParamConfig {
        const wpc: whereParamConfig =
            whereParamConfigCache.get(model.name) || {};
        if (!model) {
            return wpc;
        }

        wpc.in = { id: null };

        const { paths = {} }: any = model.schema;
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

    /**
     * 获取查询参数
     * @param wpc
     * @param params
     * @returns where 查询条件
     */
    getWhereParam(wpc: whereParamConfig, params: any): any {
        const {
            def: queryDef = {},
            in: queryIn = {},
            mongoObjectIdColumns = this.objectIdColumn,
        } = wpc;

        let where: any = {
            ...queryDef,
        };

        Object.keys(queryIn).forEach((key) => {
            if (
                (!queryIn[key] || (queryIn[key] && queryIn[key].length <= 0)) &&
                !params[key]
            ) {
                return;
            }

            let queryInValue = queryIn[key] || String(params[key]).split(',');

            if (mongoObjectIdColumns && mongoObjectIdColumns.includes(key)) {
                queryInValue = queryInValue
                    .filter((item: string) => item)
                    .map((item: string) => new mongoose.Types.ObjectId(item));
            }

            where[frameworkConfig.wpcColumnMapping[key] || key] = {
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

            const dbKeyColumn = frameworkConfig.wpcColumnMapping[key] || key;

            if (wpc.eq && wpc.eq.includes(key)) {
                where[dbKeyColumn] = value;
            } else if (wpc.like && wpc.like.includes(key)) {
                where[dbKeyColumn] = { $regex: value, $options: 'i' };
            } else if (wpc.between) {
                if (
                    dbKeyColumn.endsWith(betweenEndingEnum.BEGIN) &&
                    wpc.between.includes(
                        dbKeyColumn.substr(
                            0,
                            dbKeyColumn.length - betweenEndingEnum.BEGIN.length,
                        ),
                    )
                ) {
                    where[
                        dbKeyColumn.substr(
                            0,
                            dbKeyColumn.length - betweenEndingEnum.BEGIN.length,
                        )
                    ] = {
                        $gte: value,
                    };
                } else if (
                    dbKeyColumn.endsWith(betweenEndingEnum.END) &&
                    wpc.between.includes(
                        dbKeyColumn.substr(
                            0,
                            dbKeyColumn.length - betweenEndingEnum.END.length,
                        ),
                    )
                ) {
                    where[
                        dbKeyColumn.substr(
                            0,
                            dbKeyColumn.length - betweenEndingEnum.END.length,
                        )
                    ] = {
                        $gte: value,
                    };
                }
            }
        });

        return where;
    }

    /**
     * 分页查询
     * @param model
     * @param pageParam
     * @param whereParam
     * @param option
     */
    async query(
        model: mongoose.Model<any>,
        whereParam?: any,
        option?: pageOptionSchema,
    ): Promise<pageResultSchema<mongoose.Document>>;

    /**
     * 列表查询
     * @param model
     * @param whereParam
     * @param option
     */
    async query(
        model: mongoose.Model<any>,
        whereParam?: any,
        option?: listOptionSchema,
    ): Promise<Array<mongoose.Document>>;

    /**
     * 分页或列表查询
     * @param model
     * @param pageParam
     * @param whereParam
     * @param option
     */
    async query(
        model: mongoose.Model<any>,
        whereParam?: any,
        option?: listOptionSchema | pageOptionSchema,
    ): Promise<pageResultSchema<mongoose.Document> | Array<mongoose.Document>> {
        const { lookups, project, sort, unwinds } = option || {};

        const tmpOption: any = option;
        const { page: pageParam = {} } = tmpOption || {};

        let queryParams = [];

        queryParams.push({
            $match: whereParam || {},
        });

        if (lookups) {
            lookups.forEach((lookup: any) => {
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
                $skip:
                    Number(pageParam.size) *
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
        } else {
            const list = await model.aggregate(queryParams);
            return list;
        }
    }

    /**
     * 详情
     * @param model
     * @param id
     * @returns
     */
    async find(
        model: mongoose.Model<any>,
        id: string | number | mongoose.ObjectId,
    ): Promise<mongoose.Document> {
        const result: mongoose.Document = await model.findById(id);
        return result;
    }

    /**
     * 更新
     * @param model
     * @param where
     * @param params
     */
    async update(
        model: mongoose.Model<any>,
        where: string | number | mongoose.ObjectId | object,
        params: any,
    ) {
        if (typeof where !== 'object') {
            where = { _id: where };
        }

        await model.updateMany(where, params);
    }

    /**
     * 物理删除
     * @param model
     * @param where
     */
    async delete(
        model: mongoose.Model<any>,
        where: string | number | mongoose.ObjectId | object,
    ) {
        if (typeof where !== 'object') {
            where = { _id: where };
        }

        await model.deleteMany(where);
    }
}

export default new Crud();
