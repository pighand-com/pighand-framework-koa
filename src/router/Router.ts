import 'reflect-metadata';
import * as path from 'path';
import * as glob from 'glob';
import Koa from 'koa';
import KoaRouter from 'koa-router';

import { Context } from 'koa';

export interface RouterConfigInterface {
    app?: Koa;
    router?: KoaRouter;
    basePath?: string;
    appMiddleware?: Array<(...args: any) => any>;
    routerBeforeMiddleware?: Array<(...args: any) => any>;
    controllers?: Array<string> | Array<(...args: any) => any>;
}

const routerConfigs: any = [];

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

            const routerPath = path.join(
                '/',
                basePath,
                controllerPath,
                functionPath,
            );

            const routerFunctions = [
                ...beforeMiddleware,
                ...classBeforeMiddleware,
                ...functionBeforeMiddleware,
                functionObject.bind(classObject),
            ];

            router[method](routerPath, ...routerFunctions);
        });
    });
}

export const Router = (config: RouterConfigInterface) => {
    const {
        app = new Koa(),
        router = new KoaRouter(),
        basePath = '/',
        appMiddleware = [],
        routerBeforeMiddleware = [],
        controllers,
    } = config;

    controllers.forEach((controller) => {
        if (typeof controller === 'string') {
            const controllerPaths = glob.sync(path.normalize(controller));

            controllerPaths
                .filter((controllerPath) => controllerPath.endsWith('.js'))
                .map((controllerPath) => require(controllerPath).default);
        }
    });

    _initRouter(basePath, router, routerBeforeMiddleware);

    appMiddleware.forEach((appMiddlewareItem: any) => {
        app.use(appMiddlewareItem);
    });
    app.use(router.routes());

    return { app, router };
};

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
