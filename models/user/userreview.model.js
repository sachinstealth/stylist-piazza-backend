const mongoose=require('mongoose');
const userreviewSchema=mongoose.Schema({
    to:{type:mongoose.Schema.Types.ObjectId,ref:'signups'},
    service_id:{type:mongoose.Schema.Types.ObjectId,ref:'userskills'},
    from:{type:mongoose.Schema.Types.ObjectId,ref:'signups'},
    image:{type:String},
    rating:{type:Number},
    message:{type:String},
   status:{type:Number},
    created_at:{type:Date, default:Date.now()},
    updated_at:{type:Date, default:Date.now()}
})
module.exports=mongoose.model('userreviews',userreviewSchema);