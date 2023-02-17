import { Context } from 'koa';
import * as mongoose from 'mongoose';
import { ModelStatic } from 'sequelize-typescript';

import DbCrud from '../db/crud';
import SuperBase from './superBase';
import { DbType } from '../db/dbTypeEnum';
import { whereParamConfig } from '../db/querySchema';
import { pageOptionSchema, listOptionSchema } from '../db/querySchema';

interface BaseServiceInterface {
    model: mongoose.Model<any> | ModelStatic;
    db: DbCrud;
    autoWpc: whereParamConfig;

    /**
     * 内置创建
     * @param ctx
     * @param params
     */
    integrationCreate(
        ctx: Context,
        params: any,
    ): Promise<mongoose.Document | ModelStatic>;

    /**
     * 内置列表、分页查询
     * @param ctx
     * @param params
     */
    integrationQuery(ctx: Context, params: any): Promise<any>;

    /**
     * 内置详情查询
     * @param id
     */
    integrationFind(
        id: string | number | mongoose.ObjectId,
    ): Promise<mongoose.Document | ModelStatic>;

    /**
     * 内置修改
     * @param ctx
     * @param id
     * @param params
     */
    integrationUpdate(
        ctx: Context,
        id: string | number | mongoose.ObjectId,
        params: any,
    ): Promise<void>;

    /**
     * 内置删除
     * @param ctx
     * @param id
     */
    integrationDelete(
        ctx: Context,
        where: string | number | mongoose.ObjectId,
        now?: Date,
    ): Promise<void>;

    /**
     * 内置条件删除
     * @param ctx
     * @param id
     */
    integrationDeleteMany(ctx: Context, where: object): Promise<void>;
}
export { BaseServiceInterface };

export default (modelObject?: mongoose.Model<any> | ModelStatic) => {
    return class BaseService extends SuperBase implements BaseServiceInterface {
        model: mongoose.Model<any> | ModelStatic;

        // 数据库操作
        db: DbCrud;

        // 默认查询配置
        autoWpc: whereParamConfig;

        // 是否是逻辑删除
        isLogicalDelete = false;

        constructor() {
            super();

            this.model = modelObject;
            this.db = new DbCrud(this.model);
            this.autoWpc = this.db.getWhereParamConfig();

            // 根据删除字段判断是否是逻辑删除
            const dbType = this.db.getDbType();
            if (dbType == DbType.MONGO) {
                const { schema = {} } =
                    (this.model as mongoose.Model<any>) || {};
                const { paths = {} }: any = schema;
                if (paths['deleted'] || paths['delete']) {
                    this.isLogicalDelete = true;
                }
            } else if (dbType == DbType.MYSQL) {
                const schema: any = (this.model as ModelStatic) || {};
                if (schema['deleted'] || schema['delete']) {
                    this.isLogicalDelete = true;
                }
            }
        }

        /**
         * 获取查询返回值数据
         * @param result
         * @returns
         */
        getPageOrListData(result: any): Array<any> {
            const data = Array.isArray(result) ? result : result.list;
            return data;
        }

        /**
         * 格式化返回值
         * @param result
         * @param fun
         * @returns
         */
        async formatPageOrListResult(result: any, fun: (data: any) => any) {
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

        /**
         * 内置创建
         * @param ctx
         * @param params
         */
        async integrationCreate(ctx: Context, params: any) {
            return await this.db.create(params, { ctx });
        }

        /**
         * 内置列表、分页查询
         * @param ctx
         * @param params
         */
        async integrationQuery(ctx: Context, params: any) {
            const where = await this.db.getWhereParam(this.autoWpc, params);
            return await this.db.query(where, { page: params } as
                | pageOptionSchema
                | listOptionSchema);
        }

        /**
         * 内置详情查询
         * @param id
         */
        async integrationFind(id: string | number | mongoose.ObjectId) {
            return await this.db.find(id);
        }

        /**
         * 内置修改
         * @param ctx
         * @param id
         * @param params
         */
        async integrationUpdate(
            ctx: Context,
            id: string | number | mongoose.ObjectId,
            params: any,
        ) {
            await this.db.update(id, params, { ctx });
        }

        /**
         * 内置删除
         * @param ctx
         * @param id
         */
        async integrationDelete(
            ctx: Context,
            id: string | number | mongoose.ObjectId,
        ) {
            if (this.isLogicalDelete) {
                await this.db.logicalDelete(this.model, id, { ctx });
            } else {
                await this.db.physicsDelete(id);
            }
        }

        /**
         * 内置条件删除
         * @param ctx
         * @param id
         */
        async integrationDeleteMany(ctx: Context, where: object) {
            if (this.isLogicalDelete) {
                await this.db.logicalDelete(this.model, where, { ctx });
            } else {
                await this.db.physicsDelete(where);
            }
        }
    };
};
