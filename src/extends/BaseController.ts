import { Context } from 'koa';
import result from '../result/result';
import { checkParams, checkSchema } from '../utils/checkParamsUtil';
import SuperBase from './superBase';
import { BaseServiceInterface } from './BaseService';

const BaseController = (service?: BaseServiceInterface) => {
    return class BaseController extends SuperBase {
        getParams(ctx: Context): any {
            return ctx.body || ctx.query;
        }

        result(ctx: Context, data?: any, code?: number) {
            return result(ctx, data, null, code);
        }

        checkParams(params: any, checks: Array<checkSchema>, parentText = '') {
            checkParams(params, checks, parentText);
        }
    };
};
export default BaseController;
