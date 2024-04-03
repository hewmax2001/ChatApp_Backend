const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// Route serving login form
const login =  async (request, response) => {
    const { username, password } = request.body
    const user = await User.findOne({ username })
    const passwordCorrect = user === null
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
        { expiresIn: Number(process.env.TOKEN_EXPIRATION_SECONDS) }
    )

    response.status(200).send({ token, username })
}

module.exports = { login }