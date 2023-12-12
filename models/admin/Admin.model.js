const mongoose=require('mongoose');
const AdminSchema=mongoose.Schema({
    admin_email:{type:String},
    admin_password:{type:String},
    passToken:{type:String},
    status:{type:Number },
    created_at:{type:Date, default: Date.now},
    jwtToken:{type:String},
    });

module.exports=mongoose.model('Admin',AdminSchema);

