const app = require('./app')
const port = 3000

app.listen(port, () => {
    console.log(`Chat application listening on port ${port}`)
})