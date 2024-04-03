const app = require('./app')
const config = require('./utils/config')

const port = config.PORT

app.listen(port, () => {
    console.log(`Chat application listening on port ${port}`)
})