let mongoose = require('mongoose'),
  userSchema = mongoose.Schema,
  passportLocalMongoose = require('passport-local-mongoose');
  
userSchema = new mongoose.Schema({
    username:String,    
    password:String,
    admin:Boolean,
    voted: Boolean
}); 
userSchema.plugin(passportLocalMongoose);  
module.exports = mongoose.model("User",userSchema);