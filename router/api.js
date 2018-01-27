const base64url = require('base64url');
var db = require('../database/mongoDB.js');

var express = require('express');
var router = express.Router();
var CryptoJS = require('crypto-js');

//router.use(function timeLog(req, res, next){
//  console.log('Time: ', Date.now());
//  next();
//})
var keyStr = "abcd";

router.get('/getpass', function(req, res){
  let encrypt = CryptoJS.AES.encrypt('123456',keyStr);
  let sencrypt = encrypt.toString(CryptoJS.enc.hex);

  var tmp = base64url.encode(sencrypt);
  console.log("coded version:")
  console.log(tmp);
  var tmp2 = base64url.decode(tmp);
  console.log("decoded version:")
  console.log(tmp2);

  let date = CryptoJS.AES.decrypt(tmp2, keyStr);
  let spassword = date.toString(CryptoJS.enc.Utf8);

  console.log('decrypt password:'+spassword)

  res.status(200);
  res.send(base64url.encode(sencrypt));
})


router.get('/login', function(req, res){
  let username = req.query.username;
  let password = req.query.password;

  console.log("params")
  console.log(password)

  password = base64url.decode(password);
  console.log("decoded")
  console.log(password)

  let date = CryptoJS.AES.decrypt(password, keyStr);

  console.log('decrypted')
  console.log(date)

  let spassword = date.toString(CryptoJS.enc.Utf8);

  console.log('into str')
  console.log(spassword)
 
  res.status(200);
  db.checkUser(username)
  .then((pass) =>{
    if(pass == spassword)
      res.send("correct");
    else
      res.send("wrong");
  })
  .catch(() => {
    res.send("wrong");
  });
})

router.post('/login', function(req, res){
  let username = req.body.username;
  let password = req.body.password;

  console.log(username)
  console.log(password)

  let date = CryptoJS.AES.decrypt(req.body.password, keyStr);

  console.log('decrypted')
  console.log(date)

  let spassword = date.toString(CryptoJS.enc.Utf8);

  console.log('into str')
  console.log(spassword)
 
  res.status(200);
  db.checkUser(username)
  .then((pass) =>{
    if(pass == spassword)
      res.send("correct");
    else
      res.send("wrong");
  })
  .catch(() => {
    res.send("wrong");
  });
})

module.exports = router;
