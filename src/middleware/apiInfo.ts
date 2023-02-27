import { Context } from 'koa';

/**
 * 接口统计
 */
export default (enableEnv: Array<string> = []) => {
    const apiInfo = async (ctx: Context, next: any) => {
        if (enableEnv.length > 0 && !enableEnv.concat(process.env.NODE_ENV)) {
            await next();
            return;
        }

        const beginTime = new Date().getTime();
        await next();
        const endTime = new Date().getTime();
        console.log(`时间：${endTime - beginTime} 接口：${ctx.url}`);
    };

    return apiInfo;
};
