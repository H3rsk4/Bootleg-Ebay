const express = require('express')
const app = express()
const port = 3000

const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

app.use(express.json())

const bcrypt = require('bcryptjs');

const { v4: uuidv4 } = require('uuid');

let userDatabase = [];
let postDatabase = [];

passport.use(new BasicStrategy(
  (username, password, done) =>{
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
      //console.log(searchResult)
      done(null, searchResult);
    }else{
      done(null, false);
    }
    
  }
));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/users/:id', passport.authenticate('basic', { session: false }), (req, res) => {
  //this api resource is protected with HTTP Basic Authentication

  //we only show the user if it matches with ours
  if(req.params.id === req.user.userId){
    const user = userDatabase.find(u => u.userId === req.params.id)
    if(user === undefined){
      res.sendStatus(404);
    }else{
      res.json(user);
    }
  }else{
    res.sendStatus(401)
  }
  
  //res.send('Authorization successful');
})

app.put('/users/:id', passport.authenticate('basic', { session: false }), (req, res) => {
  //this api resource is protected with HTTP Basic Authentication

  //we only show the user if it matches with ours
  if(req.params.id === req.user.userId){
    user = userDatabase.find(u => u.userId === req.params.id)
    if(user === undefined){
        res.sendStatus(404);
    }else{
      
      const salt = bcrypt.genSaltSync(6);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt)
      

      user.username = req.body.username;
      user.password = hashedPassword;
      user.email = req.body.email;
      //console.log(user.username)

      res.sendStatus(200);
    }
  }else{
    res.sendStatus(401)
  }
  
  //res.send('Authorization successful');
})

app.delete('/users/:id', passport.authenticate('basic', { session: false }), (req, res) => {
  //this api resource is protected with HTTP Basic Authentication

  //we only show the user if it matches with ours
  if(req.params.id === req.user.userId){
    const user = userDatabase.find(u => u.userId === req.params.id)
    if(user === undefined){
        res.sendStatus(404);
    }else{
      var index = userDatabase.indexOf(user);
      userDatabase.splice(index, 1);
      res.sendStatus(200);
    }
  }else{
    res.sendStatus(401)
  }
  
})

//this is for debugging purposes only
app.get('/users', (req, res) => {
  res.json(userDatabase);
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
    userId: uuidv4(),
    username: req.body.username,
    password: hashedPassword,
    email: req.body.email
  }

  userDatabase.push(newUser);
  //res.send(newUser.userId);
  res.sendStatus(201);
})



app.get('/posts', (req, res) => {
  res.json(postDatabase);
})

app.post('/posts', passport.authenticate('basic', { session: false }), (req, res) => {
  //this api resource is protected with HTTP Basic Authentication
  //res.send('Authorization successful');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
