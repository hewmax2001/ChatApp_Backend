const commentController = require('../controllers/comments')
const commentRouter = require('express').Router()
const userAuth = require('../middleware/tokenAuthenticator')

commentRouter.post('/', userAuth, commentController.create)
commentRouter.get('/', commentController.getAll)

module.exports = commentRouter