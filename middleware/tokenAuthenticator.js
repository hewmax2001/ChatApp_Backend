const jwt = require('jsonwebtoken')
require('dotenv')

const tokenExtractor = (request) => {
    const auth = request.get('authorization')

    if (auth && auth.startsWith('Bearer ')) {
        return auth.replace('Bearer ', '')
    } 
    return null
}

const userAuth = (request, response, next) => {
    const token = tokenExtractor(request)
    try {
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET)

        request.user = {
            id: decodedToken.id,
            username: decodedToken.username
        }
        next()
    } catch(error) {
        next(error)
    }
}

module.exports = userAuth