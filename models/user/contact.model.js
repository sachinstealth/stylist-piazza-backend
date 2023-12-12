const mongoose=require('mongoose')
const contactSchema=mongoose.Schema({
    type:{type:mongoose.Schema.Types.ObjectId,ref:'signups'},
    name:{type:String},
    email:{type:String},
    subject:{type:String},
    message:{type:String},
    status:{type:Number}
})
module.exports=mongoose.model('contacts',contactSchema);