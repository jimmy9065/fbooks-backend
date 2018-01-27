var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/demoDB')

var userSchema = mongoose.Schema;

var userLogin = new userSchema({
    "username" : String,
    "userPassword" : String
});

var model = mongoose.model('userDatabase', userLogin);

//var testcase = new model({name:'hoho'});

//testcase.save(function(err, testcase){
//  if(err)
//    console.log(err);
//  else
//    console.log('add successfully')
//});

module.exports = model;

