
const express = require('express');
const signDB = require('../../models/user/Signup.model.js')
const serviceDB = require('../../models/user/service.model.js')
const userskillDB = require('../../models/user/userskill.model.js')
const verifyToken = require('../../middleware/authentication.js');
const imagevedioDB = require('../../models/user/imagevedio.model.js');
const leadsDB = require('../../models/user/leads.model.js');
const chatDB = require('../../models/user/chat.model.js');
const kycpath = require('../../config/db.js')
const img = require('../../config/db.js')
const categoryDB = require('../../models/user/categoryList.model.js');
const kycDB = require('../../models/user/kyc.model.js');
const mongoose = require('mongoose');
const mime = require('mime');
const ObjectId = mongoose.Types.ObjectId;
const nodemailer = require('nodemailer');
const twilio = require('twilio');
var request = require('request');

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
const app = express();

module.exports = {
    verifyToken,
    // message: async function (req, res) {
    //     try {
    //         // io.on('connection', () =>{
    //         //     console.log('a user is connected')
    //         //   })
    //         var profile_id = req.user.id;

    //         const {
    //             message,
    //             receiver_id
    //         } = req.body;
    //         // console.log('leads', req.body);           
    //        //res.sendStatus(200);
    //         const chat = await chatDB.create({
    //             message: message,
    //             sender: profile_id,
    //             receiver: receiver_id,
    //         })
    //         //console.log('user',user);
    //         io.emit('message', chat);

    //         return successWithData(res, 'save successfully', chat);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // },
    // getmessage: async function (req, res) {
    //     try {            
            
    //     //     var profile_id = req.user.id;
    //     //     const {                
    //     //         receiver_id
    //     //     } = req.body;           
    //     //     const profile = await chatDB.find({$or: [{
    //     //         sender:profile_id,receiver:receiver_id
    //     //     },
    //     //     {
    //     //         sender:receiver_id,receiver:profile_id
    //     //     }
    //     // ]});
    //     //     console.log('profile',profile);
    //       //  const getApiAndEmit = socket => {
    //             const response = new Date();
    //             // Emitting a new message. Will be consumed by the client
    //            // socket.emit("FromAPI", response);
    //         //  };
    //       //  io.emit('output',profile)
    //        // return successWithData(res, 'Get successfully', profile);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // },
}