const mongoose=require('mongoose');
const stylistreviewSchema=mongoose.Schema({
    from:{type:mongoose.Schema.Types.ObjectId,ref:'signups'},
    service_id:{type:mongoose.Schema.Types.ObjectId,ref:'userskills'},
    to:{type:mongoose.Schema.Types.ObjectId,ref:'signups'},
    image:{type:String},
    rating:{type:Number},
    message:{type:String},
    status:{type:Number},
    created_at:{type:Date, default:Date.now()},
    updated_at:{type:Date, default:Date.now()}
})
module.exports=mongoose.model('stylistreviews',stylistreviewSchema);