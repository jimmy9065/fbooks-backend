var express = require('express');
var router = express.Router();
var db = require('../database/mongoDB.js');

router.put('/insert', function(req, res){
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
  let cookie = req.cookies.BOOKSUID;
  matches = cookie.match(/([^&]+)/ig);
  console.log(matches);
  if(cookie && matches && matches[0] && matches[1]){
    username = matches[0];
    aptID = matches[1];

    db.queryAllTrans(username, aptID).then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.sendStatus(400);
    });
  }
  else{
    res.sendStatus(400);
  }
})

router.get('/onetran/:rid', function(req, res) {
  let recordID = req.params.rid;
  db.queryOneTran(recordID).then((data) => {
    res.status(200).send(data);
  })
  .catch((err) => {
    res.sendStatus(404);
  });
})

router.put('/update/:rid', function(req, res){
  let recordID = req.params.rid;
  let content = req.body;
  db.editTrans(recordID, content).then((data) => {
    res.status(200).send(data);
  })
  .catch((err) => {
    res.sendStatus(400);
  });
})

router.delete('/del/:rid', function(req, res){
  let RecordID = req.params.rid;
  db.deleteTrans(RecordID).then((data) => {
    res.sendStatus(202);
  })
  .catch((err) => {
    res.sendStatus(404);
  });
})

module.exports = router
