const mongoose=require('mongoose');
const termsSchema=mongoose.Schema({
    terms_of_Use:{type:String},
    privacy_policy:{type:String},
    status:{type:Number},
    created_at:{type:Date, default:Date.now},
    updated_at:{type:Date, default:Date.now,}
})
module.exports=mongoose.model('terms',termsSchema);