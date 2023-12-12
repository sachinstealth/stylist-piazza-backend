// const mongoose = require('mongoose');
// const latlongSchema = mongoose.Schema({
//     user_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'signups'
//     },
//     // category_id:{type: mongoose.Schema.Types.ObjectId, ref: 'categoryLists' },
//     // service_id:{type: mongoose.Schema.Types.ObjectId, ref: 'services' },
//     // lat:{type:Number},
//     //long:{type:Number},
//     location: {
//         type: {
//             type: String,
//             enum: ['Point']
//         },
//         coordinates: {
//             type: [Number]
//         }
//     },
    

// type: {type: String},
// status:{type: Number},
// created_At: {type: Date,default: Date.now},
// updated_At: {type: Date,default: Date.now}
// });
// latlongSchema.index({ location: "2dsphere" }); 
// module.exports = mongoose.model('latlongs', latlongSchema);




const mongoose=require('mongoose');
const latlongSchema=mongoose.Schema({
     user_id:{type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    // category_id:{type: mongoose.Schema.Types.ObjectId, ref: 'categoryLists' },
    // service_id:{type: mongoose.Schema.Types.ObjectId, ref: 'services' },
    lat:{type:Number},
    long:{type:Number},
	type:{type:String}, 
    status:{type:Number},
    created_At:{type:Date,default:Date.now},
    updated_At:{type:Date,default:Date.now}
    });
module.exports=mongoose.model('latlongs',latlongSchema);