const mongoose=require('mongoose');
const reviewimageSchema=mongoose.Schema({
    //user_id:{type:mongoose.Schema.Types.ObjectId,ref:'signups'},
    //service_id:{type:mongoose.Schema.Types.ObjectId,ref:'userskills'},
    review_id:{type:mongoose.Schema.Types.ObjectId,ref:'reviews'},
    image:{type:String},
   status:{type:Number},
    created_at:{type:Date, default:Date.now()},
    updated_at:{type:Date, default:Date.now()}
})
module.exports=mongoose.model('reviewimages',reviewimageSchema);