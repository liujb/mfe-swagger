# 简介

将[Swagger-UI](https://swagger.io/swagger-ui/)和[Expressjs](https://expressjs.com)包装的[swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express) 再次进行包装，灵活得满足三种形式来构建文档。

1. 将书写的`swagger`配置文件，主要是`yaml`，`json`格式的配置生成API文档
2. 将[满足swagger需要的](https://github.com/Surnet/swagger-jsdoc/blob/master/example/routes.js)`JSDoc`的代码注释生成API文档
3. 将`JSDoc`注释生成swagger配置文件并将文件代理出去，用于其他[swaggerhub](https://swaggerhub.com)来呈现API文档

# API文档

## fromMeta(dir) -> middleware

```
// Swagger元文件所在的文件夹
const swaggerDir = path.join(__dirname, '../swagger')

// /swagger可以自定义
app.use('/swagger', swagger.fromMeta(swaggerDir))
```

该方法用于将swagger配置生成API文档并提供访问能力，需要保证`dir`参数传入的路径存在swagger配置文件，否则会抛异常

执行`npm run example` 之后通过 [http://localhost:3000/swagger/index.yaml](http://localhost:3000/swagger/index.yaml) 可以访问到文档。


## fromJsDoc(options, uri = '/swagger/from-jsdoc.json') -> middleware

```
var options = {
  swaggerDefinition: {
    info: {
      title: '活动系统',
      version: '1.0.0',
      description: '活动系统',
    },
    host: '127.0.0.1',
    basePath: '/v2',
  },
  apis: [path.join(__dirname, './routers/*.js')], // Path to the API docs
}

// 访问方式 http://localhost:3000/swagger/from-jsdoc.json
app.use(swagger.fromJsDoc(options))

// 访问方式 http://localhost:3000/swagger/docs
// app.use('/swagger', swagger.fromJsDoc(options, '/docs'))
```

该方法用于将满足`swagger`形式的`JSDoc`代码注释，生成API文档并提供访问能力。

执行`npm run example` 后通过 [http://localhost:3000/swagger/from-jsdoc.json](http://localhost:3000/swagger/from-jsdoc.json) 可以访问到预定于的文档

## generatorMetaFromJsDoc(options, fileName, swaggerDir) -> void

利用 [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) 将 [jsdoc](http://usejsdoc.org) 注释生成Swagger所需要的配置文件。

源码

```
const generatorMetaFromJsDoc = (options, fileName, swaggerDir) => {
  if (!fileName || !options || !swaggerDir) {
    throw new Error(`Params error.`)
  }

  try {
    const exists = fs.existsSync(swaggerDir)
    if (!exists) {
      mkdirp.sync(swaggerDir)
    }
    const destFileName = path.join(swaggerDir, fileName)
    const swaggerSpec = swaggerJSDoc(options)
    fs.writeFileSync(destFileName, JSON.stringify(swaggerSpec, null, 2))
  } catch (err) {
    throw err
  }
}
```

使用

```
var options = {
  swaggerDefinition: {
    info: {
      title: '活动系统',
      version: '1.0.0',
      description: '活动系统',
    },
    host: '127.0.0.1',
    basePath: '/v2',
  },
  apis: [path.join(__dirname, './routers/*.js')], // Path to the API docs
}
const swaggerDir = path.join(__dirname, '../swagger')
swagger.generatorMetaFromJsDoc(options, 'from-jsdoc.json', swaggerDir)
```

生成的文件是JSON格式，如果需要生成YAML格式需要再做处理。

## proxyMeta(dir) -> express.static(dir)

用于在项目中代理所有的Swagger的`Meta`数据，其实就是个静态服务，该方法可有可无

使用方式

```
const swaggerDir = path.join(__dirname, '../swagger')
app.use(swagger.proxyMeta(swaggerDir))
```

效果跟`app.use(express.static(swaggerDir))`是一样的

## generatorMetaFromJsDocAndProxy(options, fileName, swaggerDir) -> express.static(dir)

该方法是`generatorMetaFromJsDoc()`和`proxyMeta()`的叠加效果

```
var options = {
  swaggerDefinition: {
    info: {
      title: '活动系统',
      version: '1.0.0',
      description: '活动系统',
    },
    host: '127.0.0.1',
    basePath: '/v2',
  },
  apis: [path.join(__dirname, './routers/*.js')], // Path to the API docs
}
const swaggerDir = path.join(__dirname, '../swagger')
app.use('/swaggerss', swagger.generatorMetaFromJsDocAndProxy(options, 'from-jsdoc.json', swaggerDir))
```

执行 `npm run example` 后通过 [http://localhost:3000/swaggerss/from-jsdoc.json](http://localhost:3000/swaggerss/from-jsdoc.json) 访问JSDOC生成的JSON文档

# 示例说明

```
yarn && npm run example
```

启动项目后就可以通过上边的链接看到文档或者对应的JSON配置文件。


# 其他说明

1. 注意文档只配置到非生产环境，生产环境不要部署文档。

## 依赖库

1. express
2. swagger-jsdoc
2. swagger-ui-express
2. yamljs

# 发版说明


## 1.1.3

1. 移除不必要的console
2. 增加@types/node，修复build报错。

## 1.1.2

1. `generatorMetaFromJsDoc(options, fileName, swaggerDir)` 增加自动创建文件夹。
2. `fromMeta(dir)` 增加文件夹验证。

## 1.1.1

1. 升级`swagger-ui-express` 到`2.0.8`

## 1.1.0

1. 隐藏头部导航
2. 增加站点favorite、title的自定义
3. 更改example

## 1.0.0

1. 基本功能实现

