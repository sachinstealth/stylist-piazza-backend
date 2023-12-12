const mongoose=require('mongoose')
const usercontactSchema=mongoose.Schema({
    name:{type:String},
    email:{type:String},
    subject:{type:String},
    message:{type:String},
    type:{type:String},
    status:{type:Number}
})
module.exports=mongoose.model('leads',usercontactSchema);