const otpGenerator=require('otp-generator');
const {otp_length,otp_config}=require('../config/db.js')
module.exports.generateotp=()=>{
    const otp=otpGenerator.generate(otp_length,otp_config);
    return otp;
},


module.exports.generatetoken=()=>{
  
    const otp=otpGenerator.generate(6,{
        digits:true,
        upperCaseAlphabets:true,
        specialChars:false,
        //String:false,
        Alphabets:true,
        lowerCaseAlphabets:true
        
    });
    return otp;
}
