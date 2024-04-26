const sessionAuth = async (req, res, next) => {
    // Include IP checking
    if (!req.session?.user) {
        const err = Error("Invalid Authentication")
        err.name = "Failed Auth"
        next(err)
    }
    next()
}

module.exports = sessionAuth