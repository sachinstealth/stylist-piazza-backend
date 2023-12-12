const mongoose=require('mongoose');
const GallerySchema=mongoose.Schema({
	//stylist_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
	stylist_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
	background_image:{type:String},
	status:{type:String},
	created_at:{type:Date, default:Date.now},
	updated_at:{type:Date, default:Date.now}
})

module.exports=mongoose.model('stylistgallerys',GallerySchema);