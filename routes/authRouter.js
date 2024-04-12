const authController = require('../controllers/authentication')
const authRouter = require('express').Router()

authRouter.post('/login', authController.handleLogin)
authRouter.post('/logout', authController.handleLogout)
// Check whether this SHOULD be a GET request or POST
authRouter.get('/refresh', authController.handleRefreshToken)

module.exports = authRouter