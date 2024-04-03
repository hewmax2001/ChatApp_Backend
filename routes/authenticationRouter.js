const authController = require('../controllers/authentication')
const loginRouter = require('express').Router()

loginRouter.post('/', authController.login)

module.exports = loginRouter