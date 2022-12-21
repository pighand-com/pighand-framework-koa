import { Context } from 'koa';
import * as mongoose from 'mongoose';
import { Model as sequelizeModel } from 'sequelize-typescript';
import DbCrud from '../db/crud';
import { whereParamConfig } from '../db/querySchema';
interface BaseServiceInterface {
    model: mongoose.Model<any> | sequelizeModel;
    db: DbCrud;
    autoWpc: whereParamConfig;
    integrationCreate(ctx: Context, params: any): Promise<mongoose.Document | sequelizeModel>;
    integrationQuery(ctx: Context, params: any): Promise<any>;
    integrationFind(id: string | number | mongoose.ObjectId): Promise<mongoose.Document | sequelizeModel>;
    integrationUpdate(ctx: Context, id: string | number | mongoose.ObjectId, params: any): Promise<void>;
    integrationDelete(ctx: Context, where: string | number | mongoose.ObjectId, now?: Date): Promise<void>;
    integrationDeleteMany(ctx: Context, where: object): Promise<void>;
}
export { BaseServiceInterface };
declare const _default: (modelObject?: mongoose.Model<any>) => {
    new (): {
        model: mongoose.Model<any> | sequelizeModel;
        db: DbCrud;
        autoWpc: whereParamConfig;
        isLogicalDelete: boolean;
        getPageOrListData(result: any): Array<any>;
        formatPageOrListResult(result: any, fun: (data: any) => any): Promise<any>;
        integrationCreate(ctx: Context, params: any): Promise<mongoose.Document<any, any, any>>;
        integrationQuery(ctx: Context, params: any): Promise<any[]>;
        integrationFind(id: string | number | mongoose.ObjectId): Promise<mongoose.Document<any, any, any>>;
        integrationUpdate(ctx: Context, id: string | number | mongoose.ObjectId, params: any): Promise<void>;
        integrationDelete(ctx: Context, id: string | number | mongoose.ObjectId): Promise<void>;
        integrationDeleteMany(ctx: Context, where: object): Promise<void>;
        getIp(ctx: Context): any;
        getLoginUserInfo(ctx: Context): any;
        throw(message: string): void;
        throw(message: string, status: number): void;
        throw(message: string, data: JSON): void;
        throw(message: string, data: JSON, status: number): void;
        errorMessageFormat(message: string, data: JSON): string;
    };
};
export default _default;
