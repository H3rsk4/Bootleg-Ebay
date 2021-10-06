const express = require('express')
const app = express()
const port = 3000

const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

app.use(express.json())

const bcrypt = require('bcryptjs');

let userDatabase = [];

passport.use(new BasicStrategy(
  (username, password, done) =>{
    console.log('Basic strategy params, username: ' + username + ' password: ' + password);
    //done(null, false);  //no match

    const searchResult = userDatabase.find(user => {
      //(username === user.username) && (password === user.password)
      if(user.username === username) {
        if(bcrypt.compareSync(password, user.password)){
          return true;
        }
      }
      return false;
    });

    if(searchResult != undefined){
      done(null, searchResult);
    }else{
      done(null, false);
    }
    
  }
));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/protectedResource', passport.authenticate('basic', { session: false }), (req, res) => {
  //this api resource is now protected with HTTP Basic Authentication

  res.send('Authorization successful');
})


/* this route will receive data structure:
{
  "username": "foo"
  "password": "bar"
  "email": "foo@bar.com"
}
*/
app.post('/users', (req, res) => {

  const salt = bcrypt.genSaltSync(6);
  const hashedPassword = bcrypt.hashSync(req.body.password, salt)

  const newUser = {
    username: req.body.username,
    password: hashedPassword,
    email: req.body.email
  }

  userDatabase.push(newUser);
  res.sendStatus(201);
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
