var express = require('express');
var router = express.Router();
var db = require('../database/mongoDB.js');

router.put('/', function(req, res){
  console.log(req.cookies.BOOKSUID);
  console.log(req.body);

  let cookie = req.cookies.BOOKSUID;
  matches = cookie.match(/([^&]+)/ig);
  console.log(matches);
  if(cookie && matches && matches[0] && matches[1]){
    username = matches[0];
    aptID = matches[1];
    db.addTrans(req.body, username, aptID)
    .then(() => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.log('error: put request:')
      console.log('cookie: ' + cookie)
      console.log('body:')
      console.log(req.body)
      res.sendStatus(400);
    });
  }
  else
    res.sendStatus(400);
})

router.get('/allTrans', function(req, res){
  let username = req.cookies.BOOKSUID;
})

module.exports = router
