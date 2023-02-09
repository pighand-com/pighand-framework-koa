import { Context } from 'koa';
import * as jwt from 'jsonwebtoken';

import { frameworkConfig } from '../frameworkConfig';

const tokenHeaderKey = 'authorization';
const statusKey = 'loginUserInfo';

/**
 * 解析JWT
 * @param ctx
 * @returns
 */
const analysisJWT = (ctx: Context) => {
    const header = ctx.header;

    if (!header[tokenHeaderKey]) {
        return;
    }

    const loginUserInfo = jwt.verify(
        header[tokenHeaderKey],
        frameworkConfig.jwt_salt,
    );

    return loginUserInfo;
};

/**
 * 在上下文中添加用户信息
 * @param ctx
 * @param loginUserInfo
 */
const setLoginUserInfo = (ctx: Context, loginUserInfo: any) => {
    ctx.state[statusKey] = loginUserInfo;
};

/**
 * 在上下文中获取用户信息
 * @param ctx
 * @returns
 */
const getLoginUserInfo = (ctx: Context) => {
    let loginUserInfo: any = ctx.state[statusKey];

    if (!loginUserInfo) {
        try {
            loginUserInfo = analysisJWT(ctx);
        } catch (e) {}
    }

    return loginUserInfo || {};
};

export default getLoginUserInfo;

export {
    tokenHeaderKey,
    statusKey,
    getLoginUserInfo,
    analysisJWT,
    setLoginUserInfo,
};
