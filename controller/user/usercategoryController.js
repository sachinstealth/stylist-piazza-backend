const express = require('express');
const categoryDB = require('../../models/user/categoryList.model.js');
const serviceDB = require('../../models/user/service.model.js')
const userskillDB = require('../../models/user/userskill.model.js');
const img = require('../../config/db.js');
const {
    success,
    errorResponse,
    successWithData,
    validationError,
    notFound
} = require('../../helpers/apiResponse');
var fs = require('fs');
var path = require('path');
//const multer = require('multer');
const verifyToken = require('../../middleware/authentication.js');



module.exports = {
    verifyToken,



    // --------------------------------------------get----------------------------------------------------//
    getAllCategory: async function (req, res) {
        try {
            const profile_id = req.user.id;
            var screen = req.query.screen;
            // console.log('abcccccc',img.imgUrl);
            // var _id=profile_id;
            // console.log('screen',screen);
            // console.log('screen',req.body);

           // console.log('screen', req.query);
            if (screen == 'map') {
                const category = await categoryDB.find({
                    status: 1,
                    map: 1
                });
                if (category) {
                    return res.send({
                        // status: '200',
                        code: 200,
                        success: true,
                        data: category,
                        imgUrl: img.imgUrl,
                        message: 'Data Found',

                    })
                }
            } else if (screen == 'home') {
                const category = await categoryDB.find({
                    
                    status: 1,
                    home: 1
                });
                //console.log('category-------',category);
                if (category) {
                    return res.send({
                        // status: '200',
                        code: 200,
                        success: true,
                        data: category,
                        imgUrl: img.imgUrl,
                        message: 'Data Found',

                    })
                }
            } else if (screen == 'explore') {
                const category = await categoryDB.find({
                    status: 1,
                    explore: 1
                });
                if (category) {
                    return res.send({
                        // status: '200',
                        code: 200,
                        success: true,
                        data: category,
                        imgUrl: img.imgUrl,
                        message: 'Data Found',

                    })
                }
            } else {
                if (profile_id) {
                    categoryDB.find(({
                        status: 1
                    }), function (err, doc) {
                        if (err) {
                            return notFound(res, 'Please Try Again')
                        } else {
                            if (doc.length > 0) {
                                return res.send({
                                    // status: '200',
                                    code: 200,
                                    success: true,
                                    data: doc,
                                    imgUrl: img.imgUrl,
                                    message: 'Data Found',

                                })
                                // return successWithData(res, 'Data Found Successfully', doc)
                            } else {
                                return errorResponse(res, 'Data Not Found')
                            }
                        }
                    })
                } else {
                    return errorResponse(res, 'User Not Found');
                }
            }
        } catch (err) {
            console.log(err);
        }
    },

    searchcategory: async (req, res) => {
        try {
            //const profile_id=req.user.id;
            const {
                limit,
                skip
            } = req.body
            // const later=limit(limit*1).skip(page-1)*limit;
            // var demo = await categoryDB.find().limit(limit * 1).skip((page - 1) * limit)
            var demos = await categoryDB.find({
                'category_name': {
                    $regex: '.*' + req.body.category_name
                }
            });
            if (demos) {
                return successWithData(res, 'Matched Data', demos)
            }
        } catch (err) {
            console.log(err);
        }
    },

    getskills: async function (req, res) {
        try {
            const {
                category_id
            } = req.body;
            const skillfind = await serviceDB.find({
                category_id: req.body.category_id
            });
            // console.log('skills', skillfind)
            if (skillfind) {
                return successWithData(res, 'Skils found', skillfind);
            } else {
                return errorResponse(res, 'Skills Not found');
            }
        } catch (err) {
            console.log(err);
        }
    },

    getUserskills: async function (req, res) {
        try {
            const profile_id = req.user.id;
            // const {category_id}=req.body;
            const skillfind = await userskillDB.find({
                user_id: profile_id,
                status: '1'
            });
            //console.log('skills', skillfind)
            if (skillfind) {
                return successWithData(res, 'Skills found', skillfind);
            } else {
                return errorResponse(res, 'Skills Not found');
            }

        } catch (err) {
            console.log(err);
        }
    },

    getskillsby_id: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const {
                service_id
            } = req.body;
            const skillfind = await userskillDB.findOne({
                service_id: service_id,
                user_id: profile_id
            });
            //console.log('skills', skillfind)
            if (skillfind) {
                return successWithData(res, 'Skills found', skillfind);
            } else {
                return errorResponse(res, 'Skills Not found');
            }
        } catch (err) {
            console.log(err);
        }
    },
    // userskills:async function(req,res){
    //     try{
    //         const profile_id = await req.user.id;
    //         var _id=profile_id;
    //         const{category_id}=req.body;
    //         //loop
    //         const userskill=await categoryDB.findOne({_id:category_id});
    //         console.log('userskills',userskill);
    //         if(userskill){
    //             const userskilled=new userskillDB();
    //             userskilled.user_id=profile_id;
    //             userskilled.category_id=userskill._id,
    //             userskilled.skillname=userskill.category_name,
    //             userskilled.status=1,
    //             await userskilled.save((err,doc)=>{
    //                 if(err){
    //                     return errorResponse(res,'Error');
    //                 }else{
    //                     return successWithData(res,'Skill Saved',doc);
    //                 }
    //            })
    //         }else{
    //        }
    //    }catch(err){
    //         console.log(err);
    //     }
    // },

    addservice: async function (req, res) {
        try {
            var profile_id = req.user.id;
            var _id = req.body.id;
            const {
                duration,
                fee
            } = req.body
            const service = await categoryDB.findOne({
                _id
            });
            console.log('serviceee', service);
            if (service) {
                var updated = new userskillDB()
                updated.user_id = profile_id,
                    updated.category_id = service._id,
                    updated.skillname = service.category_name,
                    updated.duration = duration,
                    updated.fee = fee
                updated.status = 1;
                await updated.save((err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Error Found')
                    } else {
                        return successWithData(res, 'Successfully Updated', doc);
                    }
                })
            }
        } catch (err) {
            console.log(err);
        }
    },

    Updatedservice: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const {
                duration,
                fee
            } = req.body;
            const service = await userskillDB.findOne({
                _id: req.body.service_id
            });
            console.log('service', req.body.id);
            if (service) {
                console.log('duration', req.body);
                var updated = await userskillDB.updateOne({
                    _id: req.body.service_id
                }, {
                    duration: duration,
                    fee: fee
                });
                console.log('updated', updated);
                if (updated) {
                    return successWithData(res, 'Data Updated', updated)
                } else {
                    return errorResponse(res, 'Error failed');
                }
            }
        } catch (err) {
            console.log(err);
        }
    },

}