import { Context } from 'koa';
import Throw from '../error/throw';
import { getLoginUserInfo } from '../authorization/loginUserInfo';

class superBase extends Throw {
    getIp(ctx: Context) {
        const req: any = ctx.req;
        return (
            req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
            req.connection.remoteAddress || // 判断 connection 的远程 IP
            req.socket.remoteAddress || // 判断后端的 socket 的 IP
            req.connection.socket.remoteAddress
        );
    }

    getLoginUserInfo(ctx: Context) {
        return getLoginUserInfo(ctx);
    }
}

export default superBase;
