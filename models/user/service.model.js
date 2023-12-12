const mongoose=require('mongoose');
const userServiceSchema=mongoose.Schema({
	stylist_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    category_id:{type: mongoose.Schema.Types.ObjectId, ref: 'categoryLists' },	
	service:{type:String},
	status:{type:String},
	created_at:{type:Date, default:Date.now},
	updated_at:{type:Date, default:Date.now}
})

module.exports=mongoose.model('services',userServiceSchema);