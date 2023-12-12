module.exports = {
database: 'mongodb://localhost:27017/piazzDB',
    secret:'secret',
    otp_length:4,
    otp_config:{
        digits:true,
        upperCaseAlphabets:false,
        specialChars:false,
        //String:false,
        Alphabets:false,
        lowerCaseAlphabets:false
        
    },
    imgUrl:'http://13.233.224.121/uploads/',
    kycurl:'http://13.233.224.121/uploads/kycuploads/'
    // database: 'mongodb://localhost:27017/piazzamindDB',
    // secret: 'supersecret'
}
