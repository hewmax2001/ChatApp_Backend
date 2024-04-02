const User = require('../models/user')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()

loginRouter.get('/', async (request, response) => {
    const { username, password } = request.body

    const user = await User.findOne({ username })
    const passwordCorrect = user = null
        ? false
        : await bcrypt.compare(password, user.passwordHash)
    
    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    const userForToken = {
        username: user.username,
        id: user._id
    }

    const token = jwt.sign(
        userForToken,
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRATION_SECONDS }
    )

    response.status(200).send({ token, username })
})