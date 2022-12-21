import { Model } from 'sequelize';
import { pageResultSchema, listOptionSchema, pageOptionSchema, whereParamConfig } from '../querySchema';
declare class Crud {
    objectIdColumn: Array<string>;
    create(model: any, params: object): Promise<any>;
    getWhereParamConfig(model: any): whereParamConfig;
    getWhereParam(wpc: whereParamConfig, params: any): any;
    getPageParam(params: any): {
        limit: number;
        offset: number;
    };
    query(model: any, whereParam?: any, option?: pageOptionSchema): Promise<pageResultSchema<Model>>;
    query(model: any, whereParam?: any, option?: listOptionSchema): Promise<Array<Model>>;
    find(model: any, id: string | number): Promise<Model>;
    update(model: any, where: string | number | object, params: any): Promise<void>;
    delete(model: any, where: string | number | object): Promise<void>;
}
declare const _default: Crud;
export default _default;
