let mongoose = require('mongoose'),
  pollSchema = mongoose.Schema;
  
pollSchema = new mongoose.Schema({
    title:String,
    options:Array
}); 

module.exports = mongoose.model("Poll",pollSchema);