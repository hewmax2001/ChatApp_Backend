const userController = require('../controllers/users')
const userRouter = require('express').Router()

userRouter.post('/', userController.create)
userRouter.get('/', userController.getAll)
userRouter.get('/:id', userController.get)
userRouter.post('/:id/friend', userController.addFriend)

module.exports = userRouter