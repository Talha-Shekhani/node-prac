const MongoClient = require('./node_modules/mongodb').MongoClient
const assert = require('assert')
const dboper = require('./operations');

const url = 'mongodb://127.0.0.1:27017/'
const dbname = 'conFusion'

MongoClient.connect(url)
.then((client) => {
    console.log('Connected correctly to the server')
    
    const db = client.db(dbname)
    dboper.insertDocument(db, {name: 'Vadonut', description: 'test'}, 'dishes')
    .then((result) => {
        console.log('Insert Document:\n ', result.ops)
        return dboper.findDocuments(db, 'dishes')
    })
    .then((docs) => {
        console.log('Found Documents:\n', docs)
        return dboper.updateDocument(db, {name: 'Vadonut'}, {description: 'Updated Test'}, 'dishes')
    })
    .then((result) => {
        console.log('Updated Document:\n', result.result)
        return dboper.findDocuments(db, 'dishes')
    })
    .then((docs) => {
        console.log('Found Documents:\n', docs)
        return db.dropCollection('dishes')
    })
    .then((result) => {
        console.log('Dropped Collection: ', result)
        client.close()
    })
    .catch((err) => console.log(err))
})
.catch((err) => console.log(err))