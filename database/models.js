createUserModel = function(mongoose){
  var Schema = mongoose.Schema;
  var userLoginSchema = new Schema({
    "username" : String,
    "userPassword" : String
  });

  var userModel = mongoose.model('userDatabase', userLoginSchema);

  return userModel
}

createTransModel = function(mongoose){
  var Schema = mongoose.Schema;
  var transSchema = new Schema({
    "data": Date,
    "category": String,
    "description": String,
    "amount": Number,
    "isShared": Boolean,
    "owner": String
  })

  // Getter
  transSchema.path('amount').get(function(num) {
    return (num / 100).toFixed(2);
  });

  // Setter
  transSchema.path('amount').set(function(num) {
    return num * 100;
  });

  var transModel = mongoose.model('transDatabase', transSchema);

  return transModel
}

module.exports = {
  CreateUserModel:createUserModel,
  CreateTransModel:createTransModel
}
