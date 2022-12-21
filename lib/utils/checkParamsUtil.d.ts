export interface checkSchema {
    key: string;
    required?: boolean;
    dataType?: string;
    jsonDataType?: string;
    jsonCheckData?: Array<checkSchema>;
    jsonAllowMoreKey?: boolean;
    lengthMin?: number;
    lengthMax?: number;
    regexType?: string;
    parentText?: string;
}
export declare const checkParams: (params: any, checks: Array<checkSchema>, parentText?: string) => void;
