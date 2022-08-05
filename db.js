const mysql = require('mysql2');
let connection = null;
const initDB = () =>{
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'test',
        password:'123456',
        database: 'Bizum'
    });
}
// create the connection to database
const getConnectionDB = () =>{
    return connection;
}

module.exports = {
    initDB,
    getConnectionDB
};
