import routers from './routers'
import path from 'path'
import express from 'express'
import swagger from '../'

const app = express()
const port = 3000
const env = process.env.NODE_ENV = 'development'

if (env !== 'production') {
  var options = {
    swaggerDefinition: {
      info: {
        title: '测试系统',
        version: '1.0.0',
        description: '测试系统API文档，利用代码的注释生成的',
      },
    },
    apis: [path.join(__dirname, './routers/*.js')], // Path to the API docs
  }
  // 方式一：利用JSDOC形式的注释生成文档
  // 访问地址：http://localhost:3000/swagger/from-jsdoc.json
  app.use(swagger.fromJsDoc(options, null, '活动API文档', 'http://manhattan.didistatic.com/static/manhattan/favicon.ico'))

  // 方式二：利用预先定义好的Swagger配置文件生成的文档
  // 访问地址：http://localhost:3000/swagger/example.yaml
  const swaggerDir = path.join(__dirname, '../swagger')
  app.use('/swagger', swagger.fromMeta(swaggerDir, '测试API', 'http://manhattan.didistatic.com/static/manhattan/favicon.ico'))

  // 方式三：从JSDOC形式的注释生成Swagger文档配置文件并代理
  // http://localhost:3000/swaggerss/from-jsdoc.json
  app.use('/swaggerss', swagger.generatorMetaFromJsDocAndProxy(options, 'from-jsdoc.json', swaggerDir))
}

// app.use('static', express.static(path.join(__dirname, './scripts')))

// 监听所有路由
app.use('/api', routers)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = `Not found or Http method error. ${req.method}: ${req.path}`
  res.status(404).json({ errorCode: 1, errorMsg: err })
  next()
})

// general errors
app.use(function(err, req, res, next) {
  req.failure = true
  res.status(err.status || 200)
  console.error(`uncaughtException||msg=${err.message}||errStack=${err.stack}`)
  res.json({
    errorCode: err.code || 500,
    errorMsg: err.message || err.toString(),
    stack: env === 'development' ? err.stack : '',
    data: {},
  })

})

app.listen(port, () => {
  console.info(`__start_api||port=${port}||env=${process.env.NODE_ENV}`)
})

export default app
