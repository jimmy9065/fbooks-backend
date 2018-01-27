var userOp = require('./model/userDatabase')


exports.checkUser = function(username) {
  return new Promise((resolve, reject) => {
    userOp.findOne({'username': username}, 'password', (err, data) => {
      if(err){
        reject();
      }
      else{
        //console.log(data)
        resolve(data.toObject().password);
      }
    });
  });
}

//function(req, res){
//var record = new mongoOp();
//var response = {};
//record.username = req.body.username;
//record.userPassword = req.body.password;
//record.save(function(err){
//  if(err){
//    response = {"error" : true, "message" : "Error adding data"};
//  }
//  else{
//    response = {"error" : true, "message" : "Data added"};
//  }
//  res.json(response);
//

//module.exports = db;
