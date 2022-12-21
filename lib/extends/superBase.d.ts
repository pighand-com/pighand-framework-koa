import { Context } from 'koa';
import Throw from '../error/throw';
declare class superBase extends Throw {
    getIp(ctx: Context): any;
    getLoginUserInfo(ctx: Context): any;
}
export default superBase;
