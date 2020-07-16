const express = require('./node_modules/express')
const http = require('http')
const morgan = require('./node_modules/morgan')
const bodyParser = require('./node_modules/body-parser')
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
// const fs = require('fs')
// const path = require('path')

const hostname = 'localhost'
const port = 3000

const app = express()
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use('/dishes', dishRouter)
app.use('/promotions', promoRouter)
app.use('/leaders', leaderRouter)

app.use(express.static(__dirname+ '/public'))
app.use((req, res, next) => {
    console.log(req.headers)
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    res.end(`<html><body><h1>This is an Express Server</h1></body></html>`)
})

const server = http.createServer(app)

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`)
})