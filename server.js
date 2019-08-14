const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/"
const path = require('path')

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, './static')))
app.set('views', path.join(__dirname, './views'))
app.set('view engine', 'ejs')
app.use(session({secret: "be very quiet"}))

io.on('connection', function(socket) {
    socket.on('chat message', function(msg) {
        io.emit('chat message', msg)
    })

    socket.on('take turn', function(newaction) {
        if (newaction.action[0] == 'm') {
            char = newaction.char
            newaction = newaction.action.slice(1)
            MongoClient.connect(url, function(err, db){
                if (err) {
                    console.log(err)
                } else {
                    var dbo = db.db("node_adventure")
                    dbo.collection("dungeon").findOne({name: newaction})
                        .then(newroom => {
                            let wallx = (898-newroom.width*40)/2
                            let wally = (338-newroom.height*40)/2
                            for (let i = 0; i<newroom.door.length; i++) {
                                newroom.door[i].x = wallx + newroom.door[i].x*40-7
                                newroom.door[i].y = wally + newroom.door[i].y*40-12
                            }
                            let dungeon = {
                                height: newroom.height*40,
                                width: newroom.width*40,
                                wallx: wallx,
                                wally: wally,
                                params: newroom,
                                char: char
                            }
                            io.emit('move action', dungeon)
                        })
                        .catch(err => {
                            console.log(err)
                        })
                }
            })
        }
    })

    socket.on('changeclass', function(newclass) {
        MongoClient.connect(url, function(err, db){
            if (err) {
                console.log(err)
            } else {
                var dbo = db.db("node_adventure")
                dbo.collection("classes").findOne({classes: newclass})
                    .then(newstats => {
                        io.emit('changeclass', newstats)
                    })
                    .catch(err => {
                        console.log(err)
                    })
            }
        })
    })
})

app.get('/', (req, res) => {
    MongoClient.connect(url, function(err, db){
        if (err) {
            console.log(err)
        } else {
            var dbo = db.db("node_adventure")
            dbo.collection("classes").find({}).toArray(function(err, stats) {
                res.render('login', {char:stats})
            })
        }
    })
})

app.post('/login', (req, res) => {
    req.session.user = req.body
    res.redirect('/main')
})

app.post('/new', (req, res) => {
    res.redirect('/main')
})

app.get('/third', (req, res) => {
    res.render('third')
})

app.get('/main', (req, res) => {
    MongoClient.connect(url, function(err, db){
        if (err) {
            console.log(err)
        } else {
            var dbo = db.db("node_adventure")
            dbo.collection("dungeon").findOne({name: "Begin"})
                .then(params => {
                    let wallx = (898-params.width*40)/2
                    let wally = (338-params.height*40)/2
                    for (let i = 0; i<params.door.length; i++) {
                        params.door[i].x = wallx + params.door[i].x*40-7
                        params.door[i].y = wally + params.door[i].y*40-12
                    }
                    let dungeon = {
                        height: params.height*40,
                        width: params.width*40,
                        wallx: wallx,
                        wally: wally,
                        params: params
                    }
                    res.render('index', {user: req.session.user, dungeon})
                })
                .catch(err => {
                    console.log(err)
                })
        }
    })
})

app.get('*', (req, res) => {
    res.redirect('/')
})

http.listen(3000, function() {
    console.log('listening on port 3000')
})