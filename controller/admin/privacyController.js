const express=require('express')
const termsDB = require('../../models/admin/terms.model.js');
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

termsAndConditions: async function (req, res) {
        try {
            const {
                terms_of_Use,
                privacy_policy
            } = req.body
            if (!(terms_of_Use && privacy_policy)) {
                return validationError(res, 'required All Fields')
            } else {
                const terms = await termsDB.create({
                    terms_of_Use,privacy_policy,status:1
                })
                terms.save((err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Please Try Again')
                    } else {
                        return successWithData(res, 'Terms and Policies Are Created Successfully')
                    }
                })
            }
       } catch (err) {
            console.log(err)
        }
    },

    updateTerms: async function(req,res){
        try{
            const{id,terms_of_Use,privacy_policy}=req.body;
            var _id=id;
            
            const updatedTerms=await termsDB.findById({
                _id
            })
           // console.log('id',updatedTerms);
           
            if(updatedTerms){
                var newvalues={
                    $set:{
                        terms_of_Use:terms_of_Use,
                        privacy_policy:privacy_policy
                    }
                }
                //console.log('terms',updatedTerms);
                       updatedTerms.updateOne(newvalues,(err,doc)=>{
                   if(err){
                    return errorResponse(res,'Please Try Again');
                   }else{
                    return successWithData(res,'Successfully Updated Terms And Conditions',doc)
                  }
                })
           }else{
                return errorResponse(res,'Terms And Conditions Not Found');
            }
       }catch(err){
            console.log(err)
        }
    },

    deleteTerms: async function(req,res){
        try{
            const { id }=req.body;
            var _id=id;
            const deletedTerm=await termsDB.findById({_id});
            if(deletedTerm){
                termsDB.deleteOne(deletedTerm,(err,doc)=>{
                    if(err){
                        return errorResponse(res,'Please Try Again')
                    }else{
                        return success(res,'Terms And Conditions Deleted Successfully');
                    }
                })
            }else{
                return errorResponse(res,'Data Not Found');
            }
       }catch(err){
            console.log(err);
        }
    },

    getAllTerms: async function(req,res){
      try{
             termsDB.find((err,doc)=>{
                if(err){
                    return errorResponse(res,'Terms And Conditions Not found');
                }else{
                    return successWithData(res,'Terms And conditons Found Successfully',doc);
                }
           })
       }catch(err){
            console.log(err);
        }
    }
}