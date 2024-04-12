const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { createAuthTokens, getRefreshToken, detectRefreshTokenReUse } = require('../services/auth')
require('dotenv').config()

// Route serving login form
// Rename to handleLogin
const login =  async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ username }).exec() // Returns null if invalid
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash) // Returns null if invalid
    
    if (!(user && passwordCorrect)) {
        // Unauthorized
        return res.status(401).json({
            error: 'invalid username or password'
        })
    }

    const existingRefToken = getRefreshToken(req)
    const newRefTokenArray = !existingRefToken
        ? user.refreshTokens // User logged out, removing ref token from cookies
        : detectRefreshTokenReUse(existingRefToken, user) 
            ? [] // refToken not in user's list, clear refTokenArray
            : user.refreshTokens.filter(rt => rt !== existingRefToken) // refToken found in list, filter it from refTokenArray
    

    const { accessToken, refToken } = createAuthTokens(user)
    
    // Appending newRefToken to user's list
    user.refreshTokens = [...newRefTokenArray, refToken]
    await user.save()
    
    // Clear cookies of isntance of refresh token (will execute even if 'jwt' does not exist)
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    // Adding refToken to cookies
    res.cookie('jwt', refToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 60 * 60 * 24 * 1000})
    res.status(200).json({ accessToken, username })
}

const handleRefreshToken = async (req, res) => {
    const existingRefToken = getRefreshToken(req)
    if (!existingRefToken) return res.sendStatus(401)

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })

    // Errors exit route and transition to errorHandler
    const decodedToken = await jwt.verify(
        existingRefToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, token) => {
            // console.log('error:', err)
            // console.log('token:', token)
            if (!token) { // Invalid
                // If an original refresh token is mutated (raising an invalidation error), it will persist in the database
                throw jwt.JsonWebTokenError // 401
                // throw err ?
            }
            else if (err && token) { // Expired
                // Filter out expired token and return
                const user = await User.findOne({ username: token.username }).exec()
                const filteredExpiredToken = user.refreshTokens.filter(rt => rt !== token)
                user.refreshTokens = filteredExpiredToken
                await user.save()
                throw jwt.TokenExpiredError // 401
            }
            return token
        }
    )

    const user = await User.findOne({ username: decodedToken.username })

    if (detectRefreshTokenReUse(existingRefToken, user)) {
        const compromisedUser = await User.findOne({ username: decodedToken.username })
        compromisedUser.refreshTokens = []
        await compromisedUser.save()
        return res.sendStatus(401)
    }

    const newRefTokenArray = user.refreshTokens.filter(rt => rt !== existingRefToken)

    // If token is both valid and not compromised
    const { accessToken, refToken } = createAuthTokens(user)

    user.refreshTokens = [...newRefTokenArray, refToken]
    await user.save()
    // 1000 days expiry for cookie
    res.cookie('jwt', refToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 60 * 60 * 24 * 1000})

    return res.json({ accessToken })
}

module.exports = { login, handleRefreshToken }