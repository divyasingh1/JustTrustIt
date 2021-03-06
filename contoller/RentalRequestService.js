const PropertyModel = require('./PropertyModel');
const RentalRequestModel = require('./RentalRequestModel');
class RentalRequestService {
    constructor() {
    }

    async findPropertyJoin(userId) {
        let dbFilter = {"ownerUserId": userId};
        var rentalRequestModelInst = new RentalRequestModel();
        return rentalRequestModelInst.findPropertyJoin();
    }

    async updateRentalRequest(rentalRequestId, userId, publicKey, lms) {
        return new Promise(async (resolve, reject) => {
            var rentalRequestModelInst = new RentalRequestModel();
            var propertyModelInst = new PropertyModel();
            let rentalRequest = await rentalRequestModelInst.findRentalRequest({ rentalRequestId, requestApprovalDone: false });
            if (rentalRequest.length <= 0) {
                return reject("Rental request not found or is approved already");
            }
            rentalRequest = rentalRequest[0];
            let property = await propertyModelInst.findProperty({ propertyId: rentalRequest.propertyId });

            if (property.length <= 0) {
                return reject("Property not found");
            }

            if (rentalRequest.tenantAddress && rentalRequest.duration) {
                await lms.methods.vInitRentAgreement(rentalRequest.contractId, rentalRequest.propertyId, rentalRequest.tenantAddress, rentalRequest.duration, property[0].initialAvailableDate.toString(), rentalRequest.rentAmount, rentalRequest.securityDeposit).send({ from: publicKey })
                    .then(async (hash) => {
                        await propertyModelInst.updateProperty(rentalRequest.propertyId, { availability: false, tenantUserId: rentalRequest.tenantUserId })
                        // await propertyModelInst.updateProperty(rentalRequest.propertyId, { availability: false, tenantUserId: rentalRequest.tenantUserId });
                        await rentalRequestModelInst.updateRentalRequest(rentalRequestId, { requestApprovalDone: true, ownerAddress: publicKey });
                        return resolve(hash);
                    })
                    .then((hash) => {
                        return resolve(hash);
                    })
                    .catch(err => {
                        console.log(err)
                        return reject(err);
                    })
            } else {
                return reject("Invalid request");
            }
        })
    }

    async vBurnRentAgreement(contractId, lms, address) {
        return new Promise(async (resolve, reject) => {
            if (contractId) {
                lms.methods.vBurnRentAgreement(contractId).send({ from: address })
                    .then(async (data) => {
                        resolve(data);
                    })
                    .catch(err => {
                        console.log(err)
                        return reject(err)
                    })
            } else {
                return reject("Wrong input")
            }
        })
    }

    async createRentalRequest(tenantUserId, publicKey, data) {
        let propertyModelInst = new PropertyModel();
        var rentalRequestModelInst = new RentalRequestModel();
        try {
            let rentalRequest = await rentalRequestModelInst.findRentalRequest({ propertyId: data.propertyId, requestApprovalDone: true });
            if (rentalRequest && rentalRequest.length) {
                return Promise.reject("Property is not available for rent");
            }
            let property = await propertyModelInst.findProperty({ propertyId: data.propertyId, availability: true });
            if (property && property.length) {
                data.ownerUserId = property[0].userId;
                data.tenantUserId = tenantUserId;
                data.requestApprovalDone = false;
                let contractId = Math.floor(Math.random() * 10000);
                data.contractId = contractId;
                data.tenantAddress = publicKey;
                if (!data.rentAmount) {
                    data.rentAmount = property[0].rentAmount;
                }
                if (!data.securityDeposit) {
                    data.securityDeposit = property[0].securityDeposit;
                }
                data.NFTTokenId = property[0].NFTTokenId;
                console.log("data", data)
                return rentalRequestModelInst.createRentalRequest(tenantUserId, data);
            } else {
                return Promise.reject("Property Not found")
            }
        } catch (e) {
            console.log("Error in create rental request", e)
            return Promise.reject("Property Not found or this property is not available")
        }
    }

    extendContractDurationRequest(userId, address, contractId, extensionDuration, lms) {
        return new Promise(async (resolve, reject) => {
            if (address && contractId && extensionDuration) {
                lms.methods.extendContractDurationRequest(contractId, extensionDuration).send({ from: address })
                    .then(async (data) => {
                        resolve(data);
                    })
                    .catch(err => {
                        console.log(err)
                        return reject(err)
                    })
            } else {
                return reject("Wrong input")
            }
        })
    }

    extendContractDurationConfirm(userId, address, contractId, extensionDuration, lms) {
        return new Promise(async (resolve, reject) => {
            if (address && contractId && extensionDuration) {
                lms.methods.extendContractDurationConfirm(contractId, extensionDuration).send({ from: address })
                    .then(async (data) => {
                        resolve(data);
                    })
                    .catch(err => {
                        console.log(err)
                        return reject(err)
                    })
            } else {
                return reject("Wrong input")
            }
        })
    }

    getPendingFunds(userId, address, lms) {
        return new Promise(async (resolve, reject) => {
            if (address) {
                lms.methods.getPendingFunds().call({ from: address })
                    .then(async (data) => {
                        return resolve(data);
                    })
                    .catch(err => {
                        return reject(err);
                    })
            } else {
                return reject("Wrong input")
            }
        });
    }

    findRentalRequest(filter) {
        let dbFilter = {};
        if (filter.requestApprovalDone) {
            dbFilter.requestApprovalDone = filter.requestApprovalDone;
        }
        if (filter.rentalRequestId) {
            dbFilter.rentalRequestId = filter.rentalRequestId;
        }
        if (filter.tenantUserId) {
            dbFilter.tenantUserId = filter.tenantUserId;
        }
        if (filter.propertyId) {
            dbFilter.propertyId = filter.propertyId;
        }
        if (filter.ownerUserId) {
            dbFilter.ownerUserId = filter.ownerUserId;
        }
        if (filter.contractId) {
            dbFilter.contractId = filter.contractId;
        }

        var rentalRequestModelInst = new RentalRequestModel();
        return rentalRequestModelInst.findRentalRequest(dbFilter);
    }
}


module.exports = RentalRequestService;
