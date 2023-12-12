const mongoose=require('mongoose');
const StylistSchema=mongoose.Schema({
	//stylist_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
	weekdays:{type:String},
	status:{type:String},
	created_at:{type:Date, default:Date.now},
	updated_at:{type:Date, default:Date.now}
})

module.exports=mongoose.model('stylistweeks',StylistSchema);