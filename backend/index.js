const MongoClient = require("mongodb")
const Express = require('express')
const Config = require("./config.js")
const path = require('path')
const fileUpload = require('express-fileupload')
const axios = require('axios')

const fs = require('fs')
let https = require('https')

let key = fs.readFileSync('private.key')
let cert = fs.readFileSync('certificate.crt')
let ca = fs.readFileSync('ca_bundle.crt')

let options = {
  key: key, cert: cert, ca: ca
}

let http = Express()

http.use(fileUpload())
http.use('/images', Express.static(path.join(__dirname, 'public', 'pics')))

http.use(Express.json())
http.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

let Mongo = new MongoClient.MongoClient(Config.mongodb)
let db = null

http.get('/', (req, res) => {
    db.listCollections().toArray((err, collections)=>{
        if(err) throw err
        res.json(collections)
    })
})

http.get('/the-open-network', (req, res) => {
    let currency = req.query.currency
    let url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest'
    
    let config = {
        headers: {
            'Content-Type': 'application/json',
            "X-CMC_PRO_API_KEY": Config.tokenCoinmarketcap,
            "Access-Control-Allow-Origin": "*"
        }
    }
    
    let response = null
    new Promise(async (resolve, reject) => {
        try {
            response = await axios.get(url + `?slug=toncoin&convert=${currency}`, config)
        } catch(ex) {
            response = null
            console.log(ex)
            reject(ex)
        }

        if (response) {
            if (currency === 'RUB') {
                res.json(Object.entries(response.data.data)[0][1].quote.RUB.price)
            }

            if (currency === 'USD') {
                res.json(Object.entries(response.data.data)[0][1].quote.USD.price)
            }

            if (currency === 'EUR') {
                res.json(Object.entries(response.data.data)[0][1].quote.EUR.price)
            }

            if (currency === 'BYN') {
                res.json(Object.entries(response.data.data)[0][1].quote.BYN.price)
            }
        } else {
            res.json(0)
        }
    })
})

http.post('/upload', (req, res) => {
    if (!req.files) {
        return res.send({
            success: false,
            message: 'No image uploaded!'
        })
    }

    const file = req.files.image
    const data = []

    function move(image) {
        let fileName = Math.random().toString(16).slice(2).substr(0, 4) + '-' + image.name
        try { image.mv('public/pics/' + fileName) }
        catch (e) {
            return res.send({
                success: false,
                message: 'upload error'
            })
        }
        
        data.push({
            name: fileName,
            mimeType: image.mimetype,
            size: image.size
        })
    }

    Array.isArray(file) ? file.forEach((file) => move(file)) : move(file)
    return res.send({ success: true, message: 'uploaded successfully', data })
})

http.post('*', (req, res) => {
    db.collection(parseURL(req)[1]).insert(req.body, (err, obj) =>{
        res.json(obj)
    })
})

http.get('/*/[0-9]+', (req, res) => {
    let page = parseURL(req)[2]
    db.collection(parseURL(req)[1]).find()
        .limit(page*Config.limitRecord)
        .skip((page-1)*Config.limitRecord)
        .toArray((err, objs) => {
        res.json(objs)
    })
})

http.put('/*/[0-9]+', (req, res) => {
    let page = parseURL(req)[2]
    db.collection(parseURL(req)[1]).find(req.body)
        .limit(page*Config.limitRecord)
        .skip((page-1)*Config.limitRecord)
        .toArray((err, objs) => {
            res.json(objs)
        })
})

http.patch('/*/*+', (req, res) => {
    let id = new MongoClient.ObjectID(parseURL(req)[2])
    db.collection(parseURL(req)[1]).updateOne({_id: id}, {$set: req.body}, (err, obj) =>{
        res.json(obj)
    })
})

http.patch('/*', (req, res) => {
    db.collection(parseURL(req)[1]).updateMany(req.body.find, {$set: req.body.set}, (err, obj) =>{
        res.json(obj)
    })
})

http.get('/*/*', (req, res) => {
    let id = new MongoClient.ObjectID(parseURL(req)[2])
    db.collection(parseURL(req)[1]).find({_id: id})
        .toArray((err, obj) => {
            res.json(obj[0]?obj[0]:null)
        })
})

http.delete('/*/*+', (req, res) => {
    let id = new MongoClient.ObjectID(parseURL(req)[2])
    db.collection(parseURL(req)[1]).remove({_id: id}, (err, obj) => {
        res.json(obj)
    })
})

http.delete('/*', (req, res) => {
    db.collection(parseURL(req)[1]).remove(req.body, (err, obj) => {
        res.json(obj)
    })
})

const server = https.createServer(options, http)

server.listen(Config.port, function () {
    Mongo.connect((err, client)=>{
        if(err) throw err
        db = client.db()
        console.log('Listening on port ' + Config.port)
    })
})

function parseURL(url) {
    return url.originalUrl.split("/")
}