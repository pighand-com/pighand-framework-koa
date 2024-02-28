import { Context } from 'koa';

interface BodySchema {
    code: number;
    data?: any;
    error?: any;
}

export { BodySchema };

/**
 * 格式化返回结果
 */
export default function (ctx: Context, data?: any, err?: any, code?: number) {
    const body: BodySchema = {
        code: code || 200,
        data: data === undefined || data === null ? '' : data,
        error: err || '',
    };

    ctx.response.status = code === 404 ? code : 200;
    ctx.response.type = 'application/json';
    ctx.response.body = body;

    return body;
}
