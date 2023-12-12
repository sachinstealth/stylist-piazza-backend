const mongoose=require('mongoose');
const addressSchema=mongoose.Schema({
     user_id:{type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    // category_id:{type: mongoose.Schema.Types.ObjectId, ref: 'categoryLists' },
    // service_id:{type: mongoose.Schema.Types.ObjectId, ref: 'services' },
    address:{type:String},
    lat:{type:Number},
    long:{type:Number},
    status:{type:Number},
    type:{type:String},
    created_At:{type:Date,default:Date.now},
    updated_At:{type:Date,default:Date.now}
    });
module.exports=mongoose.model('useraddress',addressSchema);