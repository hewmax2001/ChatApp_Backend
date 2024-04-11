// Errors that occur in async functions resolve to here
const errorHandler = (error, request, response, next) => {
    switch (error.name) {
        case 'JsonWebTokenError':
            response.status(401).json({ error: 'token missing or invalid' })
            break
        case 'TokenExpireError':
            response.status(401).json({ error: 'token expired' })
            break
    }

    next(error)
}

exports.errorHandler = errorHandler