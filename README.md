## pighand-framework-koa

基于 koa 快速开发框架

### 快速开始

1. npm/yarn/pnpm add @pighand/pighand-framework-koa

2. 配置

```
import { PighandFramework } from '@pighand/pighand-framework-koa';

const { app } = PighandFramework({});
```

3. 启动

```
app.listen(3000, async () => {
    console.log(`服务已启动，端口号： ${config.port}`);
});
```

### PighandFramework 参数

```
/**
 * jwt加密所用，默认“Qwe_1A2s3d”
 */
jwt_salt?: string;

/**
 * jwt中用户唯一标识字段，默认“id”
 */
jwt_user_id?: string;

/**
 * 根据查询规则获取查询条件时，字段映射
 *
 * curd.getWhereParam()中使用此参数，自动映射
 *
 * @params {object} { 'queryColumn': 'dbColumn' }
 * @eg { 'id': '_id' }
 */
wpcColumnMapping?: any;

/**
 * router配置
 */
router_config?: {
    // koa - app，不传默认返回new Koa
    app?: Application;

    // koa - router，不传默认返回new Router
    router?: KoaRouter;

    // 路由公共路径。如'api'，则路由变成'/api/...'
    basePath?: string;

    // koa middleware，优先级最好
    appMiddleware?: Array<(...args: any) => any>;

    // 路由前置middleware
    routerBeforeMiddleware?: Array<(...args: any) => any>;

    // controller路径，配置了路径支持controller装饰器
    controllers?: Array<string> | Array<(...args: any) => any>;
}

/**
 * 数据库版本信息
 */
dbVersion?: {
    // 逻辑删除 - 删除字段，默认值“deleted”
    logicalDeleteColumn?: string;

    // 逻辑删除 - 已删除值，默认值“true”
    logicalDeleteTrue?: string | number | boolean;

    // 逻辑删除 - 未删除值，默认值“false”
    logicalDeleteFalse?: string | number | boolean;

    // 逻辑删除 - 删除人字段，默认值“deleterId”
    logicalDeleterColumn?: string;

    // 逻辑删除 - 删除时间字段，默认值“deletedAt”
    logicalDeletedAtColumn?: string;

    // 创建人字段，默认值“creatorId”
    creatorColumn?: string;

    // 创建时间字段，默认值“createdAt”
    createdAtColumn?: string;

    // 更新人字段，默认值“updaterId”
    updaterColumn?: string;

    // 更新时间字段，默认值“updatedAt”
    updatedAtColumn?: string;
}
```

#### controller 装饰器

需在在 PighandFramework - router_config - controllers 配置对象的路径才生效

1. @Controller(path?: string, beforeMiddleware?: Array<() => void>)
2. @Get(path?: string, beforeMiddleware?: Array<() => void>)
3. @Put(path?: string, beforeMiddleware?: Array<() => void>)
4. @Post(path?: string, beforeMiddleware?: Array<() => void>)
5. @Delete(path?: string, beforeMiddleware?: Array<() => void>)

eg:

```
import { Controller, Get, Put, Post, Delete } from 'pighand-framework-koa';

@Controller('/token')
class UserController {
    @Post('/user', [checkTokenFunction])
    async get(ctx: Context) {
    }

    @Get('/user/:id')
    async get(ctx: Context) {
    }
}
```

### BaseController

controller 继承 BaseController，扩展以下方法：

1. getParams(ctx: Context)\
   获取 body 或 url 参数

2. result(ctx: Context, data?: any, code?: number)\
   格式化返回值：

```
{
    code: code || 200,
    data: data || '',
    error: '',
}
```

3. checkParams(params: any, checks: Array\<checkSchema\>, parentText = '')\
   校验参数，校验格式参考\<checkSchema\>

### BaseService

service 继承 BaseService，扩展以下方法：

1. integrationCreate(ctx: Context, params: any)\
   内置创建，根据 model 类型自动判断库，创建

2. integrationQuery(ctx: Context, params: any)\
   内置列表、分页查询

3. integrationFind(id: string | number | mongoose.ObjectId)\
   内置详情查询

4. integrationUpdate(ctx: Context, id: string | number | mongoose.ObjectId, params: any)\
   内置修改

5. integrationDelete(ctx: Context, where: string | number | mongoose.ObjectId, now?: Date)\
   内置删除

6. integrationDeleteMany(ctx: Context, where: object)\
   内置条件删除

