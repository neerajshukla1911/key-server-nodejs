class KeyManager { 
    // keyObjects = {"blocked":{}, "available":{}}

    constructor() {
        this.availableKeyTimeout = 300
        this.blockedKeyTimeout = 60    
        this.keyObjects = {"blocked":{}, "available":{}}
        console.log(`${this}`)
    }

    generateKey(){
        var key = uuidv4();
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
        for (const  key in this.keyObjects["available"]) {
            if( this.keyObjects["available"].hasOwnProperty(key) ) {
                console.log(`updating key ${key}`)
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
// setInterval(keyManager.updateAvailableKeyTimeoutTask.bind(keyManager._this), 1000)
// setInterval(keyManager.updateBlockedKeyTimeoutTask.bind(keyManager._this), 1000)
