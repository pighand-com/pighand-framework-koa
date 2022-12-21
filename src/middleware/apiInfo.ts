import { Context } from 'koa';

/**
 * 接口统计
 */
export default async function apiInfo(ctx: Context, next: any) {
    const beginTime = new Date().getTime();
    await next();
    const endTime = new Date().getTime();
    console.log(`时间：${endTime - beginTime} 接口：${ctx.url}`);
}
