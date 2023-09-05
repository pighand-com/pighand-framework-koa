import { Context } from 'koa';
import result from '../result/result';
import { checkParams, checkSchema } from '../utils/checkParamsUtil';
import SuperBase from './superBase';
import { BaseServiceInterface } from './BaseService';

const BaseController = (service?: BaseServiceInterface) => {
    return class BaseController extends SuperBase {
        getParams(ctx: Context): any {
            const body = ctx.body || {};
            const requestBody = ctx.request.body || {};
            const query = ctx.query || {};

            const formatObject = (obj: any) => {
                if (typeof obj !== 'object') {
                    return {};
                }

                return obj;
            };

            return {
                ...formatObject(body),
                ...formatObject(requestBody),
                ...formatObject(query),
            };
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
