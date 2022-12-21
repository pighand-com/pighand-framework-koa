import { Context } from 'koa';
import result from '../result/result';
import { errorMessageType, errorMessage } from './throw';

/**
 * 异常统一处理
 */
export default async function errorHandler(ctx: Context, next: any) {
    try {
        await next();
    } catch (e) {
        if (!e.status || e.status == 500) {
            console.log(e.stack);
        }

        const status = e.status ? e.status : 500;

        let data;
        let message = e.message;
        try {
            const errorMessageFormat: errorMessage = JSON.parse(message);
            if (errorMessageFormat.type === errorMessageType) {
                data = errorMessageFormat.data;
                message = errorMessageFormat.message;
            }
        } catch (e) {}

        result(ctx, data, message, status);
    }
}
