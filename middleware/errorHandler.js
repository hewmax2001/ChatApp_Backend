const errorHandler = (error, request, response, next) => {
    switch (error.name) {
        case 'JsonWebTokenError':
            return response.status(401).json({ error: 'token missing or invalid' })
        case 'TokenExpireError':
            return response.status(401).json({ error: 'token expired' })
    }

    next(error)
}

exports.errorHandler = errorHandler