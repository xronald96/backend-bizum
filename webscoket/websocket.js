
var dbConnection = require('../db').getConnectionDB()
let clients = {};
const manageWebsockets = (ws) => {
    ws.on('message', (message) => onMessage(message, ws));
}


const onMessage = async(message, ws) => {
    const jsonMessage = JSON.parse(message);
    switch(jsonMessage.type){
        case 'INIT': {
            clients[jsonMessage.user.id] = ws
            const [ friendIds ] =  await dbConnection.promise().query({sql:`SELECT user2 FROM connection WHERE connection.user1 = "${jsonMessage.user.id}"`, rowsAsArray: true});
            const [ currentUser ] =  await dbConnection.promise().query(`SELECT * FROM user WHERE user.id = "${jsonMessage.user.id}"`);
            if(friendIds.length){
                const [ friends ] =  await dbConnection.promise().query(`SELECT * FROM user WHERE user.id in (${friendIds.toString()})`);
                friends.forEach(element => {
                    console.log(element)
                    if(clients[element.id])
                        clients[element.id].send(JSON.stringify({
                            user: currentUser[0],
                            type:"ONLINE_USER"
                        }))
                });
            }
            return;
        };
        default:
            return
    }
    
}

module.exports= manageWebsockets;