var express = require('express');
var router = express.Router();
var db = require('../database/mongoDB.js');
var CryptoJS = require('crypto-js');

var keyStr = "abcd";

router.use(function(req, res, next){
  console.log("*****************************************")
  console.log("New quest:")
  if(req.cookies.BOOKSUID != undefined){
    let rawCookie = req.cookies.BOOKSUID;
    if(/[a-zA-Z0-9]+@[a-zA-Z0-9\+\/]+/i.test(rawCookie)){
      console.log('pattern exists');
      matches = /@([a-zA-Z0-9\+\/=]+)/ig.exec(rawCookie)
      console.log('extracted: ' + matches[1])
      let decryptCookie = CryptoJS.AES.decrypt(matches[1], keyStr);
      let cookie = decryptCookie.toString(CryptoJS.enc.Utf8);

      console.log('new cookie assigned:')
      console.log(req.cookies.BOOKSUID)
      console.log("extract cookies")
      matches = cookie.match(/([^&]+)/ig);
      if(cookie && matches && matches[0] && matches[1]){
        req.body.username = matches[0];
        req.body.aptID = matches[1];
        next();
        return;
      }
      else{
        console.log('cookie is not correct')
      }
    }
    console.log("cookie is not valid")
  }
  else{
    console.log("request doesn't have a cookie")
    console.log(req.cookies)
  }
  res.sendStatus(400);
})

router.put('/insert', function(req, res){
  console.log(req.body);

  username = req.body.username;
  aptID = req.body.aptID;
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
})

router.get('/allTrans', function(req, res){
  username = req.body.username;
  aptID = req.body.aptID;
  db.queryAllTrans(username, aptID).then((data) => {
    res.status(200).send(data);
  })
  .catch((err) => {
    console.log('databse query error');
    res.sendStatus(400);
  });
})

router.get('/RecentTrans', function(req, res){
  username = req.body.username;
  aptID = req.body.aptID;

  console.log("start query")
  db.queryTopTrans(username, aptID).then((data) => {
    res.status(200).send(data);
  })
  .catch((err) => {
    console.log('databse query error');
    res.sendStatus(400);
  });
})

router.get('/due', function(req, res) {
  username = req.body.username;
  aptID = req.body.aptID;
    
  let userExpense = 0;
  let userDue = 0;
  let usersDist = null;

  console.log("query due for user:" + username + " at " + aptID);

  db.queryUsers(aptID).then((users) =>{
    db.queryUsersSpend(aptID).then((userspends) => {
      db.queryUserPay(aptID, username).then((userpayments) => {
        let nUsers = users.length;
        let totalExpense = 0, userExpense = 0;
        let userPay = 0;
        let due = 0;
        let tempUserSpends = userspends

        console.log('users');
        console.log(users);
        
        console.log('userspends');
        console.log(userspends);

        console.log('userpayments');
        console.log(userpayments);

        for(idx in userspends){
          if(userspends[idx]._id == username)
            userExpense = userspends[idx].total;
          totalExpense += userspends[idx].total;
        }

        console.log('s-nUsers:' + nUsers);
        console.log('s-totalExpense:' + totalExpense);
        console.log('s-userExpense:' + userExpense);

        due = totalExpense / nUsers - userExpense;

        if(userpayments.length > 0){
          due -= userpayments[0].amount;
          console.log('s-payment exists:' + userspends[0].amount);
        }

        console.log('s-query is done');
        console.log('s-user due:' + due);
        res.status(200).send({'due':due, 'details':tempUserSpends});

      })
      .catch('query user payment failed');
    })
    .catch(() => {
      console.log('query users spend failed');
      res.sendStatus(400);
    })
  })
  .catch(() => {
    console.log('query users failed');
    res.sendStatus(400);
  })
})

router.get('/dist', function(req, res) {
  username = req.body.username;
  aptID = req.body.aptID;

  console.log("query distribution for user:" + username + " at " + aptID);
  db.queryUserDist(username, aptID).then((data) => {
    console.log('send')
    res.status(200).send({data});
  })
  .catch((err) => {
    console.log('due query error')
    res.sendStatus(400);
  })
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
  username = req.body.username;
  aptID = req.body.aptID;

  let recordID = req.params.rid;
  let content = req.body;
  console.log("Update record:" + recordID + " for user:" + username + " at apt:" + aptID);
  db.editTrans(recordID, content).then((data) => {
    res.status(200).send(data);
  })
  .catch((err) => {
    res.sendStatus(400);
  });
})

router.delete('/del/:rid', function(req, res){
  username = req.body.username;
  aptID = req.body.aptID;

  let recordID = req.params.rid;
  console.log("Delete record:" + recordID + " for user:" + username + " at apt:" + aptID);
  db.deleteTrans(recordID, username, aptID).then((data) => {
    res.sendStatus(202);
  })
  .catch((err) => {
    res.sendStatus(404);
  });
})

module.exports = router
