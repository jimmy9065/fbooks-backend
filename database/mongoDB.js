var mongoose = require('mongoose');
const dbOptions = {
  autoReconnect: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000
}

mongoose.connect('mongodb://localhost:27017/demoDB', dbOptions).then(
  () => {
    console.log("Database successfully connected");
  },
  err  => {
    console.log("Can not connect to database")
  })

var models = require('./models.js'); 

var createUserModel = models.CreateUserModel;
var createTransModel = models.CreateTransModel;

var userModel = createUserModel(mongoose);
var transModel = createTransModel(mongoose);

checkUser = function(username) {
  return new Promise((resolve, reject) => {
    console.log("query user: " + username);
    userModel.findOne({'username': username}, (err, data) => {
      if(err){
        console.log("data query error");
        reject();
      }
      else{
        if(data){
          let result = data.toObject()
          console.log('found record')
          console.log(data)
          resolve(data.toObject());
        }
        else
          resolve(null);
      }
    });
  });
}

addTrans = function(trans, username, aptID) {
  console.log("output: addTrans for user: " + username + " at " + aptID);

  return new Promise((resolve, reject) => {
    insertData = new transModel({ 'owner':username,
                                  'date': trans.date,
                                  'category': trans.category,
                                  'description': trans.description,
                                  'isShared': trans.isShared,
                                  'amount' : trans.amount,
                                  'aptID' : aptID
    });

    insertData.save(function(err){
      if(err){
        reject(err);
      }
      else{
        resolve();
      }
    })
  })
}

queryAllTrans = function(username, aptID) {
  console.log("output: queryAllTrans for user: " + username + " at " + aptID);
  return new Promise((resolve, reject) => {
    transModel.find({'owner': username, 'aptID': aptID}, (err, data) => {
      if(err){
        console.log("query all trans failed");
        reject();
      }
      else{
        resolve(data);
      }
    })
  })
}

queryOneTran = function(recordID) {
  console.log("output: query one record for id:" + recordID);
  return new Promise((resolve, reject) => {
    transModel.findById(recordID, (err, data) => {
      if(err){
        console.log("query one data failed");
        reject();
      }
      else{
        resolve(data);
      }
    })
  })
}


editTrans = function(recordID, updates) {
  console.log("output: edit Trans for id=" + recordID);
  return new Promise((resolve, reject) => {
    transModel.findByIdAndUpdate(recordID, updates, (err, data) => {
      if(err){
        console.log("delete trans " + recordID + " failed");
        reject();
      }
      else{
        resolve();
      }
    })
  })
}

deleteTrans = function(recordID) {
  console.log("output: delete Trans for id=" + recordID);
  return new Promise((resolve, reject) => {
    transModel.deleteOne({_id: recordID}, (err, data) => {
      if(err){
        console.log("delete trans " + recordID + " failed");
        reject();
      }
      else{
        resolve();
      }
    })
  })
}

module.exports = {
  checkUser: checkUser,
  addTrans: addTrans,
  queryAllTrans: queryAllTrans,
  queryOneTran: queryOneTran,
  editTrans: editTrans,
  deleteTrans: deleteTrans
}
