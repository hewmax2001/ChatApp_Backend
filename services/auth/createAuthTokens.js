const jwt = require('jsonwebtoken')

const createAuthTokens = user => {
    const { id, username } = user

    const accessToken =  jwt.sign(
        { username, id },
        process.env.TOKEN_SECRET,
        { expiresIn: Number(process.env.TOKEN_EXPIRATION_SECONDS) }
    )

    const refToken = jwt.sign(
        { username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRATION_SECONDS) }
    )

    return { accessToken, refToken }
}

module.exports = createAuthTokens