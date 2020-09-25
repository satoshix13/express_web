const express = require('express')
const fs = require('fs')
const events = require('events')
const dotenv = require('dotenv')
const memCacheMiddleware = require('./middlewares/mem-cache.js')
const eventHandler = new events.EventEmitter()




if(process.env.NODE_ENV !== 'production'){
  dotenv.config()
}


const app = express()
const serverPort = process.env.PORT || 8080
const oneMillion = 1000000
const timeLeftCache = parseInt(process.env.TIME)

let visitCounter = 0

app.set("visit_counter", 0)

try {
    visitCounter = fs.readFileSync('stats/visits.txt', 'utf8')
} catch (e) {
    console.info('old visit file not found. Counting form 0')
}

const indexTemplate = fs.readFileSync('templates/index.html', 'utf8')
const genericTemplate = fs.readFileSync('templates/generic.html', 'utf8')
const elementsTemplate = fs.readFileSync('templates/elements.html', 'utf8')
const errorTemplate = fs.readFileSync('templates/error-404.html', 'utf8')
const statsTemplate = fs.readFileSync('templates/stats.html', 'utf8')

eventHandler.on('increment_visit', (currentRoute) => {
    console.log('Emitted increment_visit event with route ' + currentRoute)
    visitCounter++

    /*
    if (visitCounter % oneMillion) {
        //we can emit events inside subscriber function
        eventHandler.emit('send_access_stat_email', visitCounter)
    }*/

    console.log(`${visitCounter} visits`)

    fs.writeFileSync('stats/visits.txt', visitCounter)

    /*let sectionFile = 'stats/' + currentRoute.replace('/', '') + '.txt'

    fs.writeFileSync(sectionFile, 0)*/

})

eventHandler.on('send_access_stat_email', (totalVisits) => {
    //sends mail to admin with the achievement
})

app.get('/', memCacheMiddleware(timeLeftCache, process.env.NODE_ENV), (req, res) => {
    let currentRoute = req.url

    eventHandler.emit('increment_visit', currentRoute)

    res.send(indexTemplate)
})

app.get('/index', (req, res) => {
    res.redirect('/')
})

app.get('/elements', (req, res) => {
    let currentRoute = req.url

    eventHandler.emit('increment_visit', currentRoute)

    res.send(elementsTemplate)
})


app.get('/stats', (req, res) => {
    let currentRoute = req.url

    eventHandler.emit('increment_visit', currentRoute)

    let parseredStatsTemplate = statsTemplate.replace("{{totalVisits}}", visitCounter).replace("{{totalVisitsDouble}}", visitCounter * 2);
    res.send(parseredStatsTemplate)
})

app.get('/generic', (req, res) => {
    let currentRoute = req.url

    eventHandler.emit('increment_visit', currentRoute)

    res.send(genericTemplate)
})

app.listen(serverPort, () => {
    console.info(`Running http server on http://localhost:${serverPort}`)
})
