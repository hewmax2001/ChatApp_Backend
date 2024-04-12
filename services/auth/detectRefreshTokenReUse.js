const detectRefreshTokenReUse = (refToken, user) => {
    if (!user.refreshTokens.find(token => token === refToken)) {
        return true
    }
    return false
}

module.exports = detectRefreshTokenReUse