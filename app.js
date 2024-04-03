const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')

const config = require('./utils/config')

// Import prior to the routers
require('express-async-errors')

// Routers
const loginRouter = require('./routes/authenticationRouter')
const userRouter = require('./routes/userRouter')
const commentRouter = require('./routes/commentRouter')

// Middleware
const middleware = require('./middleware')


// Express app
const app = express()

//Set up MongoDB database
mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.error('error connecting to MongoDB', error.message)
    })

// Prefix middleware
app.use(cors())
app.use(express.json())
// Write this to some log file
app.use(morgan(':method :url :status :res[conent-length] - :response-time ms'))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// Routes
app.use('/api/auth', loginRouter)
app.use('/api/users', userRouter)
app.use('/api/comment', commentRouter)

// Suffix middleware
app.use(middleware.errorHandler)

module.exports = app