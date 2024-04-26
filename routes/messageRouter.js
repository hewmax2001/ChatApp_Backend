const messageController = require('../controllers/messages')
const messageRouter = require('express').Router()
const sessionAuth = require('../middleware/sessionAuth')

messageRouter.post('/', sessionAuth, messageController.handleCreate)
messageRouter.get('/', messageController.handleGetAll)

module.exports = messageRouter