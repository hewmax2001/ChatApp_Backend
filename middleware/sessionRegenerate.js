const sessionRegenetate = (req, res, next) => {
    if (req.session?.user) {
        req.session.regenerate((err) => {
            next(err)
        })
    }
    next()
}

module.exports = sessionRegenetate