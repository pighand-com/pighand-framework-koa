"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PighandFramework = exports.frameworkConfig = void 0;
const Application = require("koa");
const KoaRouter = require("koa-router");
const Router_1 = require("./router/Router");
exports.frameworkConfig = {
    jwt_salt: 'Qwe_1A2s3d!',
    jwt_user_id: 'id',
    dbVersion: {
        logicalDeleteColumn: 'deleted',
        logicalDeleteTrue: true,
        logicalDeleteFalse: false,
        logicalDeleterColumn: 'deleterId',
        creatorColumn: 'creatorId',
        logicalDeletedAtColumn: 'deletedAt',
        createdAtColumn: 'createdAt',
        updaterColumn: 'updaterId',
        updatedAtColumn: 'updatedAt',
    },
};
const PighandFramework = (fc) => {
    exports.frameworkConfig.jwt_salt = fc.jwt_salt || exports.frameworkConfig.jwt_salt;
    exports.frameworkConfig.jwt_user_id = fc.jwt_user_id || exports.frameworkConfig.jwt_user_id;
    exports.frameworkConfig.dbVersion = fc.dbVersion || exports.frameworkConfig.dbVersion;
    exports.frameworkConfig.wpcColumnMapping =
        fc.wpcColumnMapping || exports.frameworkConfig.wpcColumnMapping;
    const routerConfig = fc.router_config || {
        app: new Application(),
        router: new KoaRouter(),
    };
    exports.frameworkConfig.router_config = routerConfig;
    const router = (0, Router_1.Router)(routerConfig);
    return { app: router.app, router: router.router };
};
exports.PighandFramework = PighandFramework;
exports.default = exports.PighandFramework;
//# sourceMappingURL=frameworkConfig.js.map