import * as mongoose from 'mongoose';
import { pageResultSchema, listOptionSchema, pageOptionSchema, whereParamConfig } from '../querySchema';
declare class Crud {
    objectIdColumn: Array<string>;
    create(model: mongoose.Model<any>, params: object): Promise<mongoose.Document>;
    getWhereParamConfig(model: mongoose.Model<any>): whereParamConfig;
    getWhereParam(wpc: whereParamConfig, params: any): any;
    query(model: mongoose.Model<any>, whereParam?: any, option?: pageOptionSchema): Promise<pageResultSchema<mongoose.Document>>;
    query(model: mongoose.Model<any>, whereParam?: any, option?: listOptionSchema): Promise<Array<mongoose.Document>>;
    find(model: mongoose.Model<any>, id: string | number | mongoose.ObjectId): Promise<mongoose.Document>;
    update(model: mongoose.Model<any>, where: string | number | mongoose.ObjectId | object, params: any): Promise<void>;
    delete(model: mongoose.Model<any>, where: string | number | mongoose.ObjectId | object): Promise<void>;
}
declare const _default: Crud;
export default _default;
