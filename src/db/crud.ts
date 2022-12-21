import Throw from '../error/throw';
import * as mongoose from 'mongoose';
import { Model as sequelizeModel } from 'sequelize-typescript';
import { DbType } from './dbTypeEnum';
import mongoCURD from './mongo/crud';
import mysqlCURD from './mysql/crud';
import {
    pageResultSchema,
    pageOptionSchema,
    listOptionSchema,
    whereParamConfig,
} from './querySchema';
import { versionSchema } from './versionSchema';
import { getLoginUserInfo } from '../authorization/loginUserInfo';
import { frameworkConfig } from '../frameworkConfig';

class Curd {
    defModelObject: mongoose.Model<any> | sequelizeModel;

    constructor(model?: mongoose.Model<any> | sequelizeModel) {
        this.defModelObject = model;
    }

    /**
     * 根据model识别数据库类型
     * @param model
     * @returns
     */
    getDbType(model?: mongoose.Model<any> | sequelizeModel) {
        model = model || this.defModelObject;

        if (!model) {
            return;
        }

        if (model instanceof mongoose.Model) {
            return DbType.MONGO;
        } else if (model instanceof sequelizeModel) {
            return DbType.MYSQL;
        }

        new Throw().throw('model类型不支持', 500);
    }

    /**
     * 根据model设置查询规则
     * @param model
     * @returns
     */
    getWhereParamConfig(model?: mongoose.Model<any> | sequelizeModel) {
        const realModel = model || this.defModelObject;
        if (!realModel) {
            return;
        }

        const dbType = this.getDbType(realModel);
        if (dbType === DbType.MYSQL) {
            return mysqlCURD.getWhereParamConfig(model || this.defModelObject);
        } else if (dbType === DbType.MONGO) {
            const models = model || this.defModelObject;
            return mongoCURD.getWhereParamConfig(
                realModel as mongoose.Model<any>,
            );
        }
    }

    /**
     * 使用实例化model创建
     * @param params
     * @param version
     */
    async create(
        params: object,
        version?: versionSchema,
    ): Promise<mongoose.Document>;

    /**
     * 根据model创建
     * @param model
     * @param params
     * @param version
     */
    async create(
        params: object,
        model: mongoose.Model<any> | sequelizeModel,
        version?: versionSchema,
    ): Promise<mongoose.Document>;

    /**
     * 创建
     * @param model
     * @param params
     * @param version
     * @returns
     */
    async create(
        params: object,
        modelOrVersion: mongoose.Model<any> | sequelizeModel | versionSchema,
        version?: versionSchema,
    ) {
        let realModel = this.defModelObject;
        if (modelOrVersion instanceof versionSchema) {
            version = modelOrVersion;
        } else {
            realModel = modelOrVersion;
        }

        const dbType = this.getDbType(realModel);

        let { now = new Date(), loginUserId, ctx } = version || {};
        if (!loginUserId && ctx) {
            const loginUserInfo: any = getLoginUserInfo(ctx);
            loginUserId = loginUserInfo[frameworkConfig.jwt_user_id];
        }
        const createParams = {
            [frameworkConfig.dbVersion.createdAtColumn]: now,
            [frameworkConfig.dbVersion.creatorColumn]: loginUserId,
            [frameworkConfig.dbVersion.updatedAtColumn]: now,
            [frameworkConfig.dbVersion.updaterColumn]: loginUserId,
            [frameworkConfig.dbVersion.logicalDeleteColumn]: [
                frameworkConfig.dbVersion.logicalDeleteFalse,
            ],
            ...(params || {}),
        };

        if (dbType === DbType.MYSQL) {
            return await mysqlCURD.create(realModel, createParams);
        } else if (dbType === DbType.MONGO) {
            return await mongoCURD.create(
                realModel as mongoose.Model<any>,
                createParams,
            );
        }
    }

    /**
     * 使用实例化model设置查询参数
     * @param wpc
     * @param params
     * @returns
     */
    getWhereParam(wpc: whereParamConfig, params: any): any;

    /**
     * 根据model设置查询参数
     * @param model
     * @param params
     * @returns
     */
    getWhereParam(
        model: mongoose.Model<any> | sequelizeModel,
        params: any,
    ): any;

