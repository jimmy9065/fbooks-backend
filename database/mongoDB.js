var mongoose = require('mongoose');
const dbOptions = {
  autoReconnect: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000
}

mongoose.connect('mongodb://127.0.0.1/app', dbOptions).then(
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
        console.log("checkuser query error");
        reject(err);
      }
      else{
        if(data){
          console.log('found record');
          console.log(data);
          resolve(data.toObject());
        }
        else{
          console.log('no record');
          resolve(null);
        }
      }
    });
  });
}

queryUsers = function(aptID) {
  return new Promise((resolve, reject) => {
    console.log("query usernames from apt:" + aptID);
    userModel.find({'aptID':aptID},{'username':1, '_id':false}, (err, data) => {
      if(err || data.length == 0){
        console.log("username query failed or empty");
        reject();
      }
      else{
        if(data){
          console.log('found usernames')
          console.log(data)
          resolve(data);
        }
        else
          resolve(null);
      }
    });
  });
}

queryUsersSpend = function(aptID) {
  console.log("query total expense for atp: " + aptID);
  return new Promise((resolve, reject) => {
    transModel.aggregate(
      [
        {$match:{aptID:aptID, category: {$ne:'payment'}}},
        {$group:{_id:'$owner', total: {$sum:'$amount'}}},
      ], (err, data) => {
        if(err){
          console.log("query expense sum failed");
          reject();
        }
        else{
          if(data){
            console.log('calculated roommate expense sum');
            console.log(data);
            resolve(data);
          }
          else{
            console.log('data is empty');
            resolve(null);
          }
        }
    });
  });
}

queryUserPay = function(aptID) {
  console.log("query total pay for user: " + username);
  return new Promise((resolve, reject) => {
    transModel.aggregate(
      [
        {$match:{aptID:aptID, category: 'payment'}},
        {$group:{_id:"$owner", amount:{$sum:'$amount'}}},
      ], (err, data) => {
        if(err){
          console.log("query expense sum failed");
          reject();
        }
        else{
          if(data){
            console.log('calculated user payment');
            console.log(data);
            resolve(data);
          }
          else{
            console.log('data is empty');
            resolve(null);
          }
        }
    });
  });
}

queryUserDist = function(username, aptID) {
  console.log("query user expense dist for user:" +username + " at atp: " + aptID);
  return new Promise((resolve, reject) => {
    transModel.aggregate(
      [
        {$match:{aptID:aptID, owner: username, category: {$ne: 'payment'}}},
        {$group:{_id:'$category', amount: {$sum:"$amount"}}}
      ], (err, data) => {
        if(err){
          console.log("query user dist failed");
          reject();
        }
        else{
          if(data){
            console.log('calculated user expense dist');
            console.log(data);
            resolve(data);
          }
          else{
            console.log('data is empty')
            resolve(null);
          }
        }
      }
    )
  })
    
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
        resolve(insertData._id);
      }
    })
  })
}

//queryAllTrans = function(username, aptID) {
//  console.log("output: queryAllTrans for user: " + username + " at " + aptID);
//  return new Promise((resolve, reject) => {
//    transModel.find({'aptID': aptID}, (err, data) => {
//      if(err){
//        console.log("query all trans failed");
//        reject();
//      }
//      else{
//        resolve(data);
//      }
//    })
//  })
//}

queryAllTrans = function(username, aptID) {
  console.log("output: queryAllTrans for user: " + username + " at " + aptID);
  return new Promise((resolve, reject) => {
    transModel.find({'aptID': aptID})
    .sort('-date')
    .exec((err, data) => {
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

queryTopTrans = function(username, aptID) {
  console.log("output: queryTopTrans for user: " + username + " at " + aptID);
  return new Promise((resolve, reject) => {
    transModel.find({'aptID': aptID})
    .limit(25)
    .sort('-date')
    .exec((err, data) => {
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
        console.log("edit trans " + recordID + " failed");
        reject();
      }
      else{
        resolve();
      }
    })
  })
}

deleteTrans = function(recordID, username, aptID) {
  console.log("output: delete Trans for id=" + recordID);
  return new Promise((resolve, reject) => {
    transModel.deleteOne({_id: recordID, owner: username, aptID: aptID}, (err, data) => {
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
  queryTopTrans: queryTopTrans,
  queryOneTran: queryOneTran,
  queryUsers:queryUsers,
  queryUsersSpend:queryUsersSpend,
  queryUserPay:queryUserPay,
  queryUserDist:queryUserDist,
  editTrans: editTrans,
  deleteTrans: deleteTrans
}
