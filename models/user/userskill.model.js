const mongoose=require('mongoose');
const userSkillSchema=mongoose.Schema({
    user_id:{type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    category_id:{type: mongoose.Schema.Types.ObjectId, ref: 'categoryLists' },
    //service_id:{type: mongoose.Schema.Types.ObjectId, ref: 'services' },
    duration:{type:String},
	fee:{type:Number},
    skillname:{type:String}, 
    status:{type:Number},
    created_At:{type:Date,default:Date.now},
    updated_At:{type:Date,default:Date.now}
    });
module.exports=mongoose.model('userskills',userSkillSchema);