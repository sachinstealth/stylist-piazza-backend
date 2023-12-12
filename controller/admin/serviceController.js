const express = require('express');
const {
    success,
    errorResponse,
    successWithData,
    validationError,
    notFound,
    successData
} = require('../../helpers/apiResponse');
var fs = require('fs');
var path = require('path');
const verifyToken = require('../../middleware/authentication.js')
//const adminServiceDB = require('../../models/user/service.model.js');
const adminServiceDB = require('../../models/user/service.model.js')
const {
    isAsyncFunction
} = require('util/types');

module.exports = {
    createService: async function (req, res) {
        try {
            const {
                service
            } = req.body
            //console.log('service',req.body);
            const services = await adminServiceDB.findOne({
                service
            });
            //console.log('user',user);
            if (services) {
                return successData(res, 'Service Already Exist')
            } else {
                const serviceCreated = await adminServiceDB.create({

                    service: service,

                })
                serviceCreated.status = 1;


                await serviceCreated.save((err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Please Try Again');
                    } else {
                        return successWithData(res, 'Service Successfully Created', doc);
                    }
                })
            }
        } catch (err) {
            console.log(err);
        }

    },

    updateService: async function (req, res) {
        try {
            const {
                service_id,
                service
            } = req.body;
            var _id = service_id;
            const user = await adminServiceDB.findById({
                _id
            });
            if (user) {
                var newvalues = {
                    $set: {
                        service: service
                    }
                }
                adminServiceDB.findOneAndUpdate({
                    _id
                }, newvalues, (err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Pleae Try Again')
                    } else {
                        return successWithData(res, 'Service Updated Successfully', doc);
                    }
                })
            }
        } catch (err) {
            console.log(err);
        }
    },

    getServiceById: async function (req, res) {
        try {
            console.log('abc',req.body);
            const {
                service_id
            } = req.body;
            var _id = service_id;
            const user = await adminServiceDB.findById({
                _id
            })
            if (user) {
                return successWithData(res, 'Service Found', user);
            } else {
                return errorResponse(res, 'Service Not Found');
            }
        } catch (err) {
            console.log(err);
        }
    },

    getAllService: async function (req, res) {
        try {
            const user = await adminServiceDB.find();
            if (user) {
                return successWithData(res, 'Services Found', user)
            } else {
                return errorResponse(res, 'Service Not Found');
            }

        } catch (err) {
            console.log(err);
        }
    },

    deleteService: async function (req, res) {
        try {
            const {
                service_id
            } = req.body;
            var _id = service_id;
            const user = await adminServiceDB.findById({
                _id
            });
            //console.log('user',user);
            if (user) {
                adminServiceDB.deleteOne(user, (err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Please Try Again');
                    } else {
                        return successData(res, 'Service Deleted Successfully');
                    }
                })
            } else {
                return errorResponse(res, 'Service Not Found');
            }
        } catch (err) {
            console.log(err);
        }
    },

    updateServiceStatus: async function(req,res){
        try{
          //  var status='';
          console.log('updateServiceStatus',req.body);
            if(req.body.status==1){
                adminServiceDB.updateOne({_id:req.body.service_id},{status:'0'},(err,doc)=>{
            if(err){
                return errorResponse(res,'Status Not Updated');
            }else{
                return successWithData(res,'Status Successfully Updated',doc);
            }
           })
           }else{
             adminServiceDB.updateOne({_id:req.body.service_id},{status:'1'},(err,doc)=>{
            if(err){
                return errorResponse(res,'Status Not Updated');
            }else{
                return successWithData(res,'Status Successfully Updated',doc);
            }
           })
           }
           // var newvalues={
           //  $set:{
           //      status:statusa
           //  }
           // }
           

        }catch(err){
            console.log(err);
        }
    }
}