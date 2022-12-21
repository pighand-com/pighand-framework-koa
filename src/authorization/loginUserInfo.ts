import { Context } from 'koa';
import * as jwt from 'jsonwebtoken';

import { frameworkConfig } from '../frameworkConfig';

const statusKey = 'loginUserInfo';

const checkJWT = (ctx: Context) => {
    const header = ctx.header;

    const loginUserInfo = jwt.verify(
        header['authorization'],
        frameworkConfig.jwt_salt,
    );

    return loginUserInfo;
};

const setLoginUserInfo = (ctx: Context, loginUserInfo: any) => {
    ctx.state[statusKey] = loginUserInfo;
};

const getLoginUserInfo = (ctx: Context) => {
    let loginUserInfo: any = ctx.state[statusKey];

    if (!loginUserInfo) {
        try {
            loginUserInfo = checkJWT(ctx);
        } catch (e) {}
    }

    return loginUserInfo || {};
};

export default getLoginUserInfo;

export { statusKey, getLoginUserInfo, checkJWT, setLoginUserInfo };
