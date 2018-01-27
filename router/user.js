var express = require('express');
var router = express.Router();
var CryptoJS = require('crypto-js');
var base64url = require('base64url');
var db = require('../database/mongoDB.js');

var keyStr = "abcd";

router.get('/getpass', function(req, res){
  let encrypt = CryptoJS.AES.encrypt('123456',keyStr);
  let sencrypt = encrypt.toString(CryptoJS.enc.hex);

  res.status(200).send(base64url.encode(sencrypt));
})


router.get('/', function(req, res){
  let username = req.query.username;
  let decodedPassword = base64url.decode(req.query.password);
  let decryptPassword = CryptoJS.AES.decrypt(decodedPassword, keyStr);
  let password = decryptPassword.toString(CryptoJS.enc.Utf8);
 
  response = {"pass": false, "cookie": ''};
  res.status(200);
  db.checkUser(username)
  .then((pass) =>{
    if(pass == password){
      response.pass = true;
      response.cookie = decodedPassword;
    }
    res.send(response);
  })
  .catch(() => {
    console.log('catch error')
    res.send(response);
  })
})

router.post('/', function(req, res){
  let username = req.body.username;
  let decodedPassword = base64url.decode(req.body.password);
  let password = CryptoJS.AES.decrypt(decodedPassword, keyStr)
                         .toString(CryptoJS.enc.Utf8);
 
  response = {"pass": true, "cookie": ''};
  res.status(200);
  db.checkUser(username)
  .then((pass) =>{
    if(pass == password){
      response.pass = true;
      response.cookie = decodedPassword;
    }
    res.send(response);
  })
  .catch(() => {
    res.send(response);
  })
})

module.exports = router;
