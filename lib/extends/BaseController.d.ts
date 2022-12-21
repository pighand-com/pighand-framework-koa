import { Context } from 'koa';
import { checkSchema } from '../utils/checkParamsUtil';
import { BaseServiceInterface } from './BaseService';
declare const BaseController: (service?: BaseServiceInterface) => {
    new (): {
        getParams(ctx: Context): any;
        result(ctx: Context, data?: any, code?: number): import("../result/result").BodySchema;
        checkParams(params: any, checks: Array<checkSchema>, parentText?: string): void;
        getIp(ctx: Context): any;
        getLoginUserInfo(ctx: Context): any;
        throw(message: string): void;
        throw(message: string, status: number): void;
        throw(message: string, data: JSON): void;
        throw(message: string, data: JSON, status: number): void;
        errorMessageFormat(message: string, data: JSON): string;
    };
};
export default BaseController;
