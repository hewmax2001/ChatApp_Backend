const express = require('express')
const morgan = require('morgan')
const app = express()

//Set up MongoDB database

app.use(cors())
app.use(express.json())
// Write this to some log file
app.use(morgan(':method :url :status :res[conent-length] - :response-time ms'))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

/* 
use(errorhandling)
*/

module.exports = app