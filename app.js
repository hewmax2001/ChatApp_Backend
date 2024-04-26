const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const sessionRegenerate = require('./middleware/sessionRegenerate')

const config = require('./utils/config')

// Import prior to the routers
require('express-async-errors')

// Routers
const authRouter = require('./routes/authRouter')
const userRouter = require('./routes/userRouter')
const messageRouter = require('./routes/messageRouter')

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
app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: config.MONGODB_URI
    }),
    cookie: { 
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 Day
    }
}))

app.use(sessionRegenerate)
app.use(cors(corsOptions))

app.use(express.json())

// Write this to some log file
app.use(morgan(':method :url :status :res[conent-length] - :response-time ms'))

app.options('*', cors())
// Routes
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/comment', messageRouter)
app.get('/', (req, res, next) => {
    res.send('<h1>Hello World SESSIONS</h1>')
})

// Suffix middleware
app.use(middleware.errorHandler)
app.use((request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
})

module.exports = app