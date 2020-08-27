const express = require('express')
const keyFunctions = require('./keyFunctions')
const exceptions = require('./exceptions')


const app = express()
app.use(express.json());
const port = 4567



app.post('/api/key/generate', (req, res) =>{
    keyFunctions.generateKey();
    res.json({'message': 'Key generated successfully'});
})

app.get('/api/key/get', (req, res) =>{
    key = keyFunctions.getKey()
    console.log(`key is ${key}`)
    if(key){
        res.json({'key': key});
    }
    else{
        res.status(404).json({"message": "Key not found"}),400
    }
})

app.post('/api/key/unblock', (req, res) =>{
    key = req.body["key"];
    try {
        keyFunctions.unblockKey(key)
        res.json({"message": "key unblocked successfully"})
    } catch (e) {
        console.log(e);
        res.status(404).json({"message": "key not found"})
    }
})

app.post('/api/key/keep-alive', (req, res) => {
    key = req.body["key"];
    try {
        keyFunctions.keepAlive(key)
        res.json({"message": "key is alive now"})
    } catch (e) {
        console.log(e);
        res.status(404).json({"message": "key not found"})
    }
})

app.delete('/api/key/delete', (req, res) => {
    key = req.body["key"];
    try {
        keyFunctions.deleteKey(key)
        res.json({"message": "key is deleted successfully"})
    } catch (e) {
        res.status(404).json({"message": "key not found"})
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})