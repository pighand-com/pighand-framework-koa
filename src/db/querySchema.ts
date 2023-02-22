/**
 * 分页参数
 */
export interface pageParams {
    size: number | string; // 每页数量
    current: number | string; // 当前页数
}

/**
 * 分页返回信息
 */
export interface pageResultSchema<T> {
    // 分页信息
    page: {
        total: number;
        size: number;
        current: number;
    };

    // 返回数据
    list: Array<T>;
}

/**
 * 分页查询参数
 */
export interface pageOptionSchema extends queryOptionSchema {
    page: pageParams;
}

/**
 * 列表查询参数
 */
export type listOptionSchema = queryOptionSchema;

/**
 * 内置查询支持参数
 */
interface queryOptionSchema {
    /**
     * mongoose
     */
    lookups?: any;
    project?: any;
    sort?: any;
    unwinds?: Array<any>;

    /**
     * sequelize
     */
    attributes?: any;
    include?: any;
    order?: any;
}

export enum betweenEndingEnum {
    BEGIN = 'begin',
    END = 'end',
}

/**
 * 查询支持参数
 */
export interface whereParamConfig {
    like?: Array<string>;
    eq?: Array<string>;
    between?: Array<string>;
    in?: any;
    def?: any;
    mongoObjectIdColumns?: Array<string>;
}
