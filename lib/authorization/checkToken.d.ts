import { Context } from 'koa';
export default function checkToken(isCheckToken?: boolean): (ctx: Context, next: any) => Promise<void>;
