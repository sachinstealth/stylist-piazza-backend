const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {    
    stylist: {
        type:mongoose.Schema.Types.ObjectId,ref:'signups'
 
     },
     user: {
         type:mongoose.Schema.Types.ObjectId,ref:'signups'
 
       },  
       status:{
        type:String
       }
  },
  {
    timestamps: true
  }
);

let Chat = mongoose.model("chatID", chatSchema);

module.exports = Chat;
