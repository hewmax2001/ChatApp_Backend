const User = require('../models/user')
const bcrypt = require('bcrypt')

const handleLogin = async (req, res, next) => {
    const { username, password } = req.body
    const user = await User.findOne({ username }).exec()
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash)
    
    if (!(user && passwordCorrect)) {
        return res.status(401).json({
            error: 'invalid username or password'
        })
    }

    // Do not need to catch error express-async-error should catch
    req.session.regenerate((err) => {
        if (err) next(err)

        req.session.user = user

        req.session.save((err) => {
            if (err) return next(err)
            res.redirect('/')
        })
    })
}

const handleLogout = async (req, res, next) => {
    // All THIS does is remove the user from the session
    // It does NOT remove the session from the database
    //req.session.user = null
    req.session.destroy((err) => {
        if (err) next(err)
        res.clearCookie('connect.sid', { httpOnly: true, sameSite: 'None', secure: true })
        res.redirect('/')
    })
}

module.exports = { handleLogin, handleLogout }