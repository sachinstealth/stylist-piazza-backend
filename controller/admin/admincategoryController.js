const express=require('express');
const categoryDB=require('../../models/user/categoryList.model.js');
const signDB = require('../../models/user/Signup.model.js')
const serviceDB = require('../../models/user/service.model.js')
const reviewsDB = require('../../models/user/stylistreviews.model.js');
const kycDB=require('../../models/user/kyc.model.js');
const img=require('../../config/db.js');
const {ObjectId} = require('mongodb');
const {
    success,
    errorResponse,
    successWithData,
    validationError,
    notFound
} = require('../../helpers/apiResponse');
var fs = require('fs');
var path = require('path');
const multer = require('multer');
const verifyToken=require('../../middleware/authentication.js');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../nodeAPI/uploads/', );
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const uploadImg = multer({
    storage: storage
}).single('category_logo');


module.exports={
    verifyToken,
    uploadImg,
createCategory: async function (req, res) {
        try {
            const category_name = req.body.category_name
            const category_logo = req.file.path
            //console.log('abc',category_logo)
           // console.log('img', img.imgUrl)
           if (!(category_name != '' && category_logo != '')) {
                return validationError(res, 'Require All Fields');
            }
            const Oldcategory = await categoryDB.findOne({
                category_name
            }).lean();
            if (Oldcategory) {
                return success(res, "Category Already Exist");
            } else {
                if (Oldcategory == null) {
                    const user = await categoryDB.create({
                        category_name,
                        //category_logo
                    })
                    //console.log("category_logo", category_logo)
                    var imagename = category_logo.split('/');
                     //console.log("imagename",imagename);
                    user.category_logo =  imagename[3],

                        user.category_name = req.body.category_name,
                        user.status=1
                        //console.log('xyz',category_logo);
                    await user.save((err, doc) => {
                        if (err) {
                            return errorResponse(res, 'Please Try Again')
                        } else {
                            
                            return success(res, 'Data Submitted Successfully')
                        }
                    });
                }else{
                    return errorResponse(res,'Error while enter Category');
                }
            }
        } catch (err) {
            console.log(err);
        }
    },
    //---------------------------------------------------update---------------------------------------------//
    updateCategory: async function (req, res) {
        try {
            const category_name = req.body.category_name
            const category_logo = req.file
           if (!(category_name && category_logo)) {
                return validationError(res, 'Required All Fields')
            }
           
            const updatedData = await categoryDB.findById({
                _id:req.body.id
            }).select({_id:1}).lean();
             console.log('update', updatedData);
            if (updatedData) {
                var imagename1 = category_logo.split('/');
                var newvalues = {
                    $set: {
                        category_name: category_name,
                        category_logo: imagename1[3],
                    }
                }
                console.log('newvalues', newvalues);
                categoryDB.updateOne(updatedData,newvalues, (err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Error While Updating Category ')
                    } else {
                        return successWithData(res, 'Category Successfully Updated', doc);
                    }
                })
            } else {
                return errorResponse(res, 'Category Not Updated');
            }
        } catch (err) {
            console.log(err);
        }
    },
    // --------------------------------------------get----------------------------------------------------//
    getAllCategory: async function (req, res) {
        try {
             categoryDB.find(function (err, doc) {
                if (err) {
                    return notFound(res,'Please Try Again')
                } else {
                    if(doc.length > 0){

                     return successWithData(res, 'Data Found Successfully', doc)
                }else{
                    return errorResponse(res, 'Data Not Found')
                } 
                }
            })
        } catch (err) {
            console.log(err);
        }
    },



    ///////////////-------------------------view category----------------//
     viewCategory: async function (req, res) {
        try {
            // const profile_id=req.user.id;
            // var _id=profile_id;
            const viewData=await categoryDB.findById({_id:req.body.id});
            if(viewData){
                return successWithData(res,'Data Successfully Found',viewData)
            }else{
                return errorResponse(res,'Data Not Found');
            }
           
            
        } catch (err) {
            console.log(err);
        }
    },



    //-------------------------------------------------DELETE---------------------------------------------------//
    deleteCategory: async function (req, res) {
        try{
      // const {
      //       id
      //   } = req.body;
      // const profile_id=req.user.id

      //   var _id = profile_id;
        const deletedData = await categoryDB.findById({_id:req.body.id}).lean();
        //console.log('delete',deletedData);
        if (deletedData) {
          categoryDB.deleteOne(deletedData,(err, doc) => {
                if (err) {
                    return errorResponse(res, "Please Try Again");
                } else {
                    return success(res, "Data Successfully Deleted");
                }
            })
        }else{
            return notFound(res,'Data Not Found');
        }
    }catch(err){
        console.log(err);
    }
    },

     updateCategoryStatus: async function (req, res) {
        try {
           // console.log('updateCategoryStatus',req.body);
            //var status = '';
            // if (req.body.status == 1) {
            //     status = 0;
            // } else {
            //     status = 1;
            // }
            // var newvalues = {
            //     $set: {
                    
            //     }
            // }
            var doc =  await categoryDB.updateOne({_id:req.body.id}, {status: req.body.status});
                if (!doc) {
                    return errorResponse(res, "Error While Updating Status");
                } else {
                    return successWithData(res, 'Successfully Updated Status', doc)
                }
          
        } catch (err) {
            console.log(err);
        }
    },
    GetCategoryById: async function(req,res){
        try{
            //const profile_id=req.user.id;
            //var _id=profile_id;
            console.log('GetCategoryById')
            const getCategory=await categoryDB.findById({_id:req.body.id});
            if(getCategory){
                return successWithData(res,'Successfully Get Data',getCategory)
            }else{
                return errorResponse(res,'Data Not Found');
            }

        }catch(err){
            console.log(err)
        }
    },
    get_gallery_byId: async function(req,res){
        try{
            //const profile_id=req.user.id;
            //var _id=profile_id;
           // console.log('GetCategoryById')
            const reviews=await reviewsDB.find({stylist_id:req.body.id});
            var order_details = await reviewsDB.aggregate([   
                { $match: {stylist_id:ObjectId(req.body.id) } },                 
                { $lookup:
                    {
                        from: "reviewimages",
                        localField: "_id",
                        foreignField: "review_id",
                        as: "gallery"
                    }
                },
                {$unwind:"$gallery"},
                {$project:{
                    "gallery":1
                }}
            ])
            if(order_details){
                return successWithData(res,'Successfully Get Data',order_details.flat())
            }else{
                return errorResponse(res,'Data Not Found');
            }
        }catch(err){
            console.log(err)
        }
    },
    get_reviews: async function(req,res){
        try{
            //const profile_id=req.user.id;
            //var _id=profile_id;
           // console.log('GetCategoryById')
           // const reviews=await reviewsDB.find({stylist_id:req.body.id});
            var order_details = await reviewsDB.find();
            if(order_details){
                return successWithData(res,'Successfully Get Data',order_details)
            }else{
                return errorResponse(res,'Data Not Found');
            }
        }catch(err){
            console.log(err)
        }
    },
    get_reviewsbyid: async function(req,res){
        try{          
           // const reviews = await reviewsDB.find({stylist_id:ObjectId(req.body.id),status:1});
            var data = await reviewsDB.aggregate([{
                $match: {
                    stylist_id:ObjectId(req.body.id)
                }
            },
            {
                $lookup: {
                    from: 'signups',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'userdetails',
                }
            },
            ])
            //console.log('reviews',data);
            if(data){
                return successWithData(res,'Successfully Get Data',data)
            }else{
                return errorResponse(res,'Data Not Found');
            }
        }catch(err){
            console.log(err)
        }
    },

    searchcategory: async (req, res) => {
            try {
                const {
                    page,
                    limit
                } = req.query
                // const later=limit(limit*1).skip(page-1)*limit;
                var demo = await categoryDB.find().limit(limit * 1).skip((page - 1) * limit)
                var demos = await categoryDB.find({
                    '$and': [{
                            'category_name': {
                                $regex: req.query.category_name
                            }
                        },
                        // {
                        //     'author': {
                        //         $regex: req.query.author
                        //     }
                        // }
                    ]
                });
                if (demos) {
                    return successWithData(res, 'Mached Data', demos)
                } 
            } catch (err) {
                console.log(err);
            }

            //     res.send({
            //         //'demo': demo,
            //         'demos': demos,
            //     });
            // },

        },

        addservice: async function(req,res){
            try{
            //      const profile_id = req.user.id;
            // var _id = profile_id;
                const {category_id,service}=req.body;
                const categorySkills=await categoryDB.findOne({_id:req.body.category_id});
                console.log('skills--------------',categorySkills);
                if(categorySkills){

                const skilled=new serviceDB();
                skilled.category_id=categorySkills._id;
                skilled.categoryname=categorySkills.category_name,
                skilled.service=service;
                skilled.status=1;
                await skilled.save((err,doc)=>{
                    console.log('doc',doc);
                    if(err){
                        return errorResponse(res,'Error');
                    }else{

                        return successWithData(res,'Skills saved',doc);
                    }
                })
            }else{
                return errorResponse(res,'error');
            }
           }catch(err){
                console.log(err);
            }
        },
        updateUserStatus: async function (req, res) {
            try {
               // console.log('updateCategoryStatus')
                var status = '';
                if (req.body.status == 1) {
                    status = 0;
                } else {
                    status = 1;
                }
                var newvalues = {
                    $set: {
                        status: status
                    }
                }
                 signDB.updateOne({_id:req.body.id}, newvalues, (err, doc) => {
                    if (err) {
                        return errorResponse(res, "Error While Updating Status");
                    } else {
                        return successWithData(res, 'Successfully Updated Status', doc)
                    }
                })
            } catch (err) {
                console.log(err);
            }
        },

        GetUserById: async function(req,res){
            try{
                //const profile_id=req.user.id;
                //var _id=profile_id;
                console.log('GetCategoryById')
                const getUser=await signDB.findById({_id:req.body.id});
                if(getUser){
                    return successWithData(res,'Successfully Get Data',getUser)
                }else{
                    return errorResponse(res,'Data Not Found');
                }
    
            }catch(err){
                console.log(err);
            }
        },

        updateKycStatus: async function (req, res) {
            try {
               // console.log('updateCategoryStatus')
                var status = '';
                if (req.body.status == 1) {
                    status = 0;
                } else {
                    status = 1;
                }
                var newvalues = {
                    $set: {
                        status: status
                    }
                }
                 kycDB.updateOne({_id:req.body.id}, newvalues, (err, doc) => {
                    if (err) {
                        return errorResponse(res, "Error While Updating Status");
                    } else {
                        return successWithData(res, 'Successfully Updated Status', doc)
                    }
                })
            } catch (err) {
                console.log(err);
            }
        },

        getservices:async function(req,res){
            try{
                const {category_id}=req.body;
                const skillfind=await serviceDB.find({category_id:req.body.category_id});
                console.log('skills',skillfind)
                if(skillfind){
                     return successWithData(res,'Skils found',skillfind);
                }else{
                     return errorResponse(res,'Skills Not found');
                }

            }catch(err){
                console.log(err);
            }
        },
        getskillsby_id:async function(req,res){
            try{
               // var profile_id=req.user.id;
                const {skill_id}=req.body;
                const skillfind=await serviceDB.findOne({_id:req.body.skill_id});
                //console.log('skills',skillfind)
                if(skillfind){
                     return successWithData(res,'Skils found',skillfind);
                }else{
                     return errorResponse(res,'Skills Not found');
                }

            }catch(err){
                console.log(err);
            }
        },

}