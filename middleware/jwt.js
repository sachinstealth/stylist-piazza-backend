var jwt = require('jsonwebtoken');

exports.auth = (res, message, data) => {
    var token = jwt.sign({
        id: doc._id
    }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
    });

    return token;
}
