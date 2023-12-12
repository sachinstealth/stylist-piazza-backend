const mongoose=require('mongoose');
const appointSchema=mongoose.Schema({
    user_id:{type:mongoose.Schema.Types.ObjectId,ref:'signups'},
    service_id:{type:mongoose.Schema.Types.ObjectId,ref:'userskills'},
    stylist_id:{type:mongoose.Schema.Types.ObjectId,ref:'userskills'},
    order_id:{type:mongoose.Schema.Types.ObjectId,ref:'bookorders'},
    canceltype:{type:mongoose.Schema.Types.ObjectId,ref:'signups'},
    skillname:{type:String},
    fee:{type:String},
    duration:{type:String},
    time:{type:String},
    bookingdateandtime:{type:Date},
    day:{type:String},
    bookingdate:{type:Date},
    bookingtime:{type:Date},
    appointmentstatus:{type:String},
    cancelreason:{type:String},
    canceldescription:{type:String},
    status:{type:Number},
    created_at:{type:Date, default:Date.now()},
    updated_at:{type:Date, default:Date.now()}
})
module.exports=mongoose.model('bookappointment',appointSchema);