const mongoose=require('mongoose');
const imageSchema=mongoose.Schema({
   
    image:{type:String},
    vedio:{type:String},
    });
module.exports=mongoose.model('staticdatas',imageSchema);