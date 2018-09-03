"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var YAML = require("yamljs");
var swaggerUi = require("swagger-ui-express");
var express = require("express");
var mkdirp = require("mkdirp");
var result = [];
var router = express.Router();
var swaggerJSDoc = require('swagger-jsdoc');
var loadDir = function (dir, prefix) {
    var items = fs.readdirSync(dir);
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        if (!item) {
            continue;
        }
        var absPath = path.join(dir, item);
        var stat = fs.lstatSync(absPath);
        if (stat.isDirectory()) {
            loadDir(absPath, item);
            continue;
        }
        result.push({ uri: (prefix + "/" + item).toLocaleLowerCase(), path: absPath });
    }
};
var fromMeta = function (dir, siteTitle, customeFav) {
    try {
        var exists = fs.existsSync(dir);
        if (!exists) {
            throw new Error("Dir not exists when call fromMeta function.");
        }
    }
    catch (e) {
        throw e;
    }
    loadDir(dir, '');
    for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
        var item = result_1[_i];
        var swaggerSpec = void 0;
        if (item.uri.indexOf('.json') > 0) {
            swaggerSpec = require(item.path);
        }
        else if (item.uri.indexOf('.yaml') > 0) {
            swaggerSpec = YAML.load(item.path);
        }
        else {
            continue;
        }
        if (!swaggerSpec) {
            continue;
        }
        var uri = path.join('/', item.uri);
        // 这个地方注意使用router.use()，使用router.get()会造成资源404
        router.use(uri, swaggerUi.serve);
        router.get(uri, swaggerUi.setup(swaggerSpec, false, null, '.topbar { display: none }', customeFav, null, siteTitle));
    }
    result = null;
    return router;
};
var fromJsDoc = function (options, uri, siteTitle, customeFav) {
    if (!options) {
        throw new Error("\u7F3A\u5C11\u53C2\u6570.");
    }
    if (!uri) {
        uri = '/swagger/from-jsdoc.json';
    }
    // Initialize swagger-jsdoc -> returns validated swagger spec in json format
    var swaggerSpec = swaggerJSDoc(options);
    router.use(uri, swaggerUi.serve);
    router.get(uri, swaggerUi.setup(swaggerSpec, false, null, '.topbar { display: none }', customeFav, null, siteTitle));
    return router;
};
var generatorMetaFromJsDoc = function (options, fileName, swaggerDir) {
    if (!fileName || !options || !swaggerDir) {
        throw new Error("Params error.");
    }
    try {
        var exists = fs.existsSync(swaggerDir);
        if (!exists) {
            mkdirp.sync(swaggerDir);
        }
        var destFileName = path.join(swaggerDir, fileName);
        var swaggerSpec = swaggerJSDoc(options);
        fs.writeFileSync(destFileName, JSON.stringify(swaggerSpec, null, 2));
    }
    catch (err) {
        throw err;
    }
};
var proxyMeta = function (dir) {
    if (!dir) {
        return;
    }
    return express.static(dir);
};
var generatorMetaFromJsDocAndProxy = function (options, fileName, swaggerDir) {
    try {
        generatorMetaFromJsDoc(options, fileName, swaggerDir);
        return proxyMeta(swaggerDir);
    }
    catch (e) {
        throw e;
    }
};
exports["default"] = {
    fromMeta: fromMeta,
    fromJsDoc: fromJsDoc,
    generatorMetaFromJsDoc: generatorMetaFromJsDoc,
    proxyMeta: proxyMeta,
    generatorMetaFromJsDocAndProxy: generatorMetaFromJsDocAndProxy
};
