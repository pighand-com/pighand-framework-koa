import * as Application from 'koa';
import * as KoaRouter from 'koa-router';
import { RouterConfigInterface } from './router/Router';
export interface DbVersionSchema {
    logicalDeleteColumn?: string;
    logicalDeleteTrue?: string | number | boolean;
    logicalDeleteFalse?: string | number | boolean;
    logicalDeleterColumn?: string;
    logicalDeletedAtColumn?: string;
    creatorColumn?: string;
    createdAtColumn?: string;
    updaterColumn?: string;
    updatedAtColumn?: string;
}
export interface FrameworkConfigSchema {
    jwt_salt?: string;
    jwt_user_id?: string;
    router_config?: RouterConfigInterface;
    dbVersion?: DbVersionSchema;
    wpcColumnMapping?: any;
}
export declare const frameworkConfig: FrameworkConfigSchema;
export declare const PighandFramework: (fc: FrameworkConfigSchema) => {
    app: Application<Application.DefaultState, Application.DefaultContext>;
    router: KoaRouter<any, {}>;
};
export default PighandFramework;
