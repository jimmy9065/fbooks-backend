var express = require('express');
var router = express.Router();
//router.use(function timeLog(req, res, next){
//  console.log('Time: ', Date.now());
//  next();
//})

router.use('/login', require('./user'));
router.use('/trans', require('./trans'));

module.exports = router;