    /**
     * 设置查询参数
     * @param wpc
     * @param params
     * @returns
     */
    getWhereParam(
        wpcOrModel: whereParamConfig | mongoose.Model<any> | sequelizeModel,
        params: any,
    ) {
        let wpc = wpcOrModel;
        let realModel = this.defModelObject;

        if (
            wpcOrModel instanceof mongoose.Model<any> ||
            wpcOrModel instanceof sequelizeModel
        ) {
            wpc = this.getWhereParamConfig(
                wpcOrModel as mongoose.Model<any> | sequelizeModel,
            );
            realModel = wpcOrModel as mongoose.Model<any> | sequelizeModel;
        }

        const dbType = this.getDbType(realModel);

        if (dbType === DbType.MYSQL) {
            return mysqlCURD.getWhereParam(wpc as whereParamConfig, params);
        } else if (dbType === DbType.MONGO) {
            return mongoCURD.getWhereParam(wpc as whereParamConfig, params);
        }
    }

    /**
     * 分页查询
     * @param model
     * @param whereParam
     * @param option
     */
    async query(
        whereParam: object,
        option: pageOptionSchema,
    ): Promise<pageResultSchema<any>>;

    /**
     * 分页查询
     * @param model
     * @param whereParam
     * @param option
     */
    async query(
        whereParam: object,
        model: mongoose.Model<any>,
        option: pageOptionSchema,
    ): Promise<pageResultSchema<any>>;

    /**
     * 列表查询
     * @param model
     * @param whereParam
     * @param option
     */
    async query(
        whereParam: object,
        option?: listOptionSchema,
    ): Promise<Array<any>>;

    /**
     * 列表查询
     * @param model
     * @param whereParam
     * @param option
     */
    async query(
        whereParam: object,
        model: mongoose.Model<any>,
        option?: listOptionSchema,
    ): Promise<Array<any>>;

    /**
     * 分页或列表查询
     * @param model
     * @param pageParam
     * @param whereParam
     * @param option
     */
    async query(
        whereParam: any,
        model?:
            | mongoose.Model<any>
            | sequelizeModel
            | listOptionSchema
            | pageOptionSchema,
        option?: listOptionSchema | pageOptionSchema,
    ): Promise<pageResultSchema<any> | Array<any>> {
        let realModel = this.defModelObject;
        let realOption = option;

        if (
            model instanceof listOptionSchema ||
            model instanceof pageOptionSchema
        ) {
            realOption = model;
        } else {
            realModel = model;
        }

        const dbType = this.getDbType(realModel);
        if (dbType === DbType.MYSQL) {
            return await mysqlCURD.query(realModel, whereParam, realOption);
        } else if (dbType === DbType.MONGO) {
            return await mongoCURD.query(
                realModel as mongoose.Model<any>,
                whereParam,
                realOption,
            );
        }
    }

    /**
     * 使用实例化model详情查询
     * @param id
     */
    async find(
        id: string | number | mongoose.ObjectId,
    ): Promise<mongoose.Document>;

    /**
     * 根据model详情查询
     * @param id
     */
    async find(
        id: string | number | mongoose.ObjectId,
        model: mongoose.Model<any> | sequelizeModel,
    ): Promise<mongoose.Document>;

    /**
     * 详情查询
     * @param id
     */
    async find(
        id: string | number | mongoose.ObjectId,
        model?: mongoose.Model<any> | sequelizeModel,
    ) {
        const realModel = model || this.defModelObject;
        const dbType = this.getDbType(realModel);

        if (dbType === DbType.MYSQL) {
            return await mysqlCURD.find(realModel, id as string | number);
        } else if (dbType === DbType.MONGO) {
            return await mongoCURD.find(realModel as mongoose.Model<any>, id);
        }
    }

    /**
     * 使用实例化model修改
     * @param where id 或 对象
     * @param params
     */
    async update(
        where: string | number | mongoose.ObjectId | object,
        params: any,
        version?: versionSchema,
    ): Promise<void>;

    /**
     * 根据model修改
     * @param ctx
     * @param where id 或 对象
     * @param params
     */
    async update(
        where: string | number | mongoose.ObjectId | object,
        params: object,
        model: mongoose.Model<any> | sequelizeModel,
        version?: versionSchema,
    ): Promise<void>;

