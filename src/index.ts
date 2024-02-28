import {
    DbVersionSchema,
    FrameworkConfigSchema,
    frameworkConfig,
    PighandFramework,
} from './frameworkConfig';

import { checkJWT, makeJWT } from './authorization/checkToken';
import {
    statusKey,
    getLoginUserInfo,
    setLoginUserInfo,
} from './authorization/loginUserInfo';

import Curd from './db/crud';
import { DbType } from './db/dbTypeEnum';
import {
    pageParams,
    pageResultSchema,
    pageOptionSchema,
    listOptionSchema,
    betweenEndingEnum,
    whereParamConfig,
} from './db/querySchema';

import errorHandler from './error/errorHandler';
import { errorMessageType, errorMessage, Throw } from './error/throw';

import BaseController from './extends/BaseController';
import BaseService from './extends/BaseService';

import apiInfo from './middleware/apiInfo';
import corsDomain from './middleware/corsDomain';

import result from './result/result';

import {
    RouterConfigInterface,
    Router,
    Controller,
    Get,
    Put,
    Post,
    Delete,
} from './router/Router';

import { checkSchema, checkParams } from './utils/checkParamsUtil';

export {
    // framework config
    DbVersionSchema,
    FrameworkConfigSchema,
    frameworkConfig,
    PighandFramework,

    // auth
    statusKey,
    getLoginUserInfo,
    setLoginUserInfo,
    checkJWT,
    makeJWT,

    // db
    Curd,
    DbType,
    pageParams,
    pageResultSchema,
    pageOptionSchema,
    listOptionSchema,
    betweenEndingEnum,
    whereParamConfig,

    // error
    errorHandler,
    errorMessageType,
    errorMessage,
    Throw,

    // extends
    BaseController,
    BaseService,

    // middleware
    apiInfo,
    corsDomain,

    // result
    result,

    // router
    RouterConfigInterface,
    Router,
    Controller,
    Get,
    Put,
    Post,
    Delete,

    // util
    checkSchema,
    checkParams,
};
