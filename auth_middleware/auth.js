var _ = require('lodash');
var UserService = require('../contoller/UserService');

async function verify_user(req, res, next) {
    let userServiceInst =  new UserService();
    if(!req.headers['x-public-key']){
        return res.status(401).send("Access denied. No x-public-key provided in headers.");
    }
    let _user = await userServiceInst.findByPublicKey(req.headers['x-public-key']);
    if (_user && _user.length) {
        req.user = _user[0];
        next();
    }
    else {
        return res.status(401).send("Access Denied! Public key not found.");
    }
}

module.exports = {
    verify_user
}