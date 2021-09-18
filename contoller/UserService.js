const { db } = require('./User');
var UserModel = require('./UserModel');

class UserService {
    constructor() {
    }

    createUser(details) {
        // details.userId = userId;
        var UserModelInst = new UserModel();
        return UserModelInst.createUser(details);
    }
    
    findUser(filter){
        let dbFilter = {};
        if(filter.userId){
            dbFilter.userId =  filter.userId;
        }
        if(filter.emailId){
            dbFilter.emailId =  filter.emailId;
        }
        if(filter.publicKey){
            dbFilter.publicKey =  filter.publicKey;
        }
        var UserModelInst = new UserModel();
        return UserModelInst.findUser(dbFilter);
    }
    

    updateUser(id, data){
        var UserModelInst = new UserModel();
        return UserModelInst.updateUser(id, data);
    }

    findByPublicKey(publicKey) {
        let dbFilter = {};
        dbFilter.publicKey =  publicKey;
        var UserModelInst = new UserModel();
        return UserModelInst.findUser(dbFilter);
    }
}


module.exports = UserService;
