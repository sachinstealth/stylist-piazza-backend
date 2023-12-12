const mongoose=require('mongoose');
const kycSchema=mongoose.Schema({
    user_id:{type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    country:{type:String}, 
    type:{type:String}, 
    verifystatus:{type:String},
    frontimage:{type:String},
    backimage:{type:String},
    faceimage:{type:String},
    status:{type:Number},
    created_At:{type:Date,default:Date.now},
    updated_At:{type:Date,default:Date.now}
    });
module.exports=mongoose.model('kycs',kycSchema);