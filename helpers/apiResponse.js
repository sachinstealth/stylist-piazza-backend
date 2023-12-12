exports.success = (res, message) => {
    const resdata = {
        code:200,
        success: true,
        message,


    }
    return res.json(resdata)
}

exports.successWithData = (res, message, data) => {
    const resdata = {
        code : 200,
        success: true,
        message,
        data

    }
    return res.json(resdata)
}

exports.successData = (res, message) => {
    const resdata = {
        code:200,
        success: true,
        message
    }
    return res.json(resdata);
}

exports.errorWithData = (res, message) => {
    const resdata = {
        code:400,
        success: false,
        message
    }
    return res.json(resdata)
}


exports.errorResponse = (res, message) => {
    const resdata = {
        code : 400,
        success: false,
        message,
    }
    return res.json(resdata)
}

exports.validateData=(res,message)=>{
    const resdata={
        code:400,
        success:false,
        message

    }
    return res.json(resdata);
}


exports.notFound = (res, message) => {
    const resdata = {
         code:404,
        success: false,
        message,
    }
    return res.json(resdata)
}

exports.validationError = (res, message) => {
    const resdata = {
         code:400,
        success: false,
        message
    }
    return res.json(resdata)
}
