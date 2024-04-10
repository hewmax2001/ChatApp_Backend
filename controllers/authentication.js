const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// Route serving login form
const login =  async (request, res) => {
    const cookies = request.cookies
    const { username, password } = request.body
    // Raises ... error OR returns null
    const user = await User.findOne({ username }).exec()

    // Raises ... error
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash)
    
    if (!(user && passwordCorrect)) {
        // Unauthorized
        return res.status(401).json({
            error: 'invalid username or password'
        })
    }

    const userForToken = {
        username: user.username,
        id: user._id
    }

    const accessToken = jwt.sign(
        userForToken,
        process.env.TOKEN_SECRET,
        { expiresIn: Number(process.env.TOKEN_EXPIRATION_SECONDS) }
    )

    let newRefTokenArray = !cookies?.jwt
        ? user.refreshToken
        : user.refreshToken.filter(rt => rt !== cookies.jwt)
    
    // If the refToken cookie was not cleared through logout,
    // potential for refToken compromised
    // Perform reuse detection
    if (cookies?.jwt) {
        const refToken = cookies.jwt
        const foundToken = await User.findOne({ refToken }).exec()

        if (!foundToken) {
            newRefTokenArray = []
        }

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    }

    const refToken = jwt.sign(
        { username: user.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRATION_SECONDS) }
    )

    user.refreshToken = [...newRefTokenArray, refToken]
    await user.save()

    res.cookie('jwt', refToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 60 * 60 * 24 * 1000})
    res.status(200).json({ accessToken, username })
    
}

/*
Errors to handle:
- Expired token
- JWT verification failure (Not a valid token)
- 
*/
const handleRefreshToken = async (request, res) => {
    const cookies = request.cookies
    if (!cookies?.jwt) return res.sendStatus(401)
    const refToken = cookies.jwt
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    const decodedToken = jwt.verify(
        refToken,
        process.env.REFRESH_TOKEN_SECRET,
    )
    const foundUser = await User.findOne({ refreshToken: refToken })
    // Potentially compromised refToken
    // OR
    // Invalid token
    if (!foundUser) {
        // Would raise JWT verfication error if invalid
        const compromisedUser = await User.findOne({ username: decodedToken.username })
        compromisedUser.refreshToken = []
        await compromisedUser.save()
        return res.sendStatus(403)
    }

    const newRefTokenArray = foundUser.refreshToken.filter(rt => rt !== refToken)

    jwt.verify(
        refToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                // Raise custom expired refresh token error
                foundUser.refreshToken = [...newRefTokenArray]
                await foundUser.save()
            }
            // If prior error was raised or username in token does not match up with found username
            // The latter error would arise if we somehow produced the same token for antoher user?
            if (err || foundUser.username !== decoded.username) return res.sendStatus(403)

            // If token is both valid and not compromised
            const accessToken = jwt.sign(
                {
                    username: foundUser.username,
                    id: foundUser._id
                },
                process.env.TOKEN_SECRET,
                { expiresIn: Number(process.env.TOKEN_EXPIRATION_SECONDS)}
            )

            const newRefToken = jwt.sign(
                { username: foundUser.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRATION_SECONDS) }
            )

            foundUser.refreshToken = [...newRefTokenArray, newRefToken]
            const result = await foundUser.save()
            // 1000 days expiry for cookie
            res.cookie('jwt', newRefToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 60 * 60 * 24 * 1000})

            return res.json({ accessToken })
        }
    )
}

module.exports = { login, handleRefreshToken }