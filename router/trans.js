var express = require('express');
var router = express.Router();
var db = require('../database/mongoDB.js');

router.put('/', function(req, res){
  console.log(req.cookies.BOOKSUID);
  console.log(req.body);

  let username = req.cookies.BOOKSUID;
  db.addTrans(req.body, username).then(() => {
    res.sendStatus(201);
  })
  .catch(() => {
    res.sendStatus(400);
  });
})

router.get('/allTrans', function(req, res){
  let username = req.cookies.BOOKSUID;
})

module.exports = router