7. getPageOrListData(result: any)\
   调用分页查询方法后，根据返回值返回 page 中的 list 或 list 数据

8. formatPageOrListResult(result: any, fun: (data: any) => any)\
   格式化分页查询方法的返回值

# SuperBase

继承 BaseController 和 BaseService 后，支持一下方法：

1. getIp(ctx: Context)\
   获取客户端 ip

2. getLoginUserInfo(ctx: Context)\
   获取登录信息，配合 checkToken middleware 使用。

### 异常处理

配合 errorHandler middleware 使用。
继承 BaseController 和 BaseService 后，支持以下抛出异常方法：

1. throw(message: string): void;
2. throw(message: string, status: number): void;
3. throw(message: string, data: JSON): void;
4. throw(message: string, data: JSON, status: number): void;
5. throw(message: string, dataOrStatus?: number | JSON, status?: number)

### middleware

1. apiInfo\
   统计接口所用时间，一般当做 Koa 中间件使用

2. corsDomain\
   跨域处理，一般当做 Koa 中间件使用

3. errorHandler\
   异常统一处理，一般当做 Koa 中间件使用

```
返回格式：
{
    code: code || 400 || 500,
    data: data || '',
    error: 'message',
}
```

4. checkToken(isCheckToken: boolean)\
   权限校验，一般当做 Router、Controller 中间件使用；
   必传 token 没传，返回 401；
   登录信息从 ctx.state[statusKey]中取，statusKey 默认“loginUserInfo”，可在 PighandFramework 中自定义。

### 数据库操作

BaseService 继承根据 model 自动识别数据库，并操作库。也可以通过数据库类自行操作数据库。\
继承 BaseService<Model> 使用 `super.db.XXX`；或 `new DbCrud(model).XXX` 来调用一下方法：

-   model 优先级：参数中的 model > BaseService<Model> || new DbCrud(model)

1. 根据 model 识别数据库类型

    > getDbType(model?: mongoose.Model<any> | sequelizeModel): DbType

2. 创建\
   根据 PighandFramework.dbVersion 中的设置，自动添加版本信息

    > async create(params: object, version?: versionSchema): Promise

    > async create(params: object, model: mongoose.Model<any> | sequelizeModel, version?: versionSchema): Promise

3. 根据 model 获取查询规则。根据 model 中的字段类型返回查询规则，允许修改，配合自动查询使用。

    > getWhereParamConfig(model?: mongoose.Model<any> | sequelizeModel): WhereParamConfig

4. 根据`WhereParamConfig`返回 where 查询条件

    > getWhereParam(wpc: whereParamConfig, params: any): any

    > getWhereParam(model: mongoose.Model<any> | sequelizeModel, params: any, ): any

5. 分页或列表查询\
   根据 option 参数中是否有 page 信息，有则返回分页，否则返回列表。

    > query(whereParam: object, option: pageOptionSchema): Promise<pageResultSchema<any>>

    > query(whereParam: object, model: mongoose.Model<any>, option: pageOptionSchema): Promise<pageResultSchema<any>>

    > query(whereParam: object, option?: listOptionSchema): Promise<Array<any>>

    > query(whereParam: object, model: mongoose.Model<any>, option?: listOptionSchema): Promise<Array<any>>

6. 查询详情

    > find(id: string | number | mongoose.ObjectId): Promise<mongoose.Document>

    > find(id: string | number | mongoose.ObjectId, model: mongoose.Model<any> | sequelizeModel): Promise<mongoose.Document>

7. 更新

    > update(where: string | number | mongoose.ObjectId | object, params: any, version?: versionSchema): Promise<void>

    > update(where: string | number | mongoose.ObjectId | object, params: object, model: mongoose.Model<any> | sequelizeModel, version?: versionSchema): Promise<void>

8. 逻辑删除

    > logicalDelete(model: mongoose.Model<any> | sequelizeModel, id: string | number | mongoose.ObjectId, version?: versionSchema): Promise<void>

    > logicalDelete(model: mongoose.Model<any> | sequelizeModel, where: object, version?: versionSchema): Promise<void>

9. 根据 id 物理删除

    > physicsDelete(id: string | number | mongoose.ObjectId): Promise<void>

    > physicsDelete(id: string | number | mongoose.ObjectId, model: mongoose.Model<any> | sequelizeModel): Promise<void>

10. 根据条件物理删除

    > physicsDelete(where: object): Promise<void>;

    > physicsDelete(where: object, model: mongoose.Model<any> | sequelizeModel): Promise<void>
