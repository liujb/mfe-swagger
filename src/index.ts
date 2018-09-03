import * as fs from 'fs'
import * as path from 'path'
import * as YAML from 'yamljs'
import * as swaggerUi from 'swagger-ui-express'
import * as express from 'express'
import * as mkdirp from 'mkdirp'

let result: Inst[] = []
const router = express.Router()
const swaggerJSDoc = require('swagger-jsdoc')

interface Inst {
  uri: string,
  path: string,
}

const loadDir = (dir: string, prefix: string) => {
  const items = fs.readdirSync(dir)

  for (let item of items) {
    if (!item) {
      continue
    }
    const absPath = path.join(dir, item)
    const stat = fs.lstatSync(absPath)
    if (stat.isDirectory()) {
      loadDir(absPath, item)
      continue
    }
    result.push({ uri: `${prefix}/${item}`.toLocaleLowerCase(), path: absPath })
  }
}

const fromMeta = (dir: string, siteTitle?: string, customeFav?: string) => {
  try {
    const exists = fs.existsSync(dir)
    if (!exists) {
      throw new Error(`Dir not exists when call fromMeta function.`)
    }
  } catch (e) {
    throw e
  }

  loadDir(dir, '')
  for (let item of result) {
    let swaggerSpec
    if (item.uri.indexOf('.json') > 0) {
      swaggerSpec = require(item.path)
    } else if (item.uri.indexOf('.yaml') > 0) {
      swaggerSpec = YAML.load(item.path)
    } else {
      continue
    }
    if (!swaggerSpec) {
      continue
    }
    const uri = path.join('/', item.uri)

    // 这个地方注意使用router.use()，使用router.get()会造成资源404
    router.use(uri, swaggerUi.serve)
    router.get(uri, swaggerUi.setup(swaggerSpec, false, null, '.topbar { display: none }', customeFav, null, siteTitle))
  }
  result = null
  return router
}

const fromJsDoc = (options: object, uri?: string, siteTitle?: string, customeFav?: string) => {

  if (!options) {
    throw new Error(`缺少参数.`)
  }

  if (!uri) {
    uri = '/swagger/from-jsdoc.json'
  }

  // Initialize swagger-jsdoc -> returns validated swagger spec in json format
  const swaggerSpec = swaggerJSDoc(options)
  router.use(uri, swaggerUi.serve)
  router.get(uri, swaggerUi.setup(swaggerSpec, false, null, '.topbar { display: none }', customeFav, null, siteTitle))
  return router
}

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

const proxyMeta = (dir: string) => {
  if (!dir) {
    return
  }
  return express.static(dir)
}

const generatorMetaFromJsDocAndProxy = (options, fileName, swaggerDir) => {
  try {
    generatorMetaFromJsDoc(options, fileName, swaggerDir)
    return proxyMeta(swaggerDir)
  } catch (e) {
    throw e
  }
}

export default {
  fromMeta,
  fromJsDoc,
  generatorMetaFromJsDoc,
  proxyMeta,
  generatorMetaFromJsDocAndProxy,
}