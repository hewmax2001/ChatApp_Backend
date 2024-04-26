const userController = require('../controllers/users')
const userRouter = require('express').Router()
const sessionAuth = require('../middleware/sessionAuth')

userRouter.post('/', userController.create)
userRouter.get('/', sessionAuth, userController.getAll)
userRouter.get('/:id', userController.get)
//userRouter.post('/:id/friend', userController.addFriend)

module.exports = userRouter