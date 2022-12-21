"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete = exports.Post = exports.Put = exports.Get = exports.Controller = exports.Router = void 0;
require("reflect-metadata");
const path = require("path");
const glob = require("glob");
const Application = require("koa");
const KoaRouter = require("koa-router");
const routerConfigs = [];
function _initRouter(basePath, router, beforeMiddleware) {
    Object.keys(routerConfigs).forEach((routerConfigKey) => {
        const { functions = [], path: controllerPath = '/', classObject, beforeMiddleware: classBeforeMiddleware = [], } = routerConfigs[routerConfigKey];
        functions.forEach((functionItem) => {
            const { path: functionPath = '', method, functionName, functionObject, beforeMiddleware: functionBeforeMiddleware = [], } = functionItem;
            const routerPath = path.join('/', basePath, controllerPath, functionPath);
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
const Router = (config) => {
    const { app = new Application(), router = new KoaRouter(), basePath = '/', appMiddleware = [], routerBeforeMiddleware = [], controllers, } = config;
    controllers.forEach((controller) => {
        if (typeof controller === 'string') {
            const controllerPaths = glob.sync(path.normalize(controller));
            controllerPaths
                .filter((controllerPath) => controllerPath.endsWith('.js'))
                .map((controllerPath) => require(controllerPath).default);
        }
    });
    _initRouter(basePath, router, routerBeforeMiddleware);
    appMiddleware.forEach((appMiddlewareItem) => {
        app.use(appMiddlewareItem);
    });
    app.use(router.routes());
    return { app, router };
};
exports.Router = Router;
const Controller = (path, beforeMiddleware) => {
    return (target) => {
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
exports.Controller = Controller;
function _getRouterFunctionConfig(className, path, method, functionName, functionObject, beforeMiddleware) {
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
const Get = (path, beforeMiddleware) => {
    return (target, propertyKey, descriptor) => {
        const { name } = target.constructor;
        const { value } = descriptor;
        _getRouterFunctionConfig(name, path, 'get', propertyKey, value, beforeMiddleware);
    };
};
exports.Get = Get;
const Put = (path, beforeMiddleware) => {
    return (target, propertyKey, descriptor) => {
        const { name } = target.constructor;
        const { value } = descriptor;
        _getRouterFunctionConfig(name, path, 'put', propertyKey, value, beforeMiddleware);
    };
};
exports.Put = Put;
const Post = (path, beforeMiddleware) => {
    return (target, propertyKey, descriptor) => {
        const { name } = target.constructor;
        const { value } = descriptor;
        _getRouterFunctionConfig(name, path, 'post', propertyKey, value, beforeMiddleware);
    };
};
exports.Post = Post;
const Delete = (path, beforeMiddleware) => {
    return (target, propertyKey, descriptor) => {
        const { name } = target.constructor;
        const { value } = descriptor;
        _getRouterFunctionConfig(name, path, 'delete', propertyKey, value, beforeMiddleware);
    };
};
exports.Delete = Delete;
//# sourceMappingURL=Router.js.map