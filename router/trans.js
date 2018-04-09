var express = require('express');
var router = express.Router();
var db = require('../database/mongoDB.js');
var CryptoJS = require('crypto-js');
var redis = require('redis');
let client = redis.createClient();

client.on('error', function(err) {
  console.log('redis error on trans:' + err);
});

router.use(function(req, res, next){
  console.log("*****************************************")
  console.log("New quest:")
  if(req.cookies.BOOKSUID != undefined){
    client.get(req.cookies.BOOKSUID, function(err, reply) {
      if(err || reply==undefined || req.ip != JSON.parse(reply).ip){
        res.sendStatus(400);
        console.log("query token failed");
      }
      else{
        console.log("query: cookie existed in redis");
        res.status(202);
        userInfo = JSON.parse(reply);
        req.body.username = userInfo.username;
        req.body.aptID = userInfo.aptID;
        next();
      }
    });
  }
  else{
    console.log("request doesn't have a cookie")
    console.log(req.cookies)
    res.sendStatus(404);
  }
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
      db.queryUserPay(aptID, username).then((userspayments) => {
        let nUsers = users.length;
        let totalExpense = 0, userExpense = 0;
        let userPay = 0;
        let due = 0;
        let tempUserSpends = userspends;

        console.log('users');
        console.log(users);
        
        console.log('userspends');
        console.log(userspends);

        console.log('userpayments');
        console.log(userspayments);

        for(idx in userspends){
          if(userspends[idx]._id == username)
            userExpense = userspends[idx].total;
          totalExpense += userspends[idx].total;
        }

        console.log('s-nUsers:' + nUsers);
        console.log('s-totalExpense:' + totalExpense);
        console.log('s-userExpense:' + userExpense);

        due = totalExpense / nUsers - userExpense;

        for(idx in userspayments){
          console.log(idx, '  for user', userspayments[idx]._id, ' due amount:',userspayments[idx].amount);
          if(userspayments[idx]._id == username){
            due -= userspayments[idx].amount;
          }else{
            due += (userspayments[idx].amount / (nUsers - 1));
          }
        }

        console.log('s-query is done');
        console.log('s-user due:' + due);
        res.status(200).send({'due':due, 'details':tempUserSpends});

      }).catch(err => {
        console.log('query user payment failed');
        res.sendStatus(400);
      });
    }).catch(err => {
      console.log('query users spend failed');
      res.sendStatus(400);
    });
  }).catch(err => {
    console.log('query users failed');
    res.sendStatus(400);
  });
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
