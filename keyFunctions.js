const { v1: uuidv4 } = require('uuid');
const exceptions = require('./exceptions')


availableKeyTimeout = 300
blockedKeyTimeout = 60    
availableKeyObjects = {}
blockedKeyObjects = {}

function generateKey(){
    var key = uuidv4();
    console.log(`generating key ${key}`)
    availableKeyObjects[key] = {expire: availableKeyTimeout}
}
function getKey(){
    for (const  key in availableKeyObjects) {
        if(availableKeyObjects[key].expire>0){
            console.log(`getting available key ${key}`)
            delete availableKeyObjects[key]
            blockedKeyObjects[key] = {expire: 60}
            return key
        }
    }
    return null;
}


function unblockKey(key){
    
    if(blockedKeyObjects.hasOwnProperty(key)){
        console.log(`unblocking key ${key}`)
        delete blockedKeyObjects[key]
        blockedKeyObjects[key] = {expire: availableKeyTimeout}
    }
    else{
        throw new exceptions.KeyNotFound
    }
}

function keepAlive(key) {
    if(availableKeyObjects.hasOwnProperty(key)){
        console.log(`keeping alive key ${key}`)
        availableKeyObjects[key].expire = availableKeyTimeout
    }
    else{
        throw new exceptions.KeyNotFound
    }
}

function deleteKey(key) {
    if(availableKeyObjects.hasOwnProperty(key)){
        console.log(`deleting key ${key}`)
        delete availableKeyObjects[key]
    }
    else{
        throw new exceptions.KeyNotFound
    }
}


function updateAvailableKeyTimeoutTask() {
    for (key in availableKeyObjects) {
        if( availableKeyObjects.hasOwnProperty(key) ) {
            if (availableKeyObjects[key].expire==0){
                console.log(`deleting obj with key ${key}`)
                delete availableKeyObjects[key];
            }
            else{
                availableKeyObjects[key].expire = availableKeyObjects[key].expire - 1;
            }
        }
    }
    console.log("Available keys timeout updated")
}

function updateBlockedKeyTimeoutTask() {
    for (key in blockedKeyObjects) {
        if( blockedKeyObjects.hasOwnProperty(key) ) {
            if (blockedKeyObjects[key].expire==0){
                console.log(`deleting obj with key ${key}`)
                delete blockedKeyObjects[key];
            }
            else{
                blockedKeyObjects[key].expire = blockedKeyObjects[key].expire - 1;
            }
        }
    }
    console.log("Blocked keys timeout updated")
}

setInterval(updateAvailableKeyTimeoutTask, 1000)
setInterval(updateBlockedKeyTimeoutTask, 1000)

exports.generateKey = generateKey
exports.getKey = getKey
exports.unblockKey = unblockKey
exports.keepAlive = keepAlive
exports.deleteKey = deleteKey