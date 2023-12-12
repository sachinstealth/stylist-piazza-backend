const express = require('express');
const signDB = require('../../models/user/Signup.model.js')
const serviceDB = require('../../models/user/service.model.js')
const userskillDB = require('../../models/user/userskill.model.js')
const contactformDB = require('../../models/user/contact.model.js');
const latlongDB = require('../../models/user/latlong.model.js');
const termsDB = require('../../models/admin/terms.model.js');
const contactDB = require('../../models/user/leads.model.js');
const verifyToken = require('../../middleware/authentication.js');
const imagevedioDB = require('../../models/user/imagevedio.model.js');
const leadsDB = require('../../models/user/leads.model.js');
const chatlist = require('../../models/user/chatID.model.js')
const stylistgalleryDB = require('../../models/user/stylistgallery.model.js');
const kycpath = require('../../config/db.js')
const stylistreviewDB = require('../../models/user/stylistreviews.model.js');
const userreviewDB = require('../../models/user/userreview.model.js');
const img = require('../../config/db.js')
const categoryDB = require('../../models/user/categoryList.model.js');
const kycDB = require('../../models/user/kyc.model.js');
const favDB = require('../../models/user/favorite.model.js');
const mongoose = require('mongoose');
const mime = require('mime');
const ObjectId = mongoose.Types.ObjectId;
const nodemailer = require('nodemailer');
const twilio = require('twilio');
var request = require('request');

const {
    getData
} = require('country-list');

const {
    generateotp,
    generatetoken
} = require('../../services/otp.js')

const {
    successWithData,
    errorResponse,
    errorWithData,
    successData,
    validateData,
    notFound,
} = require('../../helpers/apiResponse.js')
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sgmail = require('@sendgrid/mail');
const fs = require('fs');
const IncomingForm = require('formidable');
const formidable = require('formidable');
var base64ToImage = require('base64-to-image');
const {
    where
} = require('../../models/user/Signup.model.js');
//const { randomtoken } = require('./stylistController 2.js');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../uploads', );
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const uploadImg = multer({
    storage: storage
}).single('photourl');

const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../nodeAPI/uploads/kycuploads', );
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname, );
    }
});
const uploadImg1 = multer({
    storage: storage1
}).single('faceimage');


const asyncParse = (req) =>
    new Promise((resolve, reject) => {
        const form = formidable({
            multiples: true
        });
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            // resolve "returns" the promise so you will have a straighforward logic flow
            resolve({
                fields,
                files
            });
        });
    });

