const express=require('express');
const {
    successWithData,
    errorWithData,
    successData,
    validateData,
    notFound,
    errorResponse,
} = require('../../helpers/apiResponse.js')
const categoryDB = require('../../models/user/categoryList.model.js')
const signDB=require('../../models/user/Signup.model.js');
//const fs = require('fs');


module.exports={
	countCategory: async function (req, res) {
        try {
            const count = await categoryDB.find({
                status: 1
            }).count();
            if (count) {
                return successWithData(res, 'Data Counted', count);
            } else {
                return errorResponse(res, 'Data not counted');
            }
        } catch (err) {
            console.log(err)
        }
    },

    countUser: async function (req, res) {
        try {
            const countstylist = await signDB.find({
                status: 1,type:'stylist'
            }).count();
            const countuser = await signDB.find({
                status: 1,type:'user'
            }).count();
           if (countstylist && countuser) {
                // return successWithData(res, 'Stylist Data Counted', countstylist);
                res.send({
                    code:200,
                    success:true,
                    data:countstylist,
                    data1:countuser,
                    message:"found"
                })
            } else {
               
               
                    return errorWithData(res,'Error');
                
            }
        } catch (err) {
            console.log(err)
        }
    },

    


}