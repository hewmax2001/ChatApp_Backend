const commentController = require('../controllers/comments')
const commentRouter = require('express').Router()
const userAuth = require('../middleware/tokenAuthenticator')

commentRouter.post('/', userAuth, commentController.create)

module.exports = commentRouter