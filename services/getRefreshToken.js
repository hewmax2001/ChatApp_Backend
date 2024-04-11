const getRefreshToken = (req) => {
    const cookies = req.cookies
    if (cookies?.jwt) {
        return cookies.jwt
    }
    return null
}

module.exports = getRefreshToken