var PropertyModel = require('./PropertyModel');
const RentalRequestModel = require('./RentalRequestModel');


class PropertyService {
    constructor() {
    }

    async depositSecurity(userId, contractId, lms) {
        return new Promise(async (resolve, reject) => {
            if (contractId) {
                var rentalRequestModelInst = new RentalRequestModel();
                let rentalRequest = await rentalRequestModelInst.findRentalRequest({ contractId, requestApprovalDone: true });
                if (rentalRequest.length <= 0) {
                    return Promise.reject("Rental request not found or is not approved");
                }
                if (rentalRequest[0].ownerUserId !== userId) {
                    return Promise.reject("Rental request does not belong to the logged in user");
                }
                lms.depositSecurity(contractId, { from: rentalRequest[0].tenantAddress, value: rentalRequest[0].securityDeposit })
                    .then((_hash, _address) => {
                        console.log("_hash", _hash)
                        return resplve(_hash);
                    })
                    .catch(err => {
                        console.log(err);
                        return reject(err)
                    })
            } else {
                return reject("wrong input")
            }
        })
    }

    async payrent(userId, contractId, lms) {
        return new Promise(async (resolve, reject) => {
            if (userId && contractId) {
                var rentalRequestModelInst = new RentalRequestModel();
                let rentalRequest = await rentalRequestModelInst.findRentalRequest({ contractId, requestApprovalDone: true });
                if (rentalRequest.length <= 0) {
                    return Promise.reject("Rental request not found or is not approved");
                }
                if (rentalRequest[0].ownerUserId !== userId) {
                    return Promise.reject("Rental request does not belong to the logged in user");
                }
                lms.payRent(contractId, { from: rentalRequest[0].tenantAddress, value: rentalRequest[0].rentAmount })
                    .then(async (_hash, _address) => {
                        console.log(hash)
                        return resolve(_hash);
                    })
                    .catch(err => {
                        console.log(err)
                        return reject(err);
                    })
            } else {
                return reject("wrong input");
            }
        })
    }

    async getContractDetails(userId, contractId, address, lms) {
        return new Promise(async (resolve, reject) => {
            if (contractId) {
                lms.getContractDetails(contractId, { from: address })
                    .then(async (data) => {
                        return resolve(data)
                    })
                    .catch(err => {
                        console.log(err)
                        return reject(err)
                    })
            } else {
                return reject("wrong input")
            }
        })
    }

    createProperty(userId, details) {
        details.userId = userId;
        var propertyModelInst = new PropertyModel();
        return propertyModelInst.createProperty(details);
    }

    findProperty(filter) {
        let dbFilter = {};
        if (filter.propertyId) {
            dbFilter.propertyId = filter.propertyId;
        }
        if (filter.userId) {
            dbFilter.userId = filter.userId;
        }
        if (filter.pincode) {
            dbFilter.pincode = filter.pincode;
        }
        if (filter.tenantUserId) {
            dbFilter.tenantUserId = tenantUserId;
        }
        var propertyModelInst = new PropertyModel();
        return propertyModelInst.findProperty(dbFilter);
    }


    updateProperty(id, data) {
        var propertyModelInst = new PropertyModel();
        return propertyModelInst.updateProperty(id, data);
    }
}


module.exports = PropertyService;
