import { Router } from 'express'

const router = Router()

/**
 * @swagger
 * definitions:
 *   ApiResponse:
 *     type: "object"
 *     properties:
 *       errorCode:
 *         type: "integer"
 *         format: "int64"
 *       errorMsg:
 *         type: "string"
 *       data:
 *         type: "object"
 *   ApiResponseString:
 *     type: "object"
 *     properties:
 *       errorCode:
 *         type: "integer"
 *         format: "int64"
 *       errorMsg:
 *         type: "string"
 *       data:
 *         type: "string"
 */

/**
 * @swagger
 * /api/test:
 *   get:
 *     description: 这个接口是测试的，这个接口是测试的，是测试的。
 *     parameters:
 *       - name: username
 *         description: 用户姓名
 *         in: query
 *         required: true
 *         type: string
 *       - name: age
 *         description: 用户的年龄
 *         in: query
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         schema:
 *           $ref: "#/definitions/ApiResponse"
 */
router.get('/test', (req, res, next) => {
  const query = req.query
  res.json({
    errorCode: 0,
    errorMsg: 'ok',
    data: query,
  })
})


/**
 * @swagger
 * /api/login:
 *   post:
 *     description: 这个接口是测试POST的，这个接口是测试POST的，是测试POST的。
 *     parameters:
 *       - name: username
 *         description: 用户姓名
 *         in: formData
 *         type: string
 *       - name: age
 *         description: 用户的年龄
 *         in: formData
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         schema:
 *           $ref: "#/definitions/ApiResponseString"
 */
router.post('/login', (req, res, next) => {
  const token = (+new Date()).toString()
  res.json({
    errorCode: 0,
    errorMsg: 'ok',
    data: token,
  })
})

export default router