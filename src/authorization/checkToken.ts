import { Context } from 'koa';
import { checkJWT, setLoginUserInfo } from './loginUserInfo';

/**
 * 校验token
 */
export default function checkToken(isCheckToken = true) {
    return async (ctx: Context, next: any) => {
        const header = ctx.header;
        if (header['authorization']) {
            let loginUserInfo: any = {};
            try {
                loginUserInfo = checkJWT(ctx);
            } catch (e) {
                if (isCheckToken) {
                    ctx.throw(401, '无权限');
                }
            }

            setLoginUserInfo(ctx, loginUserInfo);
        } else {
            if (isCheckToken) {
                ctx.throw(401, '无权限');
            }
        }

        await next();
    };
}
