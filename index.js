const express = require('express')
const redisModule = require("redis");
const { v1: uuidv4 } = require('uuid');

const app = express()
const port = 4567
const redis = redisModule.createClient();

redis.on("error", function(error) {
    console.error(error);
});

// availableKeyObjects = {
//     "abc": {expire: 15},
//     "pqr": {expire: 0},
//     "xyz": {expire: 5}
// }

class KeyManager { 
    // keyObjects = {"blocked":{}, "available":{}}

    constructor() {
        this.availableKeyTimeout = 300
        this.blockedKeyTimeout = 60    
        this.keyObjects = {"blocked":{}, "available":{}}
    }

    generateKey(){
        key = uuidv4();
        this.keyObjects["available"][key] = {exipre: this.availableKeyTimeout}
    }
    
    getKey(){
        for (const  key in this.keyObjects["available"]) {
            if(this.keyObjects["available"].expire>0){
                console.log(`returning key ${key}`)
                return key
            }
        }
    }

    keepAlive(key) {
        if(this.keyObjects["available"].hasOwnProperty(key)){
            console.log(`keeping alive key ${key}`)
            this.keyObjects["available"][key].expire = this.availableKeyTimeout
        }
    }

    blockKey(key){
        if(this.keyObjects["available"].hasOwnProperty(key)){
            console.log(`blocking key ${key}`)
            delete this.keyObjects["available"][key]
            this.keyObjects["blocked"][key] = {"expire": blockedKeyTimeout}
        }
    }

    unblockKey(key){
        if(this.keyObjects["blocked"].hasOwnProperty(key)){
            console.log(`unblocking key ${key}`)
            delete this.keyObjects['blocked'][key]
            this.keyObjects["available"][key] = {expire: this.availableKeyTimeout}
        }
    }

    updateAvailableKeyTimeoutTask(){
        console.log(`${this.blockedKeyTimeout}`)
        for (const  key in this.keyObjects["available"]) {
            if( this.keyObjects["available"].hasOwnProperty(key) ) {
                if (this.keyObjects["available"][key].expire==0){
                    console.log(`deleting obj with key ${key}`)
                    delete this.keyObjects["available"][key];
                }
                else{
                    this.keyObjects["available"][key].expire -=1
                }
            }
        }
        console.log("all done in available")
    }

    updateBlockedKeyTimeoutTask(){
        for (const  key in this.keyObjects["blocked"]) {
            if( this.keyObjects["blocked"].hasOwnProperty(key) ) {
                if (this.keyObjects["blocked"][key].expire==0) {
                    console.log(`deleting blocked bj with key ${key}`)
                    delete this.keyObjects["blocked"][key];
                }
                else {
                    this.keyObjects["blocked"][key].expire -= 1
                }
            }
        }
        console.log("all done in blocked")
    }

}

keyManager = new KeyManager()
setInterval(keyManager.updateAvailableKeyTimeoutTask, 1000)
setInterval(keyManager.updateBlockedKeyTimeoutTask, 1000)

app.post('/api/key/generate', (req, res) =>{
    key = uuidv4();
    redis.set(`key:available:${key}`, key, 'EX', 300)
    res.json({'message': 'Key generated successfully'});
})

app.get('/api/key/get', (req, res) =>{
    redis.scan(0, "key:available:*", (err, matches) => {
        if (err) return console.log(err);
            console.log(matches);
    })

    res.json({'key': ""});
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})