import { Context } from 'koa';
import * as jwt from 'jsonwebtoken';
declare const statusKey = "loginUserInfo";
declare const checkJWT: (ctx: Context) => string | jwt.JwtPayload;
declare const setLoginUserInfo: (ctx: Context, loginUserInfo: any) => void;
declare const getLoginUserInfo: (ctx: Context) => any;
export default getLoginUserInfo;
export { statusKey, getLoginUserInfo, checkJWT, setLoginUserInfo };
