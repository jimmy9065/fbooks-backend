createUserModel = function(mongoose){
  var Schema = mongoose.Schema;
  var userLoginSchema = new Schema({
    "username" : String,
    "userPassword" : String,
    "aptID": String
  });

  var userModel = mongoose.model('user', userLoginSchema);

  return userModel
}

createTransModel = function(mongoose){
  var Schema = mongoose.Schema;
  var transSchema = new Schema({
    "date": Date,
    "category": String,
    "description": String,
    "amount": Number,
    "isShared": Boolean,
    "owner": String,
    "aptID": String
  })

  var transModel = mongoose.model('item', transSchema);

  return transModel
}

module.exports = {
  CreateUserModel:createUserModel,
  CreateTransModel:createTransModel
}
