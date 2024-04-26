const authController = require('../controllers/auth')
const authRouter = require('express').Router()

authRouter.post('/login', authController.handleLogin)
authRouter.post('/logout', authController.handleLogout)

module.exports = authRouter