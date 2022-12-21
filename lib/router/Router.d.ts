import 'reflect-metadata';
import * as Application from 'koa';
import * as KoaRouter from 'koa-router';
export interface RouterConfigInterface {
    app?: Application;
    router?: KoaRouter;
    basePath?: string;
    appMiddleware?: Array<(...args: any) => any>;
    routerBeforeMiddleware?: Array<(...args: any) => any>;
    controllers?: Array<string> | Array<(...args: any) => any>;
}
export declare const Router: (config: RouterConfigInterface) => {
    app: Application<Application.DefaultState, Application.DefaultContext>;
    router: KoaRouter<any, {}>;
};
export declare const Controller: (path?: string, beforeMiddleware?: Array<() => void>) => (target: any) => void;
export declare const Get: (path?: string, beforeMiddleware?: ((...args: any) => any)[]) => (target: any, propertyKey: string, descriptor: any) => void;
export declare const Put: (path?: string, beforeMiddleware?: ((...args: any) => any)[]) => (target: any, propertyKey: string, descriptor: any) => void;
export declare const Post: (path?: string, beforeMiddleware?: ((...args: any) => any)[]) => (target: any, propertyKey: string, descriptor: any) => void;
export declare const Delete: (path?: string, beforeMiddleware?: ((...args: any) => any)[]) => (target: any, propertyKey: string, descriptor: any) => void;
