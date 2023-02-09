import { Context } from 'koa';
import * as jwt from 'jsonwebtoken';
import { tokenHeaderKey, analysisJWT, setLoginUserInfo } from './loginUserInfo';

import { frameworkConfig } from '../frameworkConfig';

/**
 * 生成JWT
 */
export const makeJWT = (loginUserInfo: string | Buffer | object) => {
    return jwt.sign(loginUserInfo, frameworkConfig.jwt_salt);
};

/**
 * 校验JWT
 * @param isCheckToken token是否必传，默认true
 */
export const checkJWT = (isCheckToken = true) => {
    return async (ctx: Context, next: any) => {
        const header = ctx.header;
        if (header[tokenHeaderKey]) {
            let loginUserInfo: any = {};
            try {
                loginUserInfo = analysisJWT(ctx);
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
};
