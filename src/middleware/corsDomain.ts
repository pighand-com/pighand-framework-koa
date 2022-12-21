import { Context } from 'koa';

/**
 * 跨域处理
 */
export default async function corsDomain(ctx: Context, next: any) {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Credentials', 'true');
    ctx.set('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE');
    ctx.set(
        'Access-Control-Allow-Headers',
        'x-requested-with,Authorization,Content-Type,Accept',
    );

    if (ctx.method == 'OPTIONS') {
        ctx.response.status = 200;
    }

    await next();
}