module.exports = {
    verifyToken,
    uploadImg,
    uploadImg1,

    //----------------Api for update security type for stylist to upload documets----------------------------------//
    updateSecurity: async function (req, res) {
        try {
            const profile_id = req.user.id;
            var _id = profile_id;
            var profile = await signDB.findOne({
                _id
            });

            //console.log('req.body',profile.id)
            switch (req.body.apitype) {
                case "faceid":
                    //console.log('faceid');
                    var updated = await signDB.updateOne({
                        _id: profile.id
                    }, {
                        face_Id: req.body.face_Id
                    });
                    return successData(res, 'Successfully Updated');
                    break;
                case "transaction":
                    if (req.body.currentPin == '' || req.body.currentPin == undefined) {
                        if (req.body.newPin === req.body.confirmPin) {
                            var updated = await signDB.updateOne({
                                _id: profile_id
                            }, {
                                transaction_pin: req.body.newPin
                            });
                            return successData(res, 'Pin Submitted Successfully');
                        } else {
                            return errorWithData(res, 'Pin is not matched');
                        }
                    } else {
                        var profile = await signDB.findOne({
                            _id: profile.id,
                            transaction_pin: req.body.currentPin
                        });
                        // console.log('profile',profile);
                        if (profile) {
                            if (req.body.newPin === req.body.confirmPin) {
                                var updated = await signDB.updateOne({
                                    _id: profile.id
                                }, {
                                    transaction_pin: req.body.newPin
                                });
                                return successData(res, 'Pin Updated Successfully');
                            } else {
                                return errorWithData(res, 'Pin in not matching');
                            }
                        } else {
                            return errorWithData(res, 'Pin not Matched');
                        }
                    }
                    break;

                case "changepassword":
                    if (req.body.currentPassword != '') {
                        var password = await signDB.findOne({
                            _id: profile_id,
                            password: req.body.currentPassword
                        });
                        if (password) {
                            if (req.body.newPassword === req.body.confirmPassword) {
                                var updated = await signDB.updateOne({
                                    _id: profile_id
                                }, {
                                    password: req.body.newPassword
                                });
                                return successData(res, 'Password Submittedd Successfully');
                            } else {
                                return errorWithData(res, 'Password Does Not Match');
                            }
                        } else {
                            return errorWithData(res, 'Password Not Matched');
                        }
                    } else {
                        return errorWithData(res, 'Please Fill Current Password');
                    }
            }
        } catch (err) {
            console.log(err);
        }
    },

    //-----------------------------Api for update the user/stylist profile--------------------//
    updateProfile: async function (req, res) {
        try {
            console.log('updateProfile')
            const profile_id = req.user.id;
            var _id = profile_id;
            var profile = await signDB.findOne({
                _id
            });
            if (profile.type == 'stylist') {
                var result = await asyncParse(req);
                console.log('req para', result.fields);

                var stylistskills = result.fields.skills;
                console.log('addskills', stylistskills);
                //var dltskill
                console.log('dltskills', result.fields.dltskill);
                //stylistskills
                var dlt = result.fields.dltskill;
                console.log('lenghtdlt', dlt == 0);
                if (dlt != 0) {
                    console.log('abc----', result.fields.dltskill);
                    await Promise.all(dlt.map(async (row) => {
                        console.log('service_id', row)
                        const dltskills = await userskillDB.findOneAndUpdate({
                            category_id: ObjectId(row),
                            user_id: ObjectId(profile_id)
                        }, {
                            status: 0
                        });
                    }));
                }
                if (stylistskills != 0) {
                    await Promise.all(stylistskills.map(async (row) => {
                        console.log('row', row);
                        const weekdays = await categoryDB.findOne({
                            _id: row
                        });
                        const skills = await userskillDB.findOne({
                            user_id: _id,
                            category_id: row
                        });
                        if (weekdays) {
                            if (skills) {
                                if (skills.status == 0) {
                                    const update = await userskillDB.findOneAndUpdate({
                                        _id: ObjectId(skills.id),
                                        user_id: profile_id
                                    }, {
                                        status: 1
                                    });
                                }
                            } else {
                                //console.log('row', weekdays);
                                var skill = new userskillDB();
                                skill.user_id = _id;
                                skill.service_id = row;
                                skill.category_id = weekdays._id;
                                skill.skillname = weekdays.category_name;
                                skill.status = 1;
                                await skill.save(skill);
                            }
                        }
                    }))
                }

                if ((result.fields.profile_image == '' && result.fields.background_image == '') || (result.fields.profile_image != '' && result.fields.background_image == '') || (result.fields.profile_image == '' && result.fields.background_image != '')) {
                    console.log('abc');
                    // var profileimage ;
                    // var backgroundimage ;
                    if (result.fields.profile_image != '' && result.fields.background_image != '') {
                        var base64Str = result.fields.profile_image.value;
                        //console.log('imageInresult.fieldsfo', result.fields)
                        var file_name1 = Date.now();
                        const uploadDir = '/var/www/html/nodeAPI/uploads/';
                        var imageInfo = await base64ToImage(base64Str, uploadDir, file_name1);
                        var base64Str1 = result.fields.background_image.value;
                        var file_name = Date.now();
                        var imageInfo1 = await base64ToImage(base64Str1, uploadDir, file_name);
                        console.log('imageInfo', imageInfo)
                        console.log('imageInfo1', imageInfo1)
                        console.log('kills', req.body.fields);
                        var updated = await signDB.updateOne({
                            _id: profile.id
                        }, {
                            firstname: result.fields.name,
                            lastname: result.fields.lastname,
                            gender: result.fields.gender,
                            // skills: result.fields.skills,
                            bio: result.fields.bio,
                            city: result.fields.city,
                            phone: result.fields.phone,
                            state: result.fields.state,
                            instagram: result.fields.instagram,
                            twitter: result.fields.twitter,
                            facebook: result.fields.facebook,
                            profile_image: imageInfo.fileName,
                            background_image: imageInfo1.fileName
                        });
                        console.log('updated', updated)
                        if (updated) {
                            const status = await signDB.updateOne({
                                _id: profile_id
                            }, {
                                completestatus: 2
                            });
                            return successData(res, 'Data Submitted Successfully');

                        } else {
                            return errorResponse(res, 'failed')
                        }
                    } else if (result.fields.profile_image != '' && result.fields.background_image == '') {
                        var base64Str = result.fields.profile_image.value;
                        //console.log('imageInresult.fieldsfo', result.fields)
                        var file_name1 = Date.now();
                        const uploadDir = '/var/www/html/nodeAPI/uploads/';
                        var imageInfo = await base64ToImage(base64Str, uploadDir, file_name1);
                        // var base64Str1 = result.fields.background_image.value;
                        // var file_name = Date.now();
                        // var imageInfo1 = await base64ToImage(base64Str1, uploadDir, file_name);
                        console.log('imageInfo', imageInfo)

                        var updated = await signDB.updateOne({
                            _id: profile.id
                        }, {
                            firstname: result.fields.name,
                            lastname: result.fields.lastname,
                            gender: result.fields.gender,
                            // skills: result.fields.skills,
                            city: result.fields.city,
                            bio: result.fields.bio,
                            phone: result.fields.phone,
                            state: result.fields.state,
                            instagram: result.fields.instagram,
                            twitter: result.fields.twitter,
                            facebook: result.fields.facebook,
                            profile_image: imageInfo.fileName,
                        });
                        console.log('updated', updated)
                        if (updated) {
                            const status = await signDB.updateOne({
                                _id: profile_id
                            }, {
                                completestatus: 2
                            });
                            return successData(res, 'Data Submitted Successfully');
                        } else {
                            return errorResponse(res, 'failed')
                        }

                    } else if (result.fields.profile_image == '' && result.fields.background_image != '') {
                        const uploadDir = '/var/www/html/nodeAPI/uploads/';

                        var base64Str1 = result.fields.background_image.value;
                        var file_name = Date.now();
                        var imageInfo1 = await base64ToImage(base64Str1, uploadDir, file_name);

                        console.log('imageInfo1', imageInfo1)

                        // var newvalues = {
                        //     $set: {

                        //     }
                        // }
                        var updated = await signDB.updateOne({
                            _id: profile.id
                        }, {
                            firstname: result.fields.name,
                            lastname: result.fields.lastname,
                            gender: result.fields.gender,
                            // skills: result.fields.skills,
                            city: result.fields.city,
                            phone: result.fields.phone,
                            state: result.fields.state,
                            bio: result.fields.bio,
                            instagram: result.fields.instagram,
                            twitter: result.fields.twitter,
                            facebook: result.fields.facebook,
                            // profile_image: imageInfo.fileName,
                            background_image: imageInfo1.fileName
                        });
                        console.log('updated', updated)
                        if (updated) {
                            const status = await signDB.updateOne({
                                _id: profile_id
                            }, {
                                completestatus: 2
                            });
                            return successData(res, 'Data Submitted Successfully');
                        } else {
                            return errorResponse(res, 'failed')
                        }
                    } else {
                        // var newvalues = {
                        //     $set: {

                        //     }
                        // }
                        var updated = await signDB.updateOne({
                            _id: profile.id
                        }, {
                            firstname: result.fields.name,
                            lastname: result.fields.lastname,
                            gender: result.fields.gender,
                            // skills: result.fields.skills,
                            city: result.fields.city,
                            phone: result.fields.phone,
                            state: result.fields.state,
                            bio: result.fields.bio,
                            instagram: result.fields.instagram,
                            twitter: result.fields.twitter,
                            facebook: result.fields.facebook,
                            // profile_image: imageInfo.fileName,
                            // background_image: imageInfo1.fileName
                        });
                        console.log('updated', updated)
                        if (updated) {
                            const status = await signDB.updateOne({
                                _id: profile_id
                            }, {
                                completestatus: 2
                            });
                            return successData(res, 'Data Submitted Successfully');
                        } else {
                            return errorResponse(res, 'failed')
                        }
                    }

                } else {


                    var base64Str = result.fields.profile_image.value;
                    //console.log('imageInresult.fieldsfo', result.fields)
                    var file_name1 = Date.now();
                    const uploadDir = '/var/www/html/nodeAPI/uploads/';
                    var imageInfo = await base64ToImage(base64Str, uploadDir, file_name1);
                    var base64Str1 = result.fields.background_image.value;
                    var file_name = Date.now();
                    var imageInfo1 = await base64ToImage(base64Str1, uploadDir, file_name);
                    console.log('imageInfo', imageInfo)
                    console.log('imageInfo1', imageInfo1)

                    // var newvalues = {
                    //     $set: {

                    //     }
                    // }
                    var updated = await signDB.updateOne({
                        _id: profile.id
                    }, {
                        firstname: result.fields.name,
                        lastname: result.fields.lastname,
                        gender: result.fields.gender,
                        //skills: result.fields.skills,
                        city: result.fields.city,
                        phone: result.fields.phone,
                        state: result.fields.state,
                        bio: result.fields.bio,
                        instagram: result.fields.instagram,
                        twitter: result.fields.twitter,
                        facebook: result.fields.facebook,
                        profile_image: imageInfo.fileName,
                        background_image: imageInfo1.fileName
                    });
                    console.log('updated', updated)
                    if (updated) {
                        const status = await signDB.updateOne({
                            _id: profile_id
                        }, {
                            completestatus: 2
                        });
                        return successData(res, 'Data Submitted Successfully');
                    } else {
                        return errorResponse(res, 'failed')
                    }
                }
            } else {
                var result = await asyncParse(req);
                console.log('result user ', result);

                if (result.fields.profile_image != '') {
                    console.log('abc-----if')

                    var base64Str

                    = result.fields.profile_image.value;
                    //console.log('imageInresult.fieldsfo', result.fields)
                    var file_name1 = Date.now();
                    const uploadDir = '/var/www/html/nodeAPI/uploads/';
                    var imageInfo = await base64ToImage(base64Str, uploadDir, file_name1);
                    // var base64Str1 = result.fields.background_image.value;
                    // var file_name = Date.now();
                    // var imageInfo1 = await base64ToImage(base64Str1, uploadDir, file_name);
                    // console.log('imageInfo', imageInfo)
                    // console.log('imageInfo1', imageInfo1)

                    // var newvalues = {
                    //     $set: {

                    //     }
                    // }
                    var updated = await signDB.updateOne({
                        _id: profile.id
                    }, {
                        firstname: result.fields.name,
                        lastname: result.fields.lastname,
                        gender: result.fields.gender,
                        //skills: result.fields.skills,
                        city: result.fields.city,
                        bio: result.fields.bio,
                        phone: result.fields.phone,
                        state: result.fields.state,
                        instagram: result.fields.instagram,
                        twitter: result.fields.twitter,
                        facebook: result.fields.facebook,
                        profile_image: imageInfo.fileName,
                        // background_image: imageInfo1.fileName
                    });
                    console.log('updated', updated)
                    if (updated) {
                        const status = await signDB.updateOne({
                            _id: profile_id
                        }, {
                            completestatus: 2
                        });
                        return successData(res, 'Data Submitted Successfully');
                    } else {
                        return errorResponse(res, 'failed')
                    }
                } else {
                    // var result = await asyncParse(req);  
                    console.log('else')
                    // var newvalues = {
                    //     $set: {

                    //     }
                    // }
                    var updated = await signDB.updateOne({
                        _id: profile.id
                    }, {
                        firstname: result.fields.name,
                        lastname: result.fields.lastname,
                        gender: result.fields.gender,
                        //skills: result.fields.skills,
                        city: result.fields.city,
                        phone: result.fields.phone,
                        state: result.fields.state,
                        bio: result.fields.bio,
                        instagram: result.fields.instagram,
                        twitter: result.fields.twitter,
                        facebook: result.fields.facebook,
                    });
                    console.log('updated', updated)
                    if (updated) {
                        const status = await signDB.updateOne({
                            _id: profile_id
                        }, {
                            completestatus: 2
                        });
                        return successData(res, 'Data Submitted Successfully');
                    } else {
                        return errorResponse(res, 'failed')
                    }
                }
            }
            // }
        } catch (err) {
            console.log(err);

        }
    },

    //-----------------------Api for adding multiple background Images---------------------//
    backgroundimage: async function (req, res) {
        try {
            const stylist_id = req.user.id;
            console.log('updateProfile')
            //var _id = stylist_id;
            const background_image = req.body;
            var arr = [];
            var profile = await signDB.findOne({
                _id: stylist_id
            });
            if (profile.type == 'stylist') {
                //var result = await asyncParse(req);
                //console.log('req para', result.fields);
                //if ((result.fields.profile_image == '')) {
                // console.log('abc');

                if (background_image != '') {
                    console.log('backgroundimage', background_image);
                    // var base64Str = result.fields.profile_image.value;
                    // //console.log('imageInresult.fieldsfo', result.fields)
                    // var file_name1 = Date.now();
                    await Promise.all(background_image.background_image.map(async (row) => {

                        const uploadDir = '/var/www/html/nodeAPI/uploads/';
                        // var imageInfo = await base64ToImage(base64Str, uploadDir, file_name1);
                        var base64Str1 = row.uri;
                        var file_name = Date.now();
                        var imageInfo1 = await base64ToImage(base64Str1, uploadDir, file_name);
                        //console.log('imageInfo', imageInfo)
                        //console.log('imageInfo1', imageInfo1)
                        //console.log('kills', req.body.fields);
                        var updated = await new stylistgalleryDB({
                            //updated.background_image=backgroundimage;
                            //var user = await stylistgalleryDB.create({
                            stylist_id: stylist_id,
                            background_image: imageInfo1.fileName,
                            status: 1
                        })

                        // images.review_id = reviews._id;
                        // images.image = imageInfo.fileName;
                        // images.status = 1;
                        await updated.save(updated);
                    }));
                    return successWithData(res, 'Successfully found', doc);
                    //})
                    // const doc = await stylistgalleryDB.save(updated);
                    // console.log('updated', doc)
                    // if (doc) {
                    //     // const status = await signDB.updateOne({
                    //     //     _id: profile_id
                    //     // }, {
                    //     //     completestatus: 2
                    //     // });
                    // } else {
                    //     return errorResponse(res, 'failed')
                    // }
                    // }
                    //}
                }
            }
        } catch (err) {
            console.log(err);
        }
    },


    //-----------------Api for get all data-------------------------//
    getAllData: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            var _id = profile_id;
            //
            //console.log('_______id',_id);
            var arr = [];
            //console.log('123456',profile_id);
            if (profile_id) {
                var data = await signDB.aggregate([{
                        $match: {
                            '_id': ObjectId(_id)
                        }
                    },
                    {
                        $lookup: {
                            from: "userskills",
                            let: {
                                id: "$_id",

                            },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $and: [{
                                                $eq: [
                                                    "$status",
                                                    1
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    "$$id",
                                                    "$user_id"
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }],
                            as: "userskills"
                        }
                    }
                ])
                //console.log('userdata', data)
                return successWithData(res, 'Details found Successfully', data[0]);

            } else {
                return errorResponse(res, "Token Expired");
            }

        } catch (err) {
            console.log(err);
        }
    },

    //----------------------Api for verifying the email by sending OTP---------------------------------//
    emailotp: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const {
                email
            } = req.body;
            const user = await signDB.findOne({
                email,
            })
            const otpGenerated = await generateotp();
            if (user) {
                let mailTransporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'harishstealth@gmail.com',
                        pass: 'dwwoplablsfgreyz'
                    }
                });
                //var url = "https://stylistpiazza.com/forget-password/#" + token;
                let mailDetails = {
                    from: 'harishstealth@gmail.com',
                    to: email,
                    subject: ' OTP mail',
                    html: `
                              <div
                               class="container"
                               style="max-width: 90%; margin: auto; padding-top: 20px"
                                  >
                               <h2>Welcome to Stylish Paizza</h2>

                                <p style="margin-bottom: 30px;">Pleas enter the OTP to verify your email</p>
                               <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${otpGenerated}</h1>
                                <p style="margin-top:50px;">If you do not request for verification please do not respond to the mail. You can in turn un subscribe to the mailing list and we will never bother you again.</p>
                                 </div>
                             `
                };
                mailTransporter.sendMail(mailDetails, function (err, data) {
                    if (err) {
                        // console.log('Error Occurs',err);
                        return errorWithData(res, 'Error')
                    } else {
                        // console.log('Email sent successfully');
                        return successWithData(res, 'Email Sent Successfully', data);
                    }
                });
                //console.log('email sent', mailsent);
                if (mailTransporter) {
                    //console.log('mail',mail);
                    return successData(res, 'Successfully Sent OTP');
                    //return res.send({
                    //         status: '200',
                    //         //jwttoken: user.jwttoken,
                    //         //type: user.type,
                    //otp: user.otp,
                    //  message: 'Successfully sent'

                    // })
                } else {
                    //     //console.log('error',error);
                    return errorResponse(res, 'failed')
                }
            }
            return errorWithData(res, 'Invalid Crendiatials');
        } catch (err) {
            console.log(err);
        }
    },

    //------------------------------Api for updating email by sending OTP------------------------------------//
    emailupdate: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const {
                email

            } = req.body;
            const emailverify = await signDB.findOne({
                email: email
            });
            if (emailverify) {
                return errorResponse(res, 'Email Already Exist, Please Enter New Email');
            }
            const user = await signDB.findOneAndUpdate({
                _id: ObjectId(profile_id)
            }, {
                email: email
            });
            const otpGenerated = await generateotp();

            let mailTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'harishstealth@gmail.com',
                    pass: 'dwwoplablsfgreyz'
                }
            });
            //var url = "https://stylistpiazza.com/forget-password/#" + token;
            let mailDetails = {
                from: 'harishstealth@gmail.com',
                to: email,
                subject: ' OTP mail',
                html: `
                          <div
                           class="container"
                           style="max-width: 90%; margin: auto; padding-top: 20px"
                              >
                           <h2>Welcome to Stylish Paizza</h2>

                            <p style="margin-bottom: 30px;">Pleas enter the OTP to verify your email</p>
                           <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${otpGenerated}</h1>
                            <p style="margin-top:50px;">If you do not request for verification please do not respond to the mail. You can in turn un subscribe to the mailing list and we will never bother you again.</p>
                             </div>
                         `
            };

            mailTransporter.sendMail(mailDetails, function (err, data) {
                if (err) {
                    // console.log('Error Occurs',err);
                    return errorWithData(res, 'Error')
                } else {
                    // console.log('Email sent successfully');
                    return successWithData(res, 'Email Sent Successfully', data);
                }
            });
            // console.log('email sent', mailsent);
            if (mailTransporter) {
                //     //console.log('mail',mail);
                return successData(res, 'Successfully Sent OTP');
                //return res.send({
                //         status: '200',
                //         //jwttoken: user.jwttoken,
                //         //type: user.type,
                //otp: user.otp,
                //  message: 'Successfully sent'

                // })
            } else {
                //     //console.log('error',error);
                return errorResponse(res, 'failed')
            }
            //}
            //return errorWithData(res, 'Invalid Crendiatials');
        } catch (err) {
            console.log(err);
        }
    },

    //-------------------------------Api for updating phone by sending OTP on number-------------------------//
    phoneupdate: async function (req, res) {
        try {
            var profile_id = req.user.id;
            // const {
            //     phone
            // } = req.body;
            const phoneverify = await signDB.findOne({
                phone: req.body.phone
            });

            if (phoneverify) {
                return errorResponse(res, 'Phone Already Exist, Please Enter New Phone');
            } else {
                const user = await signDB.findOneAndUpdate({
                    _id: ObjectId(profile_id)
                }, {
                    phone: req.body.phone
                });
                const otpGenerated = await generateotp();
                var data = {
                    "to": req.body.phone,
                    "from": "N-Alert",
                    "sms": 'Your Stylist Piazza Confirmation Code is ' + otpGenerated + ' Valid for 10minutes, and for one-time use only.',
                    "type": "plain",
                    "api_key": "TL7sopd8aVrbfkRIlVc0sZdktnGDz8wyHzjGvqvVekmfIFkCyi8FsC9tWtz59l",
                    "channel": "dnd",
                };
                var options = {
                    'method': 'POST',
                    'url': 'https://api.ng.termii.com/api/sms/send',
                    'headers': {
                        'Content-Type': ['application/json', 'application/json']
                    },
                    body: JSON.stringify(data)

                };
                request(options, function (error, response) {
                    if (error) throw new Error(error);
                    const mes = JSON.parse(response.body)
                    console.log('otp send', mes);
                    // return successData(res, mes.message)
                });
                // const accountSid = 'AC6a993850ed311286798de4422bfde820';
                // const authToken = 'e04c13824232ac115a4d3b01e3ecaa5a';
                // const client = require('twilio')(accountSid, authToken);
                // client.messages
                //     .create({
                //         body: 'Your Verification Code is' + otpGenerated,
                //         from: '+15734643278',
                //         to: req.body.phone
                //     })
                //     .then(message => console.log(message.sid));
                return successData(res, 'Phone Sucessfully Updated, Please Verified');
            }
        } catch (err) {
            console.log(err);
        }
    },

    //----------------------------------Api for login by sending OTP---------------------------// 
    login1: async function (req, res) {
        try {
            const {
                phone,
                password
            } = req.body;
            const user = await signDB.findOne({
                phone,
                password

            })
            if (!user) {
                return validateData(res, 'Phone Number or password is not registered, Please Signup');
            }
            //var otpGenerated ='1234';
            //console.log('user', user);
            if (user) {
                var token = jwt.sign({
                    id: user._id
                }, img.secret, {
                    expiresIn: 2592000 //expires in 30Days
                })
                //user.jwtToken=token; 
                if (phone.substring(0, 4) == '+234') {
                    var otpGenerated = await generateotp();

                    const updateToken = await signDB.findOneAndUpdate({
                        phone: phone
                    }, {
                        jwttoken: token,
                        otp: otpGenerated
                    });
                    if (updateToken) {
                        var data = {
                            "to": phone,
                            "from": "N-Alert",
                            "sms": 'Your Stylist Piazza Confirmation Code is ' + otpGenerated + ' Valid for 10minutes, and for one-time use only.',
                            "type": "plain",
                            "api_key": "TL7sopd8aVrbfkRIlVc0sZdktnGDz8wyHzjGvqvVekmfIFkCyi8FsC9tWtz59l",
                            "channel": "dnd",
                        };
                        var options = {
                            'method': 'POST',
                            'url': 'https://api.ng.termii.com/api/sms/send',
                            'headers': {
                                'Content-Type': ['application/json', 'application/json']
                            },
                            body: JSON.stringify(data)
                        };
                        request(options, function (error, response) {
                            if (error) throw new Error(error);
                            const mes = JSON.parse(response.body)
                            console.log('otp send', mes);
                        });

                        return res.send({
                            status: '200',
                            jwttoken: user.jwttoken,
                            type: user.type,
                            otp: otpGenerated,
                            id: user._id,
                            message: 'Successfully Login'
                        })
                    }
                } else {
                    var otpGenerated = '1234';
                    const updateToken = await signDB.findOneAndUpdate({
                        phone: phone
                    }, {
                        jwttoken: token,
                        otp: otpGenerated
                    });
                    return res.send({
                        status: '200',
                        jwttoken: user.jwttoken,
                        type: user.type,
                        id: user._id,
                        otp: otpGenerated,
                        message: 'Successfully Login'
                    })
                    //return successData(res, 'OTP Send Successfully');
                }
                // if (phone.substring(0, 3) == '+91') {
                //     console.log(phone.substring(0, 3) == '+91');
                //     console.log('india')
                //     var otpGenerated = '1234';
                //     const updateToken = await signDB.findOneAndUpdate({
                //         phone: phone
                //     }, {
                //         jwttoken: token,
                //         otp: otpGenerated
                //     });
                //     //return successData(res, 'OTP Send Successfully');
                //     return res.send({
                //         status: '200',
                //         jwttoken: user.jwttoken,
                //         type: user.type,
                //         otp: otpGenerated,
                //         message: 'Successfully Login'

                //     })
                // } else {
                //     console.log('nigeria')

                //     var otpGenerate = await generateotp();

                //     const updateToken = await signDB.findOneAndUpdate({
                //         phone: phone
                //     }, {
                //         jwttoken: token,
                //         otp: otpGenerate
                //     });
                //     var data = {
                //         "to": phone,
                //         "from": "N-Alert",
                //         "sms": 'Your Stylist Piazza Confirmation Code is ' + otpGenerate + ' Valid for 10minutes, and for one-time use only.',
                //         "type": "plain",
                //         "api_key": "TL7sopd8aVrbfkRIlVc0sZdktnGDz8wyHzjGvqvVekmfIFkCyi8FsC9tWtz59l",
                //         "channel": "dnd",
                //     };
                //     var options = {
                //         'method': 'POST',
                //         'url': 'https://api.ng.termii.com/api/sms/send',
                //         'headers': {
                //             'Content-Type': ['application/json', 'application/json']
                //         },
                //         body: JSON.stringify(data)

                //     };
                //     request(options, function (error, response) {
                //         if (error) throw new Error(error);
                //         const mes = JSON.parse(response.body)
                //         console.log('otp send', mes);
                //     });

                //     return res.send({
                //         status: '200',
                //         jwttoken: user.jwttoken,
                //         type: user.type,
                //         otp: otpGenerate,
                //         message: 'Successfully Login'

                //     })
                // }
                // const updateToken = await signDB.findOneAndUpdate({
                //     phone: phone
                // }, {
                //     jwttoken: token,
                //     otp: otpGenerated
                // });
                // console.log('updated', updateToken);

                // if (updateToken) {
                //     var data = {
                //         "to": phone,
                //         "from": "N-Alert",
                //         "sms": 'Your Stylist Piazza Confirmation Code is ' + otpGenerated + ' Valid for 10minutes, and for one-time use only.',
                //         "type": "plain",
                //         "api_key": "TL7sopd8aVrbfkRIlVc0sZdktnGDz8wyHzjGvqvVekmfIFkCyi8FsC9tWtz59l",
                //         "channel": "dnd",
                //     };
                //     var options = {
                //         'method': 'POST',
                //         'url': 'https://api.ng.termii.com/api/sms/send',
                //         'headers': {
                //             'Content-Type': ['application/json', 'application/json']
                //         },
                //         body: JSON.stringify(data)

                //     };
                //     request(options, function (error, response) {
                //         if (error) throw new Error(error);
                //         const mes = JSON.parse(response.body)
                //         console.log('otp send', mes);
                //     });

                //     return res.send({
                //         status: '200',
                //         jwttoken: user.jwttoken,
                //         type: user.type,
                //         otp:otpGenerated,
                //         message: 'Successfully Login'

                //     })
                // }
            }

            return errorWithData(res, 'Invalid Crendiatials');
        } catch (err) {
            console.log(err);
        }
    },

    login2: async function (req, res) {
        try {
            const {
                phone,
            } = req.body;
            const otped = await signDB.findOne({
                phone: phone
            });
            if (otped) {
                return successWithData(res, 'Data Found', otped);
            } else {
                return errorResponse(res, 'error found');
            }
        } catch (err) {
            console.log(err);
        }
    },

    //--------------------------------------Api for verify the OTP------------------------------------------------//
    VerifyOtp: async function (req, res) {
        try {
            // const profile_id = req.user.id;
            // var _id = profile_id;
            console.log('checkotp', req.body)
            const user = await signDB.findOne({
                otp: req.body.otp,
                phone: req.body.phone
            });
            // console.log('user',user);
            if (user) {
                //if (user.otp == req.body.otp) {
                const updated = await signDB.findOneAndUpdate({
                    _id: user.id
                }, {
                    otp: ''
                });
                // console.log('updated',updated);
                if (updated) {
                    const users = await signDB.findOne({
                        _id: user.id
                    }, 'type');
                    //console.log('users',users);
                    // return successwithdata(res, 'OTP Matched', user)
                    return successWithData(res, 'OTP Matched', users);
                } else {
                    return errorWithData(res, 'OTP not found');
                }
                // } else {
                //     return errorWithData(res, 'data not found');
                // }

            } else {
                return errorWithData(res, 'User Not Found');
            }
        } catch (err) {
            console.log(err);
        }
    },

    //---------------------------------Api for resend OTP on phone number----------------------------//
    ResendOtp1: async function (req, res) {
        try {
            const resend = await signDB.findOne({
                phone: req.body.phone
            }).lean();
            console.log('resend', resend);
            if (resend) {
                const otpGenerated = await generateotp();
                //const otpGenerated ='1234';
                const updateOtp = await signDB.findOneAndUpdate({
                    phone: req.body.phone
                }, {
                    otp: otpGenerated
                })
                if (updateOtp) {
                    var data = {
                        "to": req.body.phone,
                        "from": "N-Alert",
                        "sms": 'Your Stylist Piazza Confirmation Code is ' + otpGenerated + ' Valid for 10minutes, and for one-time use only.',
                        "type": "plain",
                        "api_key": "TL7sopd8aVrbfkRIlVc0sZdktnGDz8wyHzjGvqvVekmfIFkCyi8FsC9tWtz59l",
                        "channel": "dnd",
                    };
                    var options = {
                        'method': 'POST',
                        'url': 'https://api.ng.termii.com/api/sms/send',
                        'headers': {
                            'Content-Type': ['application/json', 'application/json']
                        },
                        body: JSON.stringify(data)

                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        const mes = JSON.parse(response.body)
                        console.log('otp send', mes);
                        //return successData(res, mes.message)
                    });
                    return successData(res, 'OTP Send Successfully');
                }
            }

        } catch (err) {
            console.log(err);
        }
    },

    //-------------------------Api for get the country List------------------------------------//
    countrylist: async function (req, res) {
        try {
            //console.log('country',getData());
            return successWithData(res, 'country data', getData());

        } catch (err) {
            console.log(err);
        }
    },

    //----------------------------Api for stylist to select info------------------------//
    kyclist: async function (req, res) {
        try {
            var profile_id = req.user.id;
            var _id = profile_id;
            const {
                user_id,
                country,
                type
            } = req.body;
            if (!(country && type)) {
                return validateData(res, 'Required All fields');
            }

            const kycid = await kycDB.findOne({
                user_id: _id
            });

            console.log('kycid', kycid);
            if (kycid) {
                // if (kycid.verifystatus == 'verified') {
                //     return successData(res, 'Already Verified');
                // } else if (kycid.verifystatus == 'processing') {
                //     return successData(res, 'Kyc Pending');
                // } else {
                const kyc = await kycDB.create({
                    user_id: profile_id,
                    country: country,
                    type: type,
                    verifystatus: 'pending',
                    frontimage: '',
                    backimage: '',
                    faceimage: ''
                })
                kyc.status = 1;
                kyc.save((err, doc) => {
                    if (err) {
                        return errorResponse(res, 'error');
                    } else {
                        return successWithData(res, 'kyc documents', doc);
                    }
                })
                // }
            } else {
                const kyc = await kycDB.create({
                    user_id: profile_id,
                    country: country,
                    type: type,
                    verifystatus: 'pending',
                    frontimage: '',
                    backimage: '',
                    faceimage: ''
                })
                kyc.status = 1;
                kyc.save((err, doc) => {
                    if (err) {
                        return errorResponse(res, 'error');
                    } else {
                        return successWithData(res, 'kyc documents', doc);
                    }
                })

            }

        } catch (err) {
            console.log(err);
        }
    },

    //------------------------------------------Api for stylist to upload the kyc documents---------------------------//
    kycupload: async function (req, res) {
        try {
            var profile_id = req.user.id;
            var _id = profile_id;
            const {
                frontimage,
                backimage
            } = req.body;
            const profile = await signDB.findById({
                _id
            });
            if (profile) {
                if (frontimage != '' && backimage != '') {
                    //var result = await asyncParse(req);
                    var base64Str = req.body.frontimage.value;
                    var file_name1 = await Date.now();
                    const uploadDir = '/var/www/html/nodeAPI/uploads/kycuploads/'
                    console.log('upload', uploadDir);
                    var imageInfo = await base64ToImage(base64Str, uploadDir, file_name1);
                    var base64Str1 = req.body.backimage.value;
                    var file_name = await Date.now();
                    var imageInfo1 = await base64ToImage(base64Str1, uploadDir, file_name);
                    console.log('imageInfo', imageInfo)
                    console.log('imageInfo1', imageInfo1)
                    console.log('kills', req.body);
                    // var newvalues = {
                    //     $set: {

                    //     }
                    // }
                    //console.log('newvalues',newvalues);
                    console.log('file_name1', file_name1)
                    console.log('file_name', file_name)
                    var updated = await kycDB.updateOne({
                        user_id: profile_id,
                        type: req.body.type
                    }, {
                        frontimage: imageInfo.fileName,
                        backimage: imageInfo1.fileName
                    });
                    // console.log('updated',updated);
                    if (updated) {
                        return res.send({
                            // status: '200',
                            code: 200,
                            success: true,
                            data: updated,
                            kycUrl: kycpath.kycurl,
                            message: 'Successfully updated',

                        })
                        //console.log('kyc',kycUrl);
                        // return successWithData(res, 'Data Uploaded', updated);
                    } else {
                        return errorWithData(res, 'Error while uploading');
                    }
                } else {
                    return errorWithData(res, 'Please upload documents');
                }
            } else {
                return errorWithData(res, 'User Not Found');
            }

        } catch (err) {
            console.log(err);
        }
    },

    //--------------------------------------Api for get all kyc documents-----------------------------------//
    kycgetall: async function (req, res) {
        try {
            var profile_id = req.user.id;
            //var _id = profile_id;
            const kycget = await kycDB.find();
            if (kycget) {
                return successWithData(res, 'Data Found', kycget);
            } else {
                return errorWithData(res, 'Error');
            }

        } catch (err) {
            console.log(err);
        }
    },

    //----------------------------------Api for get the documents of particular stylist---------------------
    kycById: async function (req, res) {
        try {
            var profile_id = req.user.id;
            //var _id=profile_id;
            const {
                user_id
            } = req.body;
            const kycid = await kycDB.findOne({
                user_id: user_id
            });
            console.log('kycid', kycid);
            if (kycid) {
                res.send({
                    code: 200,
                    success: true,
                    data: kycid,
                    kycUrl: kycpath.kycurl,
                    message: 'KYC Data Found'
                })
                //return successWithData(res, 'Data Found', kycid);
            } else {
                return successWithData(res, 'Please Try Again');
            }

        } catch (err) {
            console.log(err);
        }
    },

    //------------------------------Api for uploading the faceimage by live capture---------------------------------//
    faceimage: async function (req, res) {
        try {
            var profile_id = req.user.id;
            var _id = profile_id;
            const {
                faceimage
            } = req.body;

            //console.log("faceimage1", req.body.faceimage)
            const profile = await signDB.findById({
                _id
            });
            //console.log('profile',profile);
            if (profile) {
                if (faceimage != '') {
                    var res_image = req.body.faceimage.uri;
                    //var matches = iii.match(/^data:.+\/(.+);base64,([^\"]*)$/),
                    var matches = res_image.match(/^data:image\/([a-zA-Z]*);base64,([^\"]*)$/),

                        response = {};

                    //console.log("matches", matches)
                    if (matches.length !== 3) {
                        return new Error('Invalid input string');
                    }
                    response.type = matches[1];

                    // console.log("response.type", response.type);
                    response.data = new Buffer(matches[2], 'base64');
                    // console.log("response.data", response.data);
                    let decodedImg = response;
                    console.log("decodedImg", decodedImg);
                    let imageBuffer = decodedImg.data;
                    let type = decodedImg.type;
                    decodedImg
                    //console.log("type", type)
                    //let extension = mime.extension(type);
                    //console.log("mime", mime)
                    let fileName = Date.now() + "." + type;

                    // console.log(".....", fileName, type)
                    await fs.writeFileSync("/var/www/html/nodeAPI/uploads/kycuploads/" + fileName, imageBuffer, 'utf8');
                    var newvalues = {
                        $set: {
                            faceimage: fileName,
                            type: req.body.type,
                            verifystatus: 'processing'
                            // backimage:imageInfo1.backimage
                        }
                    }

                    // console.log("newval", newvalues)
                    var updated = await kycDB.updateOne({
                        user_id: profile.id
                    }, newvalues);
                    var updated1 = await signDB.updateOne({
                        user_id: profile.id
                    }, {
                        kycstatus: 'processing'
                    });

                    if (updated) {
                        return successWithData(res, 'Pic Uploaded', updated);
                    } else {
                        return errorWithData(res, 'Error while uploading');
                    }
                } else {
                    return errorWithData(res, 'Please capture Image');
                }
            } else {
                return errorWithData(res, 'User Not Found');
            }

        } catch (err) {
            console.log(err);
        }
    },

    faceimage1: async function (req, res) {
        try {
            var profile_id = req.user.id;
            var _id = profile_id;
            const
                faceimage = req.file;

            // console.log("faceimage1", req.body.faceimage)
            const profile = await signDB.findById({
                _id
            });
            console.log('profile', profile);
            if (profile) {

                console.log("aaaaa", req.file.filename)
                if (faceimage != '') {

                    var newvalues = {
                        $set: {
                            faceimage: req.file.filename,
                            type: req.body.type,
                            verifystatus: 'processing'
                            // backimage:imageInfo1.backimage
                        }
                    }

                    //console.log("newval", newvalues)
                    var updated = await kycDB.updateOne({
                        user_id: profile.id
                    }, newvalues);
                    //console.log('newvalues',updated);
                    if (updated) {
                        //console.log('updated', updated);
                        return successWithData(res, 'Pic Uploaded', updated);
                    } else {
                        return errorWithData(res, 'Error while uploading');
                    }
                } else {
                    return errorWithData(res, 'Please capture Image');
                }
            } else {
                return errorWithData(res, 'User Not Found');
            }

        } catch (err) {
            console.log(err);
        }
    },

    //-------------------------------Api for user to get the filtered stylist prize------------------------------//
    pricefilter1: async function (req, res) {
        try {
            var profile_id = req.user.id;
            // const {
            //     filtertype
            // } = req.body;
            // console.log('profile_id',profile_id);
            // console.log('filter',req.body);
            // console.log('filter',req.query);
            if (req.query.filtertype == '1') {
                var data = await signDB.aggregate([{
                        $match: {
                            type: 'stylist',
                            status: '1',

                        }
                    },
                    {
                        $lookup: {
                            from: "userskills",
                            localField: "_id",
                            foreignField: "user_id",
                            as: "skills"
                        }
                    },
                    {
                        $unwind: {
                            path: "$skills",
                            preserveNullAndEmptyArrays: false
                        }
                    },
                    {
                        $sort: {
                            "skills.fee": -1
                        }
                    },
                ])
                //console.log('data', data);
                if (data) {
                    return successWithData(res, 'Filtered', data)
                } else {
                    return errorResponse(res, 'Error');
                }
            }
            // }
        } catch (err) {
            console.log(err);
        }
    },


    pricefilter2: async function (req, res) {
        try {
            var profile_id = req.user.id;
            // function getKeyByValue(object, value) {
            //     return Object.keys(object).find(key => object[key] === value);
            //   }
            const object1 = req.body;
            //console.log(Object.keys(object1));


            // var filtertype1 = [];
            var filtertype = [];
            filtertype.push(Object.keys(object1));
            //var filtertype = filtertype1.keys();
            //console.log('filtertype', filtertype);
            const flatNumbers = filtertype.flat();
            //console.log("flatNumbers",flatNumbers)
            //const filtertype = ['pricing', 'recommended']
            //console.log('filtertype------', filtertype1);
            var arr = [];
            var arr1 = [];
            var arr2 = [];
            var arr3 = [];
            var arr4 = [];
            var arr5 = [];
            var arr6 = [];
            if (flatNumbers.length > 0) {
                await Promise.all(flatNumbers.map(async (row) => {
                    //console.log('row---------', row);
                    //console.log('filtertype', flatNumbers);

                    switch (row) {
                        case 'category_id':
                            console.log('category_id---------', req.body.category_id);
                            var data = await userskillDB.aggregate([{
                                    $match: {
                                        //skillname:type ,
                                        //status: '1',
                                        category_id: ObjectId(req.body.category_id)
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'userskills',
                                        localField: 'category_id',
                                        foreignField: 'category_id',
                                        as: 'skills',
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'signups',
                                        localField: 'user_id',
                                        foreignField: '_id',
                                        as: 'stylistdetails',
                                    }
                                },
                                // {$sort:{"skills":-1}},
                                {
                                    $lookup: {
                                        from: 'latlongs',
                                        localField: 'user_id',
                                        foreignField: 'user_id',
                                        as: 'location',
                                    }
                                },
                                //{$sort:{"location":-1}},

                                {
                                    $lookup: {
                                        from: 'stylistreviews',
                                        localField: 'user_id',
                                        foreignField: 'to',
                                        as: 'reviews',
                                    }
                                },
                                // {$sort:{"reviews":-1}},

                                {
                                    $addFields: {
                                        reviewsCount: {
                                            $size: "$reviews"
                                        }
                                    }
                                },

                                {
                                    $lookup: {
                                        from: 'reviewimages',
                                        localField: '_id',
                                        foreignField: 'review_id',
                                        as: 'reviewimages',
                                    }
                                },
                                // {$sort:{"stylistimages":-1}},

                            ])
                            //.sort({data:-1});
                            await Promise.all(data.map(async (row) => {
                                const fav = await favDB.findOne({
                                    user_id: profile_id,
                                    stylist_id: row._id
                                });
                                if (fav) {
                                    row.favstylist = fav.favstylist;
                                } else {
                                    row.favstylist = 0;
                                }
                                arr4.push(row);



                                //arr.sort({_id:1});
                            }))
                            if (data) {
                                arr5.push(arr4);
                            }
                            break;
                        case 'price':
                            console.log('pricing--------------');
                            var data = await signDB.aggregate([{
                                    $match: {
                                        type: 'stylist',
                                        status: '1',
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "userskills",
                                        localField: "_id",
                                        foreignField: "user_id",
                                        as: "skills"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$skills",
                                        preserveNullAndEmptyArrays: false
                                    }
                                },
                                {
                                    $sort: {
                                        "skills.fee": -1
                                    }
                                },
                            ]);
                            if (data) {
                                arr.push(data)
                            }
                            break;
                        case 'recommended':
                            console.log('recommended-------------');
                            var data = await signDB.aggregate([{
                                    $match: {
                                        type: 'stylist',
                                        status: '1',

                                    }
                                },
                                {
                                    $lookup: {
                                        from: "userskills",
                                        localField: "_id",
                                        foreignField: "user_id",
                                        as: "skills"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$skills",
                                        preserveNullAndEmptyArrays: false
                                    }
                                },
                                {
                                    $sort: {
                                        "skills.fee": -1
                                    }
                                },
                            ]);
                            if (data) {
                                arr1.push(data)

                            }
                            //console.log('data', data)

                            // res.send({
                            //     code: 200,
                            //     success: true,
                            //     data: arr1,
                            //     message: 'Filter Apply'
                            // })
                            break;
                        case 'review':
                            console.log('reviews---------');
                            //     var data = await stylistreviewDB.aggregate([{
                            //         $match: {
                            //             //type: 'stylist',
                            //             'rating':5,
                            //            // status: '1',
                            //                //_id:ObjectId(stylist_id)
                            //         }
                            //     },
                            //     {
                            //         $lookup: {
                            //             from: "signups",
                            //             localField: "to",
                            //             foreignField: "_id",
                            //             as: "stylistdetails"
                            //         }
                            //     },
                            // ])
                            // if(data){
                            // arr2.push(data);
                            //return successWithData(res,'Data Found',data);
                            //}
                            const rating = await stylistreviewDB.find({
                                rating: 5
                            });
                            if (rating) {
                                arr2.push(rating);
                                //successWithData(res, 'Top rated stylist Found', rating);
                            }
                            break;
                        case 'nearby':
                            console.log('nearby-----------');
                            //arr3.push(nearby);
                            //return successData(res, 'Nearby Data found');
                    }
                    // return arr1;
                    // return arr2;
                    // return arr3;
                    //return errorResponse(res,'sitch case not matched');
                    //console.log('update', update);
                }))
            }
            var arr6 = arr1.concat(arr2).concat(arr3).concat(arr4);
            console.log('arr6', arr6);
            //if(filtertype=='')
            res.send({
                code: 200,
                success: true,
                //price: arr,
                //recommended: arr1,
                //review: arr2,
                //nearby: arr3,
                category_id: arr4,
                filtertypedata: arr6.flat(),
                message: 'Data  Found'
            })

            var arr6 = arr.concat(arr1).concat(arr2).concat(arr3);
            // console.log('arr6',arr6);
            // console.log('arr----',arr);
            // console.log('arr1----',arr1);
            // console.log('arr2----',arr2);
            // console.log('arr3----',arr3);
            //return arr,arr1,arr2,arr3;
        } catch (err) {
            console.log(err);
        }
    },

    pricefilter: async function (req, res) {
        try {
            var profile_id = req.user.id;
            var filtertype = req.body.filtertype;
            if (filtertype == 'price') {
                console.log('price', filtertype);
                var data = await signDB.aggregate([{
                        $match: {
                            type: 'stylist',
                            status: '1',
                        }
                    },
                    {
                        $lookup: {
                            from: "userskills",
                            localField: "_id",
                            foreignField: "user_id",
                            as: "skills"
                        }
                    },
                    {
                        $unwind: {
                            path: "$skills",
                            preserveNullAndEmptyArrays: false
                        }
                    },
                    {
                        $sort: {
                            "skills.fee": -1
                        }
                    },
                ]);
                if (data) {
                    return successWithData(res, 'Data Found', data);
                }
            } else if (filtertype == 'reviews') {
                console.log('reviews', filtertype);
                const data1 = await stylistreviewDB.find().count();
                if (data1) {
                    var data = await signDB.aggregate([{
                            $lookup: {
                                from: "stylistreviews",
                                localField: "_id",
                                foreignField: "to",
                                as: "reviews"
                            }
                        },
                        {
                            $unwind: {
                                path: "$reviews",
                                preserveNullAndEmptyArrays: false
                            }
                        },
                        {
                            $sort: {
                                "reviews.rating": -1
                            }
                        },
                    ]);
                    console.log('reviewdata', data);
                    return successWithData(res, 'Top rated stylist Found', data);
                }

            } else if (filtertype == 'nearby') {
                const data1 = await latlongDB.find().count();
                if (data1) {
                    var data = await signDB.aggregate([{
                            $lookup: {
                                from: "latlongs",
                                localField: "_id",
                                foreignField: "user_id",
                                as: "locations"
                            }
                        },
                        {
                            $unwind: {
                                path: "$locations",
                                preserveNullAndEmptyArrays: false
                            }
                        },
                        {
                            $sort: {
                                "locations": -1
                            }
                        },
                    ]);
                   // console.log('reviewdata', data);
                    return successWithData(res, 'Nearby Locations Found', data);
                }



                // const longitude = parseFloat(req.body.long);
                // const latitude = parseFloat(req.body.lat);
                //const maxDistance = parseFloat(req.query.maxDistance);
                // const options = {near :[longitude,latitude],maxDistance:10000}
               //const finder= latlongDB.index({point:"2dsphere"});
                 //console.log('finder----',finder);
                // latlongDB.find({
                //     location : {
                //         $near: {
                //             $geometry: {
                //                 type: 'Point',
                //                 coordinates: [longitude, latitude],
                //           $maxDistance: 1000,

                //             }
                //         }
                //     }
                // }).find((error, results) => {
                //     if (error) console.log(error);
                //     //console.log(JSON.stringify(results, 0, 2));
                //     //sendJsonResponse(res, 200, results);
                //     return successWithData(res,'Found',results);
                // });

            };

        } catch (err) {
            console.log(err);
        }
    },


    getpricefilter: async function (req, res) {
        try {
            var profile_id = req.user.id;
            var data = await signDB.aggregate([{
                    $match: {
                        type: 'stylist',
                        status: '1',

                    }
                },
                {
                    $lookup: {
                        from: "userskills",
                        localField: "_id",
                        foreignField: "user_id",
                        as: "skills"
                    }
                },
                {
                    $unwind: {
                        path: "$skills",
                        preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $sort: {
                        "skills.fee": -1
                    }
                },
            ])
            return successWithData(res, 'Data Found', data);

        } catch (err) {
            console.log(err);
        }

    },


    //-----------------------------Api for searching the nearby locations----------------------------//
    nearbyloaction: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const find = await latlongDB.findOne({
                _id: req.body.id
            });
            if (find) {
                // var data=await latlongDB.index({point:"2dsphere"});
                const find1 = await latlongDB.find({
                    'loc': {
                        $near: {
                            $geometry: {
                                //type: "Point" ,
                                coordinates: [lat = find.lat, long = find.long],
                                $maxDistance: 1
                            },
                        }
                    }
                })
                return successWithData(res, 'Find nearby locations', find1);

            }

        } catch (err) {
            console.log(err);
        }

    },



    //-----------------------------Api for delete the account permanantely--------------------------------//
    deleteaccount: async function (req, res) {
        try {
            var profile_id = req.user.id;
            console.log('profile', profile_id);
            const deleter = await signDB.findOne({
                _id: profile_id
            });
            if (deleter) {
                const update = await signDB.deleteOne({
                    _id: profile_id
                });
                if (update) {
                    return successData(res, 'Account Successfully Deleted');
                }
            } else {
                return errorResponse(res, 'User not found');
            }
        } catch (err) {
            console.log(err);
        }

    },


    //------------------------------Api for signup-----------------------------------//
    signup12: async function (req, res) {
        try {
            const {
                firstname,
                lastname,
                email,
                referral_code,
                city,
                state,
                phone,
                type,
                address,
                photourl,
                logintype,
                password

            } = req.body;

            //console.log('signup-----------', req.body);

            switch (logintype) {
                case 'Google':
                    if (!(firstname && email && type && logintype)) {
                        return validateData(res, "required all fields");
                    }
                    const Olduser = await signDB.findOne({
                        email
                    }).lean();
                    var usertoken = await generatetoken();

                    if (Olduser) {
                        return validateData(res, "Email Already Exist");
                    } else {
                        //const hashedPassword = await encrypt(password);
                        var reqType;
                        if (req.body.type == "user") {
                            reqType = "user"
                            //user.status=1
                        } else {
                            reqType = "stylist"
                            // user.status=0
                        }
                        if (reqType) {
                            const user = await signDB.create({
                                firstname: firstname,
                                // lastname: lastname,
                                email: email,
                                //photourl: photourl,
                                //password: password,
                                profile_image: photourl,
                                referral_code: referral_code,
                                face_Id: false,
                                transaction_pin: "",
                                //firstname: result.fields.name,
                                //gender: '',
                                // skills: '',
                                // city: city,
                                phone: phone,
                                //state: state,
                                instagram: '',
                                twitter: '',
                                facebook: '',
                                profile_image: '',
                                background_image: '',
                                kycstatus: 'pending',
                                pass_token: '',
                                bio: '',
                                referraltoken: ''
                            })
                            var token = jwt.sign({
                                id: user._id,
                            }, img.secret, {
                                expiresIn: 2592000 // Expires in 30Days
                            })
                            user.jwttoken = token;
                            user.usertoken = usertoken;
                            // var profile_id=req.user.id;
                            //  const random=await signDB.findOne({_id:profile_id});
                            //  console.log('random',random);
                            //  if(random.referral_code!=='' &&  random.kycstatus=='pending'){
                            //    console.log('dfghjk');
                            //    const update=await signDB.updateOne({_id:profile_id},{referral_codestatus:'pending'});
                            //  return successWithData(res,'Status Updated',update);
                            //       }else{
                            //        console.log('cvbnm,.')
                            //        if(random.referral_code!=='' &&  random.kycstatus=='completed'){
                            //          const update1=await signDB.updateOne({_id:profile_id},{referral_codestatus:'completed'});
                            //       return successWithData(res,'Status Updated',update1);
                            //        }
                            //        }
                            user.logintype = logintype;
                            user.completestatus = 1;
                            // user.otp = otpGenerated
                            user.type = reqType;
                            // user.status = 0;
                            user.timeAvailable = 0;
                            if (type == "user") {
                                //reqType = "user"
                                user.status = 1
                            } else {
                                //reqType = "stylist"
                                user.status = 0
                            }

                            await user.save((err, doc) => {
                                if (err) {
                                    return errorWithData(res, 'error found');
                                } else {
                                    if (doc) {
                                        return res.send({
                                            status: '200',
                                            jwttoken: doc.jwttoken,
                                            type: doc.type,
                                            id: doc._id,
                                            //otp: doc.otp,
                                            message: 'Successfully Signup'
                                        })
                                    } else {
                                        //console.log('error',error);
                                        return errorResponse(res, 'failed')
                                    }
                                }
                            })
                        } else {
                            console.log('error');
                        }
                    }
                    break;

                case 'Other':

                    // const Olduser = await signDB.findOne({
                    //     email
                    // }).lean();
                    if (!(firstname && password && email && type && logintype && phone && address)) {
                        return validateData(res, "required all fields");
                    }
                    if (phone.substring(0, 3) == '+91') {
                        var otpGenerated = '1234';
                    } else {
                        var otpGenerated = await generateotp();
                    }
                    const Olduser3 = await signDB.findOne({
                        email
                    }).lean();
                    const phoneverify = await signDB.findOne({
                        phone
                    });
                    if (Olduser3 && phoneverify) {
                        return validateData(res, 'Email And Phone Already Exist')
                    }
                    if (Olduser3) {
                        return validateData(res, "Email  Already Exist");

                    }
                    //console.log('Olduser3',Olduser3);

                    if (phoneverify) {
                        return validateData(res, "Phone Already Exist");
                    }
                    //console.log('phoneverify',phoneverify)


                    //else {
                    //const hashedPassword = await encrypt(password);

                    //const otpGenerated = '1234';
                    var usertoken = await generatetoken();
                    //console.log('otp', otpGenerated);
                    if (otpGenerated) {
                        var reqType;
                        if (req.body.type == "user") {
                            reqType = "user"
                            //user.status=1
                        } else {
                            reqType = "stylist"
                            // user.status=0
                        }
                        if (reqType) {
                            const user = await signDB.create({
                                firstname: firstname,
                                lastname: lastname,
                                email: email,
                                password: password,
                                //profile_image: profile_image,
                                referral_code: referral_code,
                                face_Id: false,
                                transaction_pin: "",
                                //firstname: result.fields.name,
                                gender: '',
                                //skills: '',
                                city: city,
                                phone: phone,
                                state: state,
                                instagram: '',
                                twitter: '',
                                facebook: '',
                                profile_image: '',
                                background_image: '',
                                kycstatus: 'pending',
                                pass_token: '',
                                address: address,
                                bio: '',
                                referraltoken: ''
                            })
                            var token = jwt.sign({
                                id: user._id,
                            }, img.secret, {
                                expiresIn: 2592000 // Expires in 30 days
                            })
                            user.jwttoken = token;
                            user.otp = otpGenerated;
                            user.usertoken = usertoken;
                            user.type = reqType;
                            user.completestatus = 1;
                            user.logintype = logintype;
                            // user.status = 0;
                            user.timeAvailable = 0;
                            if (type == "user") {
                                //reqType = "user"
                                user.status = 1
                            } else {
                                //reqType = "stylist"
                                user.status = 0
                            }
                            await user.save((err, doc) => {
                                if (err) {
                                    return errorWithData(res, 'error found');
                                } else {
                                    if (doc) {
                                        var data = {
                                            "to": phone,
                                            "from": "N-Alert",
                                            "sms": 'Your Stylist Piazza Confirmation Code is ' + otpGenerated + ' Valid for 10 minutes, and for one-time use only.',
                                            "type": "plain",
                                            "api_key": "TL7sopd8aVrbfkRIlVc0sZdktnGDz8wyHzjGvqvVekmfIFkCyi8FsC9tWtz59l",
                                            "channel": "dnd",
                                        };
                                        var options = {
                                            'method': 'POST',
                                            'url': 'https://api.ng.termii.com/api/sms/send',
                                            'headers': {
                                                'Content-Type': ['application/json', 'application/json']
                                            },
                                            body: JSON.stringify(data)

                                        };
                                        request(options, function (error, response) {
                                            if (error) throw new Error(error);
                                            const mes = JSON.parse(response.body)
                                            console.log('otp send', mes);
                                        });

                                        // var data = {
                                        //     "to": phone,
                                        //     "from": "N-Alert",
                                        //     "sms": 'Your Verification Code is ' + otpGenerated,
                                        //     "type": "plain",
                                        //     "api_key": "TL7sopd8aVrbfkRIlVc0sZdktnGDz8wyHzjGvqvVekmfIFkCyi8FsC9tWtz59l",
                                        //     "channel": "dnd",
                                        // };
                                        // var options = {
                                        //     'method': 'POST',
                                        //     'url': 'https://api.ng.termii.com/api/sms/send',
                                        //     'headers': {
                                        //         'Content-Type': ['application/json', 'application/json']
                                        //     },
                                        //     body: JSON.stringify(data)

                                        // };
                                        // request(options, function (error, response) {
                                        //     if (error) throw new Error(error);
                                        //     console.log('otp send', response.body.message);
                                        //     // return successData(res,'OTP Send Successfully');

                                        // });
                                        return res.send({
                                            status: '200',
                                            jwttoken: doc.jwttoken,
                                            type: doc.type,
                                            otp: doc.otp,
                                            id: doc._id,
                                            message: 'Successfully Signup'
                                        })
                                    }
                                }
                            })
                        } else {
                            console.log('error');
                        }
                    }
            }
        } catch (err) {
            console.log('error', err)
        }
    },


    getstylistbycategory: async function (req, res) {
        try {
            var profile_id = req.user.id;
            var idss = ObjectId(profile_id);
            var arr = [];
            var type = req.body;
            var data = await userskillDB.aggregate([{
                    $match: {
                        //skillname:type ,
                        //status: '1',
                        category_id: ObjectId(req.body.categoryid)
                    }
                },
                // {
                //     $lookup: {
                //         from: 'userskills',
                //         localField: 'category_id',
                //         foreignField: 'category_id',
                //         as: 'skillname',
                //     }
                // },
                {
                    $lookup: {
                        from: 'signups',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'stylistdetails',
                    }
                },
                // {$sort:{"skills":-1}},
                {
                    $lookup: {
                        from: 'latlongs',
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'location',
                    }
                },
                //{$sort:{"location":-1}},

                {
                    $lookup: {
                        from: 'stylistreviews',
                        localField: 'user_id',
                        foreignField: 'to',
                        as: 'reviews',
                    }
                },
                // {$sort:{"reviews":-1}},

                {
                    $addFields: {
                        reviewsCount: {
                            $size: "$reviews"
                        }
                    }
                },

                {
                    $lookup: {
                        from: 'reviewimages',
                        localField: '_id',
                        foreignField: 'review_id',
                        as: 'reviewimages',
                    }
                },
                // {$sort:{"stylistimages":-1}},

            ])
            //.sort({data:-1});
            await Promise.all(data.map(async (row) => {
                const fav = await favDB.findOne({
                    user_id: profile_id,
                    stylist_id: row._id
                });
                if (fav) {
                    row.favstylist = fav.favstylist;
                } else {
                    row.favstylist = 0;
                }
                arr.push(row);



                //arr.sort({_id:1});
            }))
            //   arr.sort((a, b) => {
            //     if (a._id < b._id) {
            //       return -1;
            //     }
            //   });
            return res.send({
                // status: '200',
                code: 200,
                success: true,
                data: arr,
                //stylist: stylists,

                message: 'Successfully found stylist',

            })
        } catch (err) {
            console.log(err);
        }
    },




    getimageandvedio: async function (req, res) {
        try {
            const find = await imagevedioDB.find();
            if (find) {
                return successWithData(res, 'Data Found', find)
            } else {
                return errorWithData(res, 'Error');
            }

        } catch (err) {
            console.log(err);
        }
    },

    //-------------------------------Api for user to fill the contact form------------------------------------//
    contactform: async function (req, res) {
        try {
            const {
                name,
                email,
                subject,
                message,
                type
            } = req.body;
            // console.log('leads', req.body);
            if (!(name, email, message, type)) {
                return errorResponse(res, 'Required All Fields');
            }
            const user = await leadsDB.create({
                email: email,
                name: name,
                message: message,
                type: type
            })
            //console.log('user',user);
            return successWithData(res, 'save successfully', user);
        } catch (err) {
            console.log(err);
        }
    },

    //-------------------------Api for stylist to save stylist and user chat---------------------------------//
    savechatids: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const {
                stylist,
                user
            } = req.body;
            const Olduser = await chatlist.findOne({
                stylist: ObjectId(stylist),
                user: ObjectId(user)
            })
            if (!Olduser) {
                var chat = new chatlist();
                chat.stylist = stylist;
                chat.user = user;
                chat.status = 1;
                var users = await chat.save(chat);
                //console.log('data', users);
                return successWithData(res, 'Chat Data Found', users);
            }
        } catch (err) {
            console.log(err);
        }

    },

    //----------------------Api for stylist to get the stylist chat-------------------------------//
    getstylistchatlist: async function (req, res) {
        try {
            //var profile_id=req.user.id;
            console.log('sender', req.body);
            var data = await chatlist.aggregate([{
                    $match: {
                        'stylist': ObjectId(req.body.stylist)
                    }
                },
                {
                    $lookup: {
                        from: 'signups',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user',
                    }
                },
            ]);
            //console.log('data', data);
            return successWithData(res, 'Chat Data Found', data);
        } catch (err) {
            console.log(err);
        }
    },

    //------------------------Api for stylist to get the user chat list----------------------------------//
    getuserchatlist: async function (req, res) {
        try {
            var profile_id=req.user.id;
            console.log('reciever', req.body);
            var data = await chatlist.aggregate([{
                    $match: {

                        'user': ObjectId(req.body.user)

                    }
                },
                {
                    $lookup: {
                        from: 'signups',
                        localField: 'stylist',
                        foreignField: '_id',
                        as: 'stylist',
                    }
                },
            ]);
            //console.log('data', data);
            return successWithData(res, 'Chat Data Found', data);
        } catch (err) {
            console.log(err);
        }
    },

    forgotPassword: async function (req, res) {
        try {
            //   const profile_id = req.user.id;
            // var _id = profile_id;
            const {
                email
            } = req.body;
            const resend = await signDB.findOne({
                email: email
            }).lean();
            // if (resend) {
            const token = generateotp();
            // resend.otp = otpGenerated;
            const updateOtp = await signDB.findOneAndUpdate({
                email: email
            }, {
                passToken: token
            })
            // console.log('abc',updateOtp)
            // if (updateOtp) {
            //return successwithdata(res, "successfully updated", resend)
            //const Apikey = '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';
            // const Apikey = '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';
            // const Apikey = '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';//new
            // const Apikey = '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';
            // sgmail.setApiKey(Apikey);

            // var url = "https://stylistpiazza.com/forget-password/#" + token;
            // const message = {
            //     to: 'mailto:harishstealth@gmail.com',
            //     from: 'mailto:projects@stealthtechnocrats.com',
            //     // mailto:from:'stylistpiazza@gmail.com',
            //     subject: 'Reset Password',
            //     html: 'Hi </br></br>Use the link below to set up a new password for your account.<br>' + url + '<br><br>Best Regards '
            // }
            // const mail = sgmail.send(message)

            // console.log('email sent', mail);
            // return successWithData(res, 'Successfully Send ', token);
            // } else {
            //     return errorWithData(res, 'error found');
            // }
            // } else {
            //     return errorWithData(res, 'No data found');
            // }
            let mailTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'mailto:harishstealth@gmail.com',
                    pass: 'dwwoplablsfgreyz'
                }
            });
            //var firstname=signDB.firstname;
            var url = "https://stylistpiazza.com/forget-password/#" + token;
            let mailDetails = {
                from: 'mailto:harishstealth@gmail.com',
                to: email,
                subject: 'forgot Password mail',
                html: `
                                        <div
                                        class="container"
                                       style="max-width: 90%; margin: auto; padding-top: 20px"
                                      >
                                       <h2>Welcome to Stylish Paizza</h2>

                                        <p style="margin-bottom: 30px;">Pleas Use the link below to change your password</p>
                                        <h1 style="font-size: 20px; letter-spacing: 2px; text-align:center;">${url}</h1>
                                        <p style="margin-top:50px;">If you do not request for change password please do not respond to the mail. You can in turn un subscribe to the mailing list and we will never bother you again.</p>
                                     </div>
                                     `
            };

            mailTransporter.sendMail(mailDetails, function (err, data) {
                if (err) {
                    // console.log('Error Occurs',err);
                    return errorWithData(res, 'Error')
                } else {
                    // console.log('Email sent successfully');
                    return successData(res, 'Email Sent Successfully');
                }
            });
        } catch (err) {
            console.log(err);
        }
    },


    resetPassword: async function (req, res) {
        try {
            // console.log('reset password')
            const {
                token,
                password,
                confirmPassword
            } = req.body;
            console.log('reset password', req.body)
            var user_data = await signDB.findOne({
                passToken: token
            });
            console.log('boolean', user_data);
            if (Boolean(user_data)) {

                if (password == confirmPassword) {
                    var updated = await signDB.findOneAndUpdate({
                        passToken: token
                    }, {
                        password: password
                    }, {
                        new: true,
                        upsert: true
                    });
                    //empty pass_token after password updated 
                    var update = await signDB.findOneAndUpdate({
                            passToken: token
                        }, {
                            passToken: ''
                        },
                        // {
                        //     new: true,
                        //     upsert: true
                        // }
                    );
                    return successWithData(res, 'Successfully updated', update);
                } else {
                    return errorWithData(res, 'Password and confirm password does not match')
                }
            } else {
                return errorWithData(res, 'No data found');
            }
        } catch (err) {
            console.log(err);
        }
    },

    createcontact: async function (req, res) {
        try {
            var profile_id = req.user.id;
            const {
                name,
                email,
                subject,
                message
            } = req.body;
            if (!(name, email, subject, message)) {
                return errorResponse(res, 'Required All Fields');
            } else {
                const user = await contactformDB.create({
                    name,
                    email,
                    subject,
                    message,
                    type: profile_id
                })
                user.status = 1;
                user.save((err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Please Try Again');
                    } else {
                        return successWithData(res, 'Your Message Submitted Successsfully', doc);
                    }
                })
            }

        } catch (err) {
            console.log(err)
        }
    },


}