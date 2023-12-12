const mongoose=require('mongoose');
const CategoriesSchema=mongoose.Schema({
    category_name:{type:String},
    category_logo:{type:String},  
    status:{type:Number},
    map:{type:Number},
    home:{type:Number},
    explore:{type:Number},
    created_At:{type:Date,default:Date.now},
    updated_At:{type:Date,default:Date.now}
    });
module.exports=mongoose.model('categoryLists',CategoriesSchema);