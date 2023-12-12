const express=require('express')
const contactDB=require('../../models/user/contact.model.js');
const leadsDB = require('../../models/user/leads.model.js');
const {
    success,
    errorResponse,
    successWithData,
    validationError,
    notFound
} = require('../../helpers/apiResponse');
var fs = require('fs');
var path = require('path');

module.exports={
createContact: async function (req, res) {
        try {
            const {
                name,
                email,
                subject,
                message
            } = req.body;
            if (!(name, email, subject, message)) {
                return errorResponse(res, 'Required All Fields');
            } else {
                const user = await contactDB.create({
                    name,
                    email,
                    subject,
                    message
                })
                user.status=1
                user.save((err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Please Try Again');
                    } else {
                        return successWithData(res, 'Your Message Submitted Successsfully', doc);
                    }
                })
            }

        } catch (err) {
            Console.log(err)
        }
    },

    getAllContact: async function (req, res) {
        try {
            // const {
            //     id
            // } = req.body
            // var _id = id;
            const contacter = await contactDB.find({
                
            });
            if (contacter) {
                return successWithData(res, 'Contact Found', contacter)
            } else {
                return errorResponse(res, 'Data NOt Found');
            }

        } catch (err) {
            console.log(err);
        }
    },
    getAllleads: async function (req, res) {
        try {
            // const {
            //     id
            // } = req.body
            // var _id = id;
            const contacter = await leadsDB.find({
                
            });
            if (contacter) {
                return successWithData(res, 'Contact Found', contacter)
            } else {
                return errorResponse(res, 'Data NOt Found');
            }

        } catch (err) {
            console.log(err);
        }
    },

    deleteContact: async function(req,res){
        try{
            const{id}=req.body;
            var _id=id;
            const deleted=await leadsDB.findById({_id});
            if(deleted){
                leadsDB.deleteOne({_id},(err,doc)=>{
                    if (err){
                        return errorResponse(res,'Please Try Again')
                    }else{
                        return successWithData(res,'Contact Successfully Deleted',doc);
                    }
                })
                
            }else{
                return errorResponse(res,'Contact Not Found');
            }

        }catch(err){
            console.log(err);
        }
    }
}