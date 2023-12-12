const mongoose=require('mongoose');
const reviewSchema=mongoose.Schema({
    user_id:{type:mongoose.Schema.Types.ObjectId,ref:'signups'},
    //service_id:{type:mongoose.Schema.Types.ObjectId,ref:'userskills'},
    stylist_id:{type:mongoose.Schema.Types.ObjectId,ref:'userskills'},
    image:{type:String},
    rating:{type:String},
    message:{type:String},

    status:{type:Number},
    created_at:{type:Date, default:Date.now()},
    updated_at:{type:Date, default:Date.now()}
})
module.exports=mongoose.model('stylistreviews',reviewSchema);