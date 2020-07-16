const MongoClient = require('./node_modules/mongodb').MongoClient
const assert = require('assert')

const url = 'mongodb://127.0.0.1:27017/'
const dbname = 'conFusion'

MongoClient.connect(url, (err, client) => {
    assert.equal(err, null)
    console.log('Connected correctly to the server')
    
    const db = client.db(dbname)
    const collection = db.collection('dishes')
    collection.insertOne({"name": "Uthappizza", "description": "Test"}, (err, result) => {
        assert.equal(err, null)
        console.log('After Insert \n', result.ops)
        collection.find({}).toArray((err, docs) => {
            assert.equal(err, null)
            console.log('Found:\n', docs)

            db.dropCollection('dishes', (err, result) => {
                assert.equal(err, null)
                client.close()
            })
        })
    })
})