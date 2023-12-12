const mongoose=require('mongoose');
const appointSchema=mongoose.Schema({
    user_id:{type:mongoose.Schema.Types.ObjectId,ref:'signups'},
    service_id:{type:mongoose.Schema.Types.ObjectId,ref:'userskills'},
    stylist_id:{type:mongoose.Schema.Types.ObjectId,ref:'signups'},
    canceltype:{type:mongoose.Schema.Types.ObjectId,ref:'signups'},
    skillname:{type:String},
    fee:{type:String},
    duration:{type:String},
    time:{type:String},
    cancelreason:{type:String},
    canceldescription:{type:String},
    bookingdateandtime:{type:Date},
    bookingdate:{type:Date},
    bookingtime:{type:String},
    address:{type:String},
    appointmentstatus:{type:String},
    day:{type:String},
    status:{type:Number},
    canceltype:{type:String},
    created_at:{type:Date, default:Date.now()},
    updated_at:{type:Date, default:Date.now()}
})
module.exports=mongoose.model('bookorders',appointSchema);