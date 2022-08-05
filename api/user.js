var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
const auth = require('../midleware/auth')
var dbConnection = require('../db').getConnectionDB()

router.post('/login', async function(req, res) {
    // Our login logic starts here
  try {
    // Get user input
    console.log('cuerpo',req.body)
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const [ user ] =  await dbConnection.promise().query(`SELECT * FROM user WHERE user.email = "${email}"`);
    if (user[0] && (await bcrypt.compare(password, user[0].password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user[0].id, email },
        "TOKEn que debe estar en el env",
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user[0].token = token;
      await dbConnection.promise().query(`UPDATE user SET connected = 1 WHERE id = '${user[0].id}'`);  
      // user
      res.status(200).send(user[0]);
    }
    else res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

router.post('/register', async function(req, res) {
    try {
        // Ge
        // console.log(newUsers)
        const { name, surname, username, email, password } = req.body;
    
        // Validate user input
        if (!(email && password && name && surname && username)) {
          res.status(400).send("All input is required");
        }
    
        // check if user already exist
        // Validate if user exist in our database
        const [ oldUsers ] =  await dbConnection.promise().query(`SELECT * FROM user WHERE user.username = "${username}"`);
    
        if (oldUsers.length) {
          return res.status(409).send("User Already Exist. Please Login");
        }
        const encryptedPassword = await bcrypt.hash(password, 10);
        const [ dataInsertion ] =  await dbConnection.promise().query('INSERT INTO user (name, surname, username, email, password) VALUES (?,?,?,?,?)', [name, surname, username, email, encryptedPassword]);
        const [newUser] = await dbConnection.promise().query(`SELECT * FROM user WHERE user.id = "${dataInsertion.insertId}"`);

        
        res.status(201).json(newUser[0]);
      } catch (err) {
        console.log(err);
      }
});
 
router.get('/friends/:id',auth,  async (req, res)=>{
  const {id} = req.params
  const [ friendIds ] =  await dbConnection.promise().query({sql:`SELECT user2 FROM connection WHERE connection.user1 = "${id}"`, rowsAsArray: true});
  
  if(friendIds.length){ 
    const [ friends ] =  await dbConnection.promise().query(`SELECT * FROM user WHERE user.id in (${friendIds.toString()})`);
    res.status(200).send(friends);
  } else res.status(200).send([]);
})

module.exports = router;