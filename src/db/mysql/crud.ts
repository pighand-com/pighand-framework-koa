import { Model } from 'sequelize';
import {
    pageResultSchema,
    listOptionSchema,
    pageOptionSchema,
    betweenEndingEnum,
    whereParamConfig,
} from '../querySchema';
import { frameworkConfig } from '../../frameworkConfig';

const whereParamConfigCache: Map<string, whereParamConfig> = new Map();

/**
 * mysql实现
 */
class Crud {
    objectIdColumn: Array<string> = [];

    /**
     * 创建
     * @param {Model} model
     * @param {json} params
     * @returns {json} create info
     */
    async create(model: any, params: object): Promise<any> {
        return await model.create(params);
    }

    /**
     * 根据model设置查询规则
     * @param model
     * @returns whereParamConfig
     */
    getWhereParamConfig(model: any): whereParamConfig {
        const wpc: whereParamConfig =
            whereParamConfigCache.get(model.tableName) || {};
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
        const { def: queryDef = {}, in: queryIn = {} } = wpc;

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

            where[frameworkConfig.wpcColumnMapping[key] || key] = {
                $in: queryInValue,
            };
        });

        Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value === '') {
                return;
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
     * 分页参数处理
     * 返回null表示不分页
     * @param {json} params
     */
    getPageParam(params: any) {
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

    /**
     * 分页查询
     * @param model
     * @param pageParam
     * @param whereParam
     * @param option
     */
    async query(
        model: any,
        whereParam?: any,
        option?: pageOptionSchema,
    ): Promise<pageResultSchema<Model>>;

    /**
     * 列表查询
     * @param model
     * @param whereParam
     * @param option
     */
    async query(
        model: any,
        whereParam?: any,
        option?: listOptionSchema,
    ): Promise<Array<Model>>;

    /**
     * 分页或列表查询
     * @param model
     * @param pageParam
     * @param whereParam
     * @param option
     */
    async query(
        model: any,
        whereParam?: any,
        option?: listOptionSchema | pageOptionSchema,
    ): Promise<pageResultSchema<Model> | Array<Model>> {
        const { page, attributes, include, order }: any = option;

        const pageParams: any = this.getPageParam(page);

        // 联合查询参数
        const includeParams: any = {};
        if (attributes) {
            if (
                (Array.isArray(attributes) && attributes.length > 0) ||
                !Array.isArray(attributes)
            ) {
                includeParams.attributes = attributes;
            }
        }
        if (include) {
            includeParams.include = include;
        }

        if (order) {
            includeParams.order = order;
        }

        let result: any = {};
        const hasLimit = pageParams
            ? Object.prototype.hasOwnProperty.call(pageParams, 'limit')
            : 0;
        const hasOffset = pageParams
            ? Object.prototype.hasOwnProperty.call(pageParams, 'offset')
            : 0;
        if (pageParams && hasLimit && hasOffset) {
            // 分页查询

            pageParams.where = whereParam;

            Object.assign(pageParams, includeParams);

            // 计算总和数据去重
            if (pageParams.distinct === undefined) pageParams.distinct = true;

            result = await model.findAndCountAll(pageParams);

            return {
                page: {
                    total: result.count,
                    size: Number(page.size),
                    current: Number(page.current),
                },
                list: result.rows,
            };
        }

        // 列表查询
        const listParams = {
            where: whereParam,
        };

        Object.assign(listParams, includeParams);

        const allData = await model.findAll(listParams);
        return allData;
    }

    /**
     * 详情
     * @param model
     * @param id
     * @returns
     */
    async find(model: any, id: string | number): Promise<Model> {
        const result: Model = await model.findByPk(id);
        return result;
    }

    /**
     * 更新
     * @param model
     * @param where
     * @param params
     */
    async update(model: any, where: string | number | object, params: any) {
        if (typeof where !== 'object') {
            where = { id: where };
        }

        await model.update(params, where);
    }

    /**
     * 物理删除
     * @param model
     * @param where
     */
    async delete(model: any, where: string | number | object) {
        if (typeof where !== 'object') {
            where = { _id: where };
        }

        await model.destroy(where);
    }
}

export default new Crud();