    /**
     * 修改
     * @param ctx
     * @param id
     * @param params
     */
    async update(
        where: string | number | mongoose.ObjectId | object,
        params: object,
        model?: mongoose.Model<any> | sequelizeModel | versionSchema,
        version?: versionSchema,
    ) {
        let realModel = this.defModelObject;
        if (model instanceof versionSchema) {
            version = model;
        } else {
            realModel = model;
        }

        const dbType = this.getDbType(realModel);

        let { now = new Date(), loginUserId, ctx } = version || {};
        if (!loginUserId && ctx) {
            const loginUserInfo = getLoginUserInfo(ctx);
            loginUserId = loginUserInfo[frameworkConfig.jwt_user_id];
        }

        const updateParams = {
            [frameworkConfig.dbVersion.updatedAtColumn]: now,
            [frameworkConfig.dbVersion.updaterColumn]: loginUserId,
            ...params,
        };

        if (dbType === DbType.MYSQL) {
            await mysqlCURD.update(model, updateParams, params);
        } else if (dbType === DbType.MONGO) {
            await mongoCURD.update(
                model as mongoose.Model<any>,
                updateParams,
                params,
            );
        }
    }

    /**
     * 逻辑删除
     * @param ctx
     * @param model
     * @param id
     * @param now
     */
    async logicalDelete(
        model: mongoose.Model<any> | sequelizeModel,
        id: string | number | mongoose.ObjectId,
        version?: versionSchema,
    ): Promise<void>;

    /**
     * 逻辑删除
     * @param ctx
     * @param model
     * @param id
     * @param now
     */
    async logicalDelete(
        model: mongoose.Model<any> | sequelizeModel,
        where: object,
        version?: versionSchema,
    ): Promise<void>;

    /**
     * 逻辑删除
     * @param model
     * @param ctx
     * @param id
     * @param where
     * @param now
     * @returns
     */
    async logicalDelete(
        model: mongoose.Model<any> | sequelizeModel,
        where: string | number | mongoose.ObjectId | object,
        version?: versionSchema,
    ) {
        const realModel = model || this.defModelObject;
        const dbType = this.getDbType(realModel);

        let whereParams = where;
        if (
            where instanceof String ||
            where instanceof Number ||
            mongoose.isValidObjectId(where)
        ) {
            whereParams = {
                [frameworkConfig.jwt_user_id]: where,
            };
        }

        let { now = new Date(), loginUserId, ctx } = version || {};
        if (!loginUserId && ctx) {
            const loginUserInfo = getLoginUserInfo(ctx);
            loginUserId = loginUserInfo[frameworkConfig.jwt_user_id];
        }

        const updateParams = {
            [frameworkConfig.dbVersion.logicalDeleteColumn]: [
                frameworkConfig.dbVersion.logicalDeleteTrue,
            ],
            [frameworkConfig.dbVersion.logicalDeletedAtColumn]: now,
            [frameworkConfig.dbVersion.logicalDeleterColumn]: loginUserId,
        };

        if (dbType === DbType.MYSQL) {
            await mysqlCURD.update(realModel, whereParams, updateParams);
        } else if (dbType === DbType.MONGO) {
            await mongoCURD.update(
                realModel as mongoose.Model<any>,
                whereParams,
                updateParams,
            );
        }
    }

    /**
     * 根据id物理删除
     * @param model
     * @param id
     */
    async physicsDelete(id: string | number | mongoose.ObjectId): Promise<void>;

    /**
     * 根据id物理删除
     * @param model
     * @param id
     */
    async physicsDelete(
        id: string | number | mongoose.ObjectId,
        model: mongoose.Model<any> | sequelizeModel,
    ): Promise<void>;

    /**
     * 根据条件物理删除
     * @param model
     * @param where
     */
    async physicsDelete(where: object): Promise<void>;

    /**
     * 根据条件物理删除
     * @param model
     * @param where
     */
    async physicsDelete(
        where: object,
        model: mongoose.Model<any> | sequelizeModel,
    ): Promise<void>;

    /**
     * 物理删除
     * @param model
     * @param where
     */
    async physicsDelete(
        where: string | number | mongoose.ObjectId | object,
        model?: mongoose.Model<any>,
    ) {
        const realModel: any = model || this.defModelObject;
        const dbType = this.getDbType(realModel);

        let whereParams = where;
        if (
            where instanceof String ||
            where instanceof Number ||
            mongoose.isValidObjectId(where)
        ) {
            whereParams = {
                [frameworkConfig.jwt_user_id]: where,
            };
        }

        if (dbType === DbType.MYSQL) {
            await mysqlCURD.delete(realModel, whereParams);
        } else if (dbType === DbType.MONGO) {
            await mongoCURD.delete(realModel, whereParams);
        }
    }
}
export default Curd;
