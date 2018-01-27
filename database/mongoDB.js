var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/demoDB')
var models = require('./models.js'); 

var createUserModel = models.CreateUserModel;
var createTransModel = models.CreateTransModel;

var userModel = createUserModel(mongoose);
var transModel = createTransModel(mongoose);

checkUser = function(username) {
  return new Promise((resolve, reject) => {
    console.log("query user: " + username);
    userModel.findOne({'username': username}, 'password', (err, data) => {
      if(err){
        console.log("data query error");
        reject();
      }
      else{
        resolve(data.toObject().password);
      }
    });
  });
}

addTrans = function(trans, username) {
  console.log("output: addTrans for user: " + username);

  return new Promise((resolve, reject) => {
    new insertData = new transModel({ 'owner':username,
                                      'data': trans.data,
                                      'category': trans.category,
                                      'description': trans.description,
                                      'isShared': trans.isShared});
    insertData.save(function(err, data){
      if(err){
        reject();
      }
      else{
        resolve();
      }
    })
  })
}

queryAllTrans = function(username) {
  console.log("output: " + username);
  return new Promise((resolve, reject) => {
    transModel.find({'owner': username}, (err, data) => {
      if(err){
        console.log("query all trans for " + username + " failed");
        reject();
      }
      else{
        resolve(data);
      }
    })
  })
}

module.exports = {
  checkUser: checkUser,
  queryData: queryData
}
