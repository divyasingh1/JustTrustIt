var Rent = require('./Rent');
var Promise = require('bluebird');
const { v4: uuidv4 } = require('uuid');

class RentModel {
    constructor() {
    }

    findRent(filter) {
        return new Promise(function (resolve, reject) {
            Rent.find(filter, function (err, rent) {
                if (err) {
                    console.log("Error in finding rent", err);
                    return reject("Error in finding rent");
                }
                if (!rent) {
                    console.log("rent not found");
                    return reject("rent not found");
                }
                return resolve(rent)
            });
        });
    }

    createRent(details) {
        details._id = uuidv4();
        return new Promise(function (resolve, reject) {
            return Rent.create(details, function (err, rent) {
                if (err) {
                    console.log("Error in creating rent", err)
                    return reject("Error in creating rent");
                }
                return resolve(rent)
            });
        });
    }

    updateRent(contractId, data) {
        return new Promise((resolve, reject) => {
            Rent.updateMany(
                {
                    "contractId": contractId,
                },
                {
                    "$set":
                        data,
                }, (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(res)
                    }
                })
        })
    }
}

module.exports = RentModel;