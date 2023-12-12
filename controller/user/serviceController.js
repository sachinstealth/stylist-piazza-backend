const express = require('express');
const {
    success,
    errorResponse,
    successWithData,
    validationError,
    notFound,
    successData,
    validateData,
    errorWithData
} = require('../../helpers/apiResponse');
var fs = require('fs');
var path = require('path');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const verifyToken = require('../../middleware/authentication.js')
const userServiceDB = require('../../models/user/service.model.js');
const contactDB = require('../../models/user/leads.model.js');
const userskillDB = require('../../models/user/userskill.model.js');
const termsDB = require('../../models/admin/terms.model.js');



module.exports = {
    verifyToken,
    createService: async function (req, res) {
        try {
            const profile_id = req.user.id;
            if (profile_id) {
                console.log('profile', profile_id);
                const {
                    service_id,
                    duration,
                    fee
                } = req.body;
                console.log('abcccc', req.body)
                if (!(service_id && duration && fee)) {
                    return validateData(res, 'Required All Fields');
                }
                const servicess = await userServiceDB.findOne({
                    service_id: service_id
                });

                const services = await userskillDB.findOne({
                    service_id: service_id,
                    user_id: profile_id
                });
                if (services) {
                    console.log('service', services)
                    const updateOtp = await userskillDB.findOneAndUpdate({
                        service_id: service_id,
                        user_id: profile_id
                    }, {
                        duration: duration,
                        fee: fee,
                        status: 1
                    });
                    return successData(res, 'Save sucessfully')

                } else {
                    const service = await userskillDB.create({
                        service_id: service_id,
                        skillname: servicess.service,
                        user_id: profile_id,
                        duration: duration,
                        fee: fee
                    })
                    return successData(res, 'Save sucessfully')


                }
            }
        } catch (err) {
            console.log(err);
        }
    },

    getService: async function (req, res) {
        try {
            const profile_id = req.user.id;
            if (profile_id) {

                const users = await userskillDB.findOne({
                    user_id: profile_id,
                    service_id: req.body.service_id
                })
                console.log('user', users);
                if (users) {
                    return successWithData(res, 'Service found', users);
                } else {
                    return errorWithData(res, 'Service Not Found');
                }
            }
        } catch (err) {
            console.log(err);
        }
    },

    getAllService: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                const user = await userServiceDB.find();
                if (user) {
                    return successWithData(res, 'Services Found', user)
                } else {
                    return errorWithData(res, 'No Service Found');
                }
            }
        } catch (err) {
            console.log(err);
        }
    },

    updateService: async function (req, res) {
        try {
            // console.log('1234')
            const profile_id = req.user.id;
            if (profile_id) {
                console.log('profile', profile_id);
                const user = await userskillDB.findOne({
                    user_id: profile_id,
                    service_id: req.body.service_id
                });
                console.log('user', user)
                if (user) {
                    //console.log('user',user);
                    var newvalues = {
                        $set: {
                            duration: req.body.duration,
                            fee: req.body.fee
                        }
                    }
                    //console.log('values',newvalues);
                    var doc = await userskillDB.updateOne({
                        user_id: profile_id,
                        service_id: req.body.service_id
                    }, newvalues);
                    if (!(doc)) {
                        return errorWithData(res, 'Service Not Updated')
                    } else {
                        return successWithData(res, 'Service Successfully Updated', doc);
                    }

                }
            }
        } catch (err) {
            console.log(err);
        }
    },

    updateServiceStatus: async function (req, res) {
        try {
            const profile_id = req.user.id;
            if (profile_id) {
                var status = '';
                if (req.body.status == 1) {
                    status = 0
                } else {
                    status = 1;
                }
                var newvalues = {
                    $set: {
                        status: status
                    }
                }
                userServiceDB.updateOne({
                    _id: req.body.service_id
                }, newvalues, (err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Status Not Updated');
                    } else {
                        return successWithData(res, 'Status Updated', doc);
                    }
                })
            }
        } catch (err) {
            console.log(err);
        }
    },


    

    getAllTerms: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const terms = await termsDB.find();
            if (terms) {
                return successWithData(res, 'Terms And conditons Found Successfully', terms);
            } else {
                return errorResponse(res, 'Terms And Conditions Not found');
            }

        } catch (err) {
            console.log(err);
        }
    }

}