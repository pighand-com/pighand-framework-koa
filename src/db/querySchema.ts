export interface pageParams {
    size: number | string;
    current: number | string;
}

export interface pageResultSchema<T> {
    page: {
        total: number;
        size: number;
        current: number;
    };
    list: Array<T>;
}

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

export interface pageOptionSchema extends queryOptionSchema {
    page: pageParams;
}

export type listOptionSchema = queryOptionSchema;

export enum betweenEndingEnum {
    BEGIN = 'begin',
    END = 'end',
}

export interface whereParamConfig {
    like?: Array<string>;
    eq?: Array<string>;
    between?: Array<string>;
    in?: any;
    def?: any;
    mongoObjectIdColumns?: Array<string>;
}
