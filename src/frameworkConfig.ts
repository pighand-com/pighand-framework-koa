import Application from 'koa';
import KoaRouter from 'koa-router';
import KoaBody from 'koa-body';
import KoaHelmet from 'koa-helmet';

import { RouterConfigInterface, Router } from './router/Router';

/**
 * 数据库版本信息
 */
export interface DbVersionSchema {
    /**
     * 逻辑删除 - 删除字段，默认值“deleted”
     */
    logicalDeleteColumn?: string;

    /**
     * 逻辑删除 - 已删除值，默认值“true”
     */
    logicalDeleteTrue?: string | number | boolean;

    /**
     * 逻辑删除 - 未删除值，默认值“false”
     */
    logicalDeleteFalse?: string | number | boolean;

    /**
     * 逻辑删除 - 删除人字段，默认值“deleterId”
     */
    logicalDeleterColumn?: string;

    /**
     * 逻辑删除 - 删除时间字段，默认值“deletedAt”
     */
    logicalDeletedAtColumn?: string;

    /**
     * 创建人字段，默认值“creatorId”
     */
    creatorColumn?: string;

    /**
     * 创建时间字段，默认值“createdAt”
     */
    createdAtColumn?: string;

    /**
     * 更新人字段，默认值“updaterId”
     */
    updaterColumn?: string;

    /**
     * 更新时间字段，默认值“updatedAt”
     */
    updatedAtColumn?: string;
}

/**
 * 框架配置项
 */
export interface FrameworkConfigSchema {
    /**
     * jwt加密所用，默认“Qwe_1A2s3d”
     */
    jwt_salt?: string;

    /**
     * jwt过期时间，单位秒，默认7天
     */
    jwt_expires_in?: number;

    /**
     * jwt中用户唯一标识字段，默认“id”
     */
    jwt_user_id?: string;

    /**
     * router配置
     */
    router_config?: RouterConfigInterface;

    /**
     * 数据库版本信息
     */
    dbVersion?: DbVersionSchema;

    /**
     * 根据查询规则获取查询条件时，字段映射
     *
     * curd.getWhereParam()中使用此参数，自动映射
     *
     * @params {object} { 'queryColumn': 'dbColumn' }
     */
    wpcColumnMapping?: any;

    /**
     * 排除默认中间件
     * KoaBody | KoaHelmet
     */
    excludeDefaultMiddleware?: Array<'KoaBody' | 'KoaHelmet'>;
}

/**
 * 默认值
 */
export const frameworkConfig: FrameworkConfigSchema = {
    jwt_salt: 'Qwe_1A2s3d!',
    jwt_expires_in: 1 * 60 * 60 * 24 * 7,
    jwt_user_id: 'id',

    dbVersion: {
        logicalDeleteColumn: 'deleted',
        logicalDeleteTrue: true,
        logicalDeleteFalse: false,
        logicalDeleterColumn: 'deleterId',
        creatorColumn: 'creatorId',
        logicalDeletedAtColumn: 'deletedAt',
        createdAtColumn: 'createdAt',
        updaterColumn: 'updaterId',
        updatedAtColumn: 'updatedAt',
    },
};

export const PighandFramework = (fc: FrameworkConfigSchema) => {
    frameworkConfig.jwt_salt = fc.jwt_salt || frameworkConfig.jwt_salt;
    frameworkConfig.jwt_expires_in =
        fc.jwt_expires_in || frameworkConfig.jwt_expires_in;
    frameworkConfig.jwt_user_id = fc.jwt_user_id || frameworkConfig.jwt_user_id;
    frameworkConfig.dbVersion = fc.dbVersion || frameworkConfig.dbVersion;
    frameworkConfig.wpcColumnMapping =
        fc.wpcColumnMapping || frameworkConfig.wpcColumnMapping;

    // 默认中间件
    const defaultMiddleware = [];
    const excludeDefaultMiddleware = fc.excludeDefaultMiddleware || [];
    if (!excludeDefaultMiddleware.includes('KoaBody')) {
        defaultMiddleware.push(KoaBody({ multipart: true }));
    }
    if (!excludeDefaultMiddleware.includes('KoaHelmet')) {
        defaultMiddleware.push(KoaHelmet());
    }

    const routerConfig: RouterConfigInterface = fc.router_config || {
        app: new Application(),
        router: new KoaRouter(),
    };

    routerConfig.appMiddleware = [
        ...defaultMiddleware,
        ...(routerConfig.appMiddleware || []),
    ];

    frameworkConfig.router_config = routerConfig;
    const router = Router(routerConfig);

    return { app: router.app, router: router.router };
};

export default PighandFramework;
