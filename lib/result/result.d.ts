import { Context } from 'koa';
interface BodySchema {
    code: number;
    data?: any;
    error?: any;
}
export { BodySchema };
export default function (ctx: Context, data?: any, err?: any, code?: number): BodySchema;
