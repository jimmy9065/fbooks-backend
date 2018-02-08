var express = require('express');
var router = express.Router();
var CryptoJS = require('crypto-js');
var base64url = require('base64url');
var db = require('../database/mongoDB.js');
var redis = require('redis');
let client = redis.createClient();

client.on('error', function(err) {
  console.log('redis error:' + err);
})

var keyStr = "abcd";


router.get('/getpass', function(req, res){
  let encrypt = CryptoJS.AES.encrypt('123456',keyStr);
  let sencrypt = encrypt.toString(CryptoJS.enc.hex);

  res.status(200).send(base64url.encode(sencrypt));
});

router.get('/check', function(req, res) {
  console.log(req.cookies)
  if(req.cookies.BOOKSUID != undefined){
    client.get(req.cookies.BOOKSUID, function(err, reply) {
      if(err || reply==undefined || req.ip != JSON.parse(reply).ip){
        console.log(req.ip + " , " + JSON.parse(reply).ip)
        res.sendStatus(400);
        console.log("query token failed");
      }
      else{
        console.log("query existed in redis");
        res.status(202);
        res.send({"pass":true, "username":JSON.parse(reply).username});
      }
    });
  } 
  else{
    console.log("check cookie not exists")
    res.sendStatus(404);
  }
});

router.get('/', function(req, res){
  response = {"pass": false, "cookie": ''};
  console.log(req.headers.guid)
  
  if(req.query.username && req.query.token && req.headers.guid){
    console.log('username: ' + req.query.username);
    console.log('token: ' + req.query.token);
    console.log('guid: ' + req.headers.guid)

    let GUID = req.headers.guid;
    let username = req.query.username;
   
    res.status(200);
    db.checkUser(username)
    .then((userRecord) =>{
      console.log('userRecord:' +
        userRecord.username + ", " +
        userRecord.password + ", " +
        userRecord.aptID);
      
      let decodedPassword = base64url.decode(req.query.token);
      let decryptPassword = CryptoJS.AES.decrypt(decodedPassword, userRecord.password);
      let decodedGUID = decryptPassword.toString(CryptoJS.enc.Utf8);

      console.log('real GUID:' + GUID);
      console.log('deco GUID:' + decodedGUID);

      if(userRecord && decodedGUID == GUID){
        console.log('password is correct')
        client.set(req.query.token,
          JSON.stringify({
            'ip':req.ip,
            'username':userRecord.username,
            'aptID':userRecord.aptID}));
        response.pass = true;
        response.cookie = req.query.token;
        //res.append('Set-Cookie', 'BOOKUID=' + response.cookie + ';DOMAIN=.jimmy9065.ddns.net;MAX-AGE=86400')
      }
      else{
        console.log('username and password is not match')
      }
      res.send(response);
    })
    .catch(() => {
      console.log('catch error')
      res.send(response);
    })
  }
  else{
    console.log('empty username and password')
    res.send(response);
  }
})

module.exports = router;
