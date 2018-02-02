var express = require('express');
var router = express.Router();
var db = require('../database/mongoDB.js');
var CryptoJS = require('crypto-js');

var keyStr = "abcd";

router.use(function(req, res, next){
  if(req.cookies.BOOKSUID != undefined){
    let cookie = req.cookies.BOOKSUID;
    if(/[a-zA-Z0-9]+@[a-zA-Z0-9\+\/]+/i.test(cookie)){
      console.log('pattern exists');
      matches = /@([a-zA-Z0-9\+\/=]+)/ig.exec(cookie)
      console.log('extracted: ' + matches[1])
      let decryptCookie = CryptoJS.AES.decrypt(matches[1], keyStr);
      req.cookies.BOOKSUID = decryptCookie.toString(CryptoJS.enc.Utf8);
      console.log('new cookie:')
      console.log(req.cookies.BOOKSUID)
      next();
      return;
    }
    else
      console.log("cookie is not valid")
  }
  else{
    console.log("request don't have a cookie")
    console.log(req.cookies)
  }
  res.sendStatus(400);
})

router.put('/insert', function(req, res){
  console.log(req.body);

  let cookie = req.cookies.BOOKSUID;
  matches = cookie.match(/([^&]+)/ig);
  console.log(matches);
  if(cookie && matches && matches[0] && matches[1]){
    username = matches[0];
    aptID = matches[1];
    db.addTrans(req.body, username, aptID)
    .then((_id) => {
      console.log('inserted record id: ' + _id);
      res.status(201).send({'_id':_id});
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

    console.log("start query")
    db.queryAllTrans(username, aptID).then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log('databse query error');
      res.sendStatus(400);
    });
  }
  else{
    console.log('cookie is not correct');
    res.sendStatus(400);
  }
})

router.get('/RecentTrans', function(req, res){
  let cookie = req.cookies.BOOKSUID;
  matches = cookie.match(/([^&]+)/ig);
  console.log(matches);
  if(cookie && matches && matches[0] && matches[1]){
    username = matches[0];
    aptID = matches[1];

    console.log("start query")
    db.queryTopTrans(username, aptID).then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log('databse query error');
      res.sendStatus(400);
    });
  }
  else{
    console.log('cookie is not correct');
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

router.get('/due', function(req, res) {
  let cookie = req.cookies.BOOKSUID;
  let matches = cookie.match(/([^&]+)/ig);
  console.log(matches);
  if(cookie && matches && matches[0] && matches[1]){
    let username = matches[0];
    let aptID = matches[1];

    console.log("query due for user:" + username + " at " + aptID);
    db.queryUserSpend(aptID).then((data) => {
      let userExpense = null;
      let total = 0;
      let ret = 0;
      if(data){
        console.log(data)
        for(idx in data){
          if(data[idx]._id==username)
            userExpense =  data[idx].total;
          total += data[idx].total;
        }
        console.log(total)
        ret = total / data.length - userExpense;
        console.log(ret)
      }
      console.log('send')
      res.status(200).send({'due':ret, 'details':data});
    })
    .catch((err) => {
      console.log('due query error')
      res.sendStatus(400);
    })
  }
})

router.get('/dist', function(req, res) {
  let cookie = req.cookies.BOOKSUID;
  let matches = cookie.match(/([^&]+)/ig);
  console.log(matches);
  if(cookie && matches && matches[0] && matches[1]){
    let username = matches[0];
    let aptID = matches[1];

    console.log("query distribution for user:" + username + " at " + aptID);
    db.queryUserDist(username, aptID).then((data) => {

      console.log('send')
      res.status(200).send({data});
    })
    .catch((err) => {
      console.log('due query error')
      res.sendStatus(400);
    })
  }
})

router.put('/update/:rid', function(req, res){
  let recordID = req.params.rid;
  let content = req.body;
  console.log("Update records:" + recordID);
  db.editTrans(recordID, content).then((data) => {
    res.status(200).send(data);
  })
  .catch((err) => {
    res.sendStatus(400);
  });
})

router.delete('/del/:rid', function(req, res){
  let recordID = req.params.rid;
  console.log("Delete record:" + recordID);
  db.deleteTrans(recordID).then((data) => {
    res.sendStatus(202);
  })
  .catch((err) => {
    res.sendStatus(404);
  });
})

module.exports = router
