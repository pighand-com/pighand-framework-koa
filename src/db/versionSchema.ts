import { Context } from 'koa';

export abstract class versionSchema {
    ctx?: Context;
    loginUserId?: string;
    now?: Date;
}
