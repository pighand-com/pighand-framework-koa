import 'reflect-metadata';
import * as path from 'path';
import * as glob from 'glob';
import Koa from 'koa';
import KoaRouter from 'koa-router';

import { Context } from 'koa';

interface routerControllerObject {
    [commonPath: string]: string | Array<string>;
}

/**
 * 路由配置
 */
export interface RouterConfigInterface {
    app?: Koa;
    router?: KoaRouter;
    basePath?: string;
    appMiddleware?: Array<(...args: any) => any>;
    routerBeforeMiddleware?: Array<(...args: any) => any>;
    controllers?: string | Array<string> | routerControllerObject;
}

/**
 * {controllerName: controller path}
 */
const controllerCommonPathMapping: { [commonPath: string]: string } = {};

/**
 * controller router
 */
const routerConfigs: any = [];

/**
 * 初始化router
 * @param basePath
 * @param router
 * @param beforeMiddleware
 */
function _initRouter(
    basePath: string,
    router: any,
    beforeMiddleware: Array<() => void>,
) {
    Object.keys(routerConfigs).forEach((routerConfigKey) => {
        const {
            functions = [],
            path: controllerPath = '/',
            classObject,
            beforeMiddleware: classBeforeMiddleware = [],
        } = routerConfigs[routerConfigKey];

        functions.forEach((functionItem: any) => {
            const {
                path: functionPath = '',
                method,
                functionName,
                functionObject,
                beforeMiddleware: functionBeforeMiddleware = [],
            } = functionItem;

            // 拼接url
            const routerPath = path.join(
                '/',
                basePath,
                controllerCommonPathMapping[classObject.name] || '',
                controllerPath,
                functionPath,
            );

            // 拼接middleware
            const routerFunctions = [
                ...beforeMiddleware,
                ...classBeforeMiddleware,
                ...functionBeforeMiddleware,
                functionObject.bind(new classObject()),
            ];

            // 生成router
            router[method](routerPath, ...routerFunctions);
        });
    });
}

/**
 * 路由设置
 * @param config   框架中路由配置信息
 * @returns
 */
export const Router = (config: RouterConfigInterface) => {
    const {
        app = new Koa(),
        router = new KoaRouter(),
        basePath = '/',
        appMiddleware = [],
        routerBeforeMiddleware = [],
        controllers,
    } = config;

    // string | array controller to map
    let controllerMap: routerControllerObject = {};

    if (typeof controllers === 'string' || Array.isArray(controllers)) {
        controllerMap = { '': controllers };
    } else {
        controllerMap = controllers;
    }

    // 扫描Controller文件，并引用。引用后，框架根据注解自动扫描
    Object.keys(controllerMap).forEach((controllerCommonPath) => {
        const controllerPaths: Array<any> | string =
            controllerMap[controllerCommonPath];

        [...controllerPaths].forEach((controller) => {
            const controllerPaths = glob.sync(path.normalize(controller));
            controllerPaths
                .filter((controllerPath) => controllerPath.endsWith('.js'))
                .map((controllerPath) => {
                    const requiredController = require(controllerPath).default;

                    controllerCommonPathMapping[requiredController.name] =
                        controllerCommonPath;
                });
        });
    });

    // router注入
    _initRouter(basePath, router, routerBeforeMiddleware);

    // application注入
    appMiddleware.forEach((appMiddlewareItem: any) => {
        app.use(appMiddlewareItem);
    });
    app.use(router.routes());
    app.use(router.allowedMethods());

    return { app, router };
};

/**
 * http Controller
 *
 * controller类上增加：@Controller
 * @param path  路径，方法路径会继承次路径
 * @param beforeMiddleware 中间件
 * @returns
 */
export const Controller = (
    path?: string,
    beforeMiddleware?: Array<(ctx: Context, next: any) => Promise<void>>,
) => {
    return (target: any) => {
        const { name } = target;

        const routerControllerConfig = routerConfigs[name] || {};
        const { functions = [] } = routerControllerConfig;

        if (functions && functions.length > 0) {
            routerConfigs[name] = {
                ...routerConfigs[name],
                path,
                classObject: target,
                beforeMiddleware,
            };
        }
    };
};

/**
 * 根据注解整理配置信息
 * @param className 类名
 * @param path  当前方法的api路径
 * @param method    方法类型
 * @param functionName  方法名
 * @param functionObject    方法对象
 * @param beforeMiddleware  当前方法中间件
 */
function _getRouterFunctionConfig(
    className: string,
    path: string,
    method: 'get' | 'post' | 'put' | 'delete',
    functionName: string,
    functionObject: any,
    beforeMiddleware?: Array<(ctx: Context, next: any) => Promise<void>>,
) {
    const routerControllerConfig = routerConfigs[className] || {};
    const functions = routerControllerConfig.functions || [];
    functions.push({
        path,
        method: method,
        functionName: functionName,
        functionObject,
        beforeMiddleware,
    });

    routerConfigs[className] = { functions };
}

/**
 * http Get
 *
 * controller方法上增加：@Get
 * @param path  路径
 * @param beforeMiddleware 中间件
 * @returns
 */
export const Get = (
    path?: string,
    beforeMiddleware?: Array<(ctx: Context, next: any) => Promise<void>>,
) => {
    return (target: any, propertyKey: string, descriptor: any) => {
        const { name } = target.constructor;
        const { value } = descriptor;

        _getRouterFunctionConfig(
            name,
            path,
            'get',
            propertyKey,
            value,
            beforeMiddleware,
        );
    };
};

/**
 * http Put
 *
 * controller方法上增加：@Put
 * @param path  路径
 * @param beforeMiddleware 中间件
 * @returns
 */
export const Put = (
    path?: string,
    beforeMiddleware?: Array<(ctx: Context, next: any) => Promise<void>>,
) => {
    return (target: any, propertyKey: string, descriptor: any) => {
        const { name } = target.constructor;
        const { value } = descriptor;

        _getRouterFunctionConfig(
            name,
            path,
            'put',
            propertyKey,
            value,
            beforeMiddleware,
        );
    };
};

/**
 * http Post
 *
 * controller方法上增加：@Post
 * @param path  路径
 * @param beforeMiddleware 中间件
 * @returns
 */
export const Post = (
    path?: string,
    beforeMiddleware?: Array<(ctx: Context, next: any) => Promise<void>>,
) => {
    return (target: any, propertyKey: string, descriptor: any) => {
        const { name } = target.constructor;
        const { value } = descriptor;

        _getRouterFunctionConfig(
            name,
            path,
            'post',
            propertyKey,
            value,
            beforeMiddleware,
        );
    };
};

/**
 * http Delete
 *
 * controller方法上增加：@Delete
 * @param path  路径
 * @param beforeMiddleware 中间件
 * @returns
 */
export const Delete = (
    path?: string,
    beforeMiddleware?: Array<(ctx: Context, next: any) => Promise<void>>,
) => {
    return (target: any, propertyKey: string, descriptor: any) => {
        const { name } = target.constructor;
        const { value } = descriptor;

        _getRouterFunctionConfig(
            name,
            path,
            'delete',
            propertyKey,
            value,
            beforeMiddleware,
        );
    };
};
