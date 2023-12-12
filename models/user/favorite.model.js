const mongoose=require('mongoose');
const favSchema=mongoose.Schema({
	user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    stylist_id:{type: mongoose.Schema.Types.ObjectId, ref: 'signups'},
	//weekdays:{type:String},
	favstylist:{type:Number},
	status:{type:String},
	created_at:{type:Date, default:Date.now},
	updated_at:{type:Date, default:Date.now}
})

module.exports=mongoose.model('favstylists',favSchema);