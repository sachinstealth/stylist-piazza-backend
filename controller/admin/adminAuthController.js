const adminDB = require('../../models/admin/Admin.model');
const signDB = require('../../models/user/Signup.model.js')
var jwt = require('jsonwebtoken');
var config = require('../../config/db.js');
const kycDB = require('../../models/user/kyc.model.js');
const kycpath = require('../../config/db.js');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const {
    generateotp
} = require('../../services/otp.js')
const {
    successWithData,
    errorResponse,
    errorWithData,
    successData,
    validateData,
    validationError,
    notFound,
} = require('../../helpers/apiResponse');
const nodemailer = require('nodemailer');
const ordereDB = require('../../models/user/bookorder.model.js');

//var adminService = require('../../services/adminService');
console.log("Admin controller here...");
module.exports = {
    test: function (req, res) {
        console.log('Test function call..');
    },
    //--------------------------add admin-------------------    
    addAdmin: function (req, res) {
        if (req.body.admin_email != '' && req.body.admin_password != '') {

            var where = {
                admin_email: req.body.admin_email
            };

            adminDB.findOne(where, function (err, emailfound) {
                if (emailfound != null) {
                    return errorResponse(res, 'Email Already Exist!')
                } else {
                    let Admin = new adminDB();
                    Admin.admin_email = req.body.admin_email;
                    Admin.admin_password = req.body.admin_password;
                    Admin.status = 1;
                    Admin.save((err, doc) => {
                        if (err) {
                            return errorResponse(res, err)
                        } else {
                            var token = jwt.sign({
                                id: doc._id
                            }, config.secret, {
                                expiresIn: 86400 // expires in 24 hours
                            });
                            Admin.jwtToken = token;
                            Admin.save(function (err) {
                                if (err) {
                                    res.send({
                                        'code': 400,
                                        'result': err.message,
                                        'message': "Please Try Again!",
                                    });
                                } else {
                                    return successWithData(res, 'Successfully Sign Up New Admin', token)
                                }
                            });
                        }
                    });
                }
            })

        } else {
            return validationError(res, 'Please Fill All Required Fields')
        }
    },

    //--------- Admin Sign IN ----------------
    adminSignIn: function (req, res) {
        if (req.body.admin_email != '' && req.body.admin_password != '') {
            var where = {
                'admin_email': req.body.admin_email,
                'admin_password': req.body.admin_password
            }
            adminDB.find(where, (err, docs) => {
                if (docs.length > 0) {
                    //console.log(docs[0]._id);
                    var token = jwt.sign({
                        id: docs[0]._id
                    }, config.secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    var newvalues = {
                        $set: {
                            'jwtToken': token,
                        }
                    };
                    adminDB.updateOne(where, newvalues, function (err, doc) {
                        if (err) {
                            res.send({
                                "code": 400,
                                "result": err,
                                "message": "Not Update Token. Error while login!!!!"
                            });
                        } else {
                            res.send({
                                "code": 200,
                                "result": docs,
                                "data": doc,
                                "message": "Admin Login Successfully"
                            });
                        }
                    });
                } else {
                    res.send({
                        "code": 400,
                        "result": err,
                        "message": "Invalid Credentials"
                    });
                }
            });
        } else {
            res.send({
                "code": 400,
                "result": '',
                "message": "Please Fill All Required Fields"
            });
        }
    },

    register: async function (req, res) {
        try {
            const {
                admin_email,
                admin_password
            } = req.body;
            // Validate user input
            if (!(admin_email && admin_password)) {
                return validationError(res, 'Please Fill All Required Fields')
            }
            // check if user already exist
            // Validate if user exist in our database
            const oldUser = await adminDB.findOne({
                admin_email
            });

            if (oldUser) {
                return errorResponse(res, 'Email Already Exist!')
            }

            //Encrypt user password
            //encryptedPassword = await bcrypt.hash(password, 10);

            // Create user in our database
            const user = await adminDB.create({
                admin_email: admin_email, // sanitize: convert email to lowercase
                admin_password: admin_password,
                status: 1
            });

            // Create token
            var token = jwt.sign({
                id: user._id
            }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            // save user token
            user.jwtToken = token;

            const updateToken = await adminDB.updateOne({
                admin_email
            }, {
                jwtToken: user.jwtToken
            });

            // return new user
            if (updateToken) {
                return successWithData(res, 'Successfully Sign Up New Admin', user)
            }

        } catch (err) {
            console.log(err);
        }

    },

    login: async function (req, res) {

        // Our login logic starts here
        try {
            // Get user input
            const {
                admin_email,
                admin_password
            } = req.body;

            // Validate user input
            if (!(admin_email && admin_password)) {
                return validationError(res, 'Please Fill All Required Fields')
            }
            // Validate if user exist in our database
            const user = await adminDB.findOne({
                admin_email,
                admin_password
            }).lean();

            //if (user && (await bcrypt.compare(password, user.password))) {
            if (user) {
                // Create token
                // const token = jwt.sign(
                //   { user_id: user._id, email },
                //   process.env.TOKEN_KEY,
                //   {
                //     expiresIn: "2h",
                //   }
                // );

                var token = jwt.sign({
                    id: user._id,
                    admin_email
                }, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });

                // save user token
                user.jwtToken = token;
                //console.log("token", user.jwtToken)

                const updateToken = await adminDB.updateOne({
                    admin_email
                }, {
                    jwtToken: user.jwtToken
                });

                // user
                if (updateToken) {
                    return successWithData(res, 'Successfully login', user)
                }

            }
            return errorResponse(res, 'Invalid Credentials')
        } catch (err) {
            console.log(err);
        }


    },
    getallusers: async function (req, res) {
        try {
            const {
                type
            } = req.body;
            // Validate user input 

            const Data = await signDB.find({
                type: type
            }).lean();
            if (Data) {
                return successWithData(res, "Data found", Data);
            } else {

                return errorResponse(res, "Data Not Found");
            }



        } catch (err) {
            console.log(err);
        }

    },

    kycById: async function (req, res) {
        try {
            // var profile_id=req.user.id;
            //var _id=profile_id;
            const {
                user_id
            } = req.body;
            const kycid = await kycDB.findOne({
                user_id: user_id
            });
            console.log('kycid', kycid);
            if (kycid) {
                if (kycid.frontimage == '' && kycid.backimage == '' && kycid.faceimage == '') {
                    res.send({
                        code: 400,
                        success: true,
                        data: kycid,
                        kycUrl: kycpath.kycurl,
                        message: 'KYC Data Not Found'
                    })
                } else {
                    res.send({
                        code: 200,
                        success: true,
                        data: kycid,
                        kycUrl: kycpath.kycurl,
                        message: 'KYC Data Found'
                    })
                }
                // return successWithData(res, 'Data Found', kycid);
            } else {
                res.send({
                    code: 400,
                    // success: true,
                    // data: kycid,
                    // kycUrl: kycpath.kycurl,
                    message: 'KYC Data Found'
                })
            }

        } catch (err) {
            console.log(err);
        }
    },

    kycverified: async function (req, res) {
        try {
            const {
                user_id,
                verifystatus
            } = req.body
            const kycuser = await kycDB.findOne({
                user_id: req.body.user_id
            });
            console.log('kycuser', kycuser);
            var status = '';
            if (verifystatus == 'verified' || verifystatus == 'rejected') {
                if (verifystatus == 'verified') {
                    var status = 'verified';
                } else {
                    var status = 'rejected';
                }
                var newvalues = {
                    $set: {
                        verifystatus: status,

                        //status:1
                    }
                }
                console.log('newvalues', newvalues);
                const updated = await kycDB.findOneAndUpdate({
                    user_id: user_id
                }, newvalues);
                if (updated) {
                    console.log('sattusvalue', status);
                    if (status == 'verified') {
                        const stylist = await signDB.updateOne({ _id: user_id}, {status: 1,kycstatus:'verified',completestatus:3 });
                        return successWithData(res, 'Updated', stylist);
                    } else {
                        // console.log('abvbbuhdd');
                        const stylists = await signDB.updateOne({_id: user_id }, {status: '0',kycstatus:'rejected'
                        });
                        return successWithData(res, 'Updated', stylists);
                    }
                } else {
                    return errorResponse(res, 'error');
                }
            }
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
            const resend = await adminDB.findOne({
                admin_email: email
            }).lean();
           //  console.log('resend',resend);
            // if (resend) {
            const token = generateotp();
            // resend.otp = otpGenerated;
            //console.log('resend',token);
            if(resend){
            const updateOtp = await adminDB.findOneAndUpdate({
                admin_email: email
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
            //     to: 'harishstealth@gmail.com',
            //     from: 'projects@stealthtechnocrats.com',
            //     // from:'stylistpiazza@gmail.com',
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
                    user: 'harishstealth@gmail.com',
                    pass: 'dwwoplablsfgreyz'
                }
            });
            //var firstname=signDB.firstname;
            var url = "http://13.233.224.121/manage/admin/reset_password#" + token;
            let mailDetails = {
                from: 'harishstealth@gmail.com',
                to: email,
                subject: 'forgot Password mail',
                html:  `
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

            await mailTransporter.sendMail(mailDetails, function(err, data) {
                if(err) {
                    // console.log('Error Occurs',err);
                    return errorWithData(res,'Error')
                } else {
                     console.log('Email sent successfully');
                    return successData(res,'Email Sent Successfully');
                }
            });
        }else{
            return errorWithData(res,'Please Enter Correct Email');
        }
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
            var user_data = await adminDB.findOne({passToken: token});
            console.log('boolean',user_data);
            if (Boolean(user_data)) 
            {

                if (password == confirmPassword) {
                    var updated = await adminDB.findOneAndUpdate({
                        passToken: token
                    }, {
                        admin_password: password
                    }, {
                        new: true,
                        upsert: true
                    });
                    //empty pass_token after password updated 
                    var update = await adminDB.findOneAndUpdate({
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
                    return errorWithData(res,'Password and confirm password does not match')
                }
            } else {
                return errorWithData(res, 'No data found');
            }
        } catch (err) {
            console.log(err);
        }
    },

    getbookorder: async function(req,res){
        try{
            //const book =await ordereDB.find({stylist_id:req.body.id});
            var data = await ordereDB.aggregate([{
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
        ]);
        console.log('data',data);
        return successWithData(res,'Data Found',data);
            // if(book.length > 0){
            //     const profile=await signDB.findOne({_id:book[0].user_id})
            //     if(profile){
            //         res.send({
            //             code: 200,
            //             success: 'true',
            //             data: {
            //                 book: book,
            //                 profile_image: profile.profile_image,
            //                 profile_name: profile.firstname + " " + profile.lastname,
            //                 phone:profile.phone
            //             },
            //             //profile:profile,
            //             message: 'Data Found'
            //         })
            //     }
            //   //  return successWithData(res,'Data Successfully Found',book);
            // }else{
            //     return errorResponse(res,'Error Occured');
            // }
            

        }catch(err){
            console.log(err);
        }
    },

    deletecustomer: async function(req,res){
        try{
            const find=await signDB.findOne({_id:req.body.id});
            if(find){
                const find1=await signDB.deleteOne({_id:req.body.id});
                if(find1){
                    return successWithData(res,'Account Successfully Deleted',find1);
                }
            }else{
                return errorResponse(res,'Account Not Found');
            }

            
        }catch(err){
            console.log(err);
        }
    },
}