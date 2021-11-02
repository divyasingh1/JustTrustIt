var RentalRequest = require('./RentalRequest');
var Promise = require('bluebird');
const { v4: uuidv4 } = require('uuid');

class RequestModel {
    constructor() {
    }

    findRentalRequest(filter){
        return new Promise(function (resolve, reject) {
            RentalRequest.find(filter, function (err, RentalRequest) {
                if (err) {
                    console.log("Error in finding RentalRequest", err);
                    return reject("Error in finding RentalRequest");
                }
                if (!RentalRequest) {
                    console.log("property not found");
                    return reject("property not found");
                }
                return resolve(RentalRequest)
            });
        });
    }

    createRentalRequest(tenantUserId, details) {
        details._id = uuidv4();
        details.rentalRequestId = uuidv4();
        return new Promise(function (resolve, reject) {
            return RentalRequest.create(details, function (err, user) {
                if (err) {
                    console.log("Error in creating rental request", err)
                    return reject("Error in creating rental requests");
                }
                return resolve(user)
            });
        });
    }

    updateRentalRequest(rentalRequestId, data){
        return new Promise ((resolve, reject)=>{
            RentalRequest.updateMany(
            {
                "rentalRequestId": rentalRequestId,
            },
            {
                "$set":
                    data,
            }, (err, res)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(res)
                }
            })
        })
    }

    findPropertyJoin(filter){
        return new Promise(function (resolve, reject) {
            RentalRequest.aggregate([ 
              {$lookup:{from:'properties', localField: 'propertyId', foreignField: 'propertyId',as: 'property'}}])
            .exec(function(err, res) {
                if (err) {
                    console.log("Error in finding property", err);
                    return reject("Error in finding property");
                }
                console.log(res)
                if (!res) {
                    console.log("property not found");
                    return reject("property not found");
                }
                return resolve(res)
            });
        });
    }
}

module.exports = RequestModel;