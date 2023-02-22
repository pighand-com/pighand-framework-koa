import { Context } from 'koa';

/**
 * 内置版本信息
 */
export abstract class versionSchema {
    ctx?: Context;
    loginUserId?: string;
    now?: Date;
}
