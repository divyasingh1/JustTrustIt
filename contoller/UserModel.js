var User = require('./User');
var Promise = require('bluebird');
const { v4: uuidv4 } = require('uuid');

class UserModel {
    constructor() {
    }

    findUser(filter) {
        return new Promise(function (resolve, reject) {
            User.find(filter, function (err, User) {
                if (err) {
                    console.log("Error in finding User", err);
                    return reject("Error in finding User");
                }
                if (!User) {
                    console.log("User not found");
                    return reject("User not found");
                }
                return resolve(User)
            });
        });
    }

    createUser(details) {
        details._id = uuidv4();
        details.userId = uuidv4();
        return new Promise(function (resolve, reject) {
            return User.create(details, function (err, User) {
                if (err) {
                    console.log("Error in creating User", err)
                    return reject("Error in creating User");
                }
                return resolve(User)
            });
        });
    }

    updateUser(UserId, data){
        console.log(">>>>User update", UserId, data)
        return new Promise ((resolve, reject)=>{
            User.updateMany(
            {
                "UserId": UserId,
            },
            {
                "$set":
                    data
            }
         , (err, res)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(res)
                }
            })
        })
    }
}

module.exports = UserModel;