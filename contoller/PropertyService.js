var PropertyModel = require('./PropertyModel');
const RentalRequestModel = require('./RentalRequestModel');
const RentModel = require('./RentModel');
const { v4: uuidv4 } = require('uuid');

class PropertyService {
    constructor() {
    }

    async isPropertyAvailable(propertyId, address, lms) {
        return new Promise(async (resolve, reject) => {
            if (propertyId) {
                lms.isPropertyAvailable(propertyId, { from: address })
                    .then(async (data) => {
                        resolve(data);
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
    async depositSecurity(userId, contractId, lms) {
        return new Promise(async (resolve, reject) => {
            if (contractId) {
                var rentalRequestModelInst = new RentalRequestModel();
                let rentalRequest = await rentalRequestModelInst.findRentalRequest({ contractId, requestApprovalDone: true });
                if (rentalRequest.length <= 0) {
                    return Promise.reject("Rental request not found or is not approved");
                }
                var propertyModelInst = new PropertyModel();
                let property = await propertyModelInst.findProperty({ propertyId: rentalRequest[0].propertyId });
                lms.depositSecurity(contractId, { from: rentalRequest[0].tenantAddress, value: property[0].securityDeposit })
                    .then((data, _address) => {
                        return resolve(data);
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

    async payrent(NFTTokenId, contractId, lms) {
        let rentModelInst = new RentModel();
        return new Promise(async (resolve, reject) => {
            if (NFTTokenId) {
                var rentalRequestModelInst = new RentalRequestModel();
                let rentalRequest = await rentalRequestModelInst.findRentalRequest({ contractId, requestApprovalDone: true });
                if (rentalRequest.length <= 0) {
                    return reject("Rental request not found or is not approved");
                }
                let rent = await rentModelInst.findRent({ contractId })
                if (rent.length > 0) {
                    return reject("Rent already paid for first month");
                }
                var propertyModelInst = new PropertyModel();
                let property = await propertyModelInst.findProperty({ propertyId: rentalRequest[0].propertyId });

                if (property.length <= 0) {
                    return reject("Property not found for this contract");
                }

                lms.ADMIN()
                    .then(async (data) => {
                        console.log(data, rentalRequest[0].ownerAddress, rentalRequest[0].tenantAddress)
                        return lms.approve('0x04F93DEB7Ee4fCedA622AAdEE7C79C3fa8b78723', NFTTokenId, { from: rentalRequest[0].ownerAddress })
                    })
                    .then(() => {
                        lms.bTransferFrom(rentalRequest[0].propertyId, rentalRequest[0].ownerAddress, rentalRequest[0].tenantAddress, { from: '0x04F93DEB7Ee4fCedA622AAdEE7C79C3fa8b78723' })
                    })
                    .then(async (data) => {
                        let rentDetails = {
                            rentAmount: property[0].rentAmount,
                            contractId
                        }
                        await rentModelInst.createRent(rentDetails);
                        return resolve(data);
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

    vOwnerOf(propertyId, address, lms) {
        // return new Promise(async (resolve, reject) => {
        //     if (propertyId) {
        //         lms.vOwnerOf(propertyId, { from: address })
        //             .then(async (data) => {
        //                 return resolve(data)
        //             })
        //             .catch(err => {
        //                 console.log(err)
        //                 return reject(err)
        //             })
        //     } else {
        //         return reject("wrong input")
        //     }
        // })
    }

    async getContractDetails(userId, contractId, address, lms) {
        return new Promise(async (resolve, reject) => {
            if (contractId) {
                lms.objGetRentAgreement(contractId, { from: address })
                    .then(async (data) => {
                        let res = {
                            doesExist: true,
                            ownerAddress: data[1],
                            tenantAddress: data[2],
                            contractId: data[3],
                            rentAmount: data[4],
                            security_deposit: data[5],
                            duration_in_months: data[6],
                            move_in_date: data[7],
                            date_of_creation: data[8]
                        }
                        return resolve(res)
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

    createProperty(userId, details, lms, address) {
        details.userId = userId;
        details.propertyId = uuidv4();
        let PropertyType = {
            "House": 0,                         //  0 House
            "ApartmentAndUnit": 1,              //  1 Apartment and unit
            "Townhouse": 2,                     //  2 Townhouse
            "Villa": 3,                         //  3 Villa
            "BlockOfUnits": 4,                  //  4 Block of units (?)
            "RetirementLiving": 5              //  5 Retirement living
        }

        return new Promise(async (resolve, reject) => {
            if (details) {
                lms.vAddProperty(details.propertyId, details.location, details.dateOfPosting.toString(), true, PropertyType[details.propertyType], { from: address })
                    .then(async (data, hash) => {
                        console.log(data.tx)
                        details.transactionHash = data.tx;
                        return data;
                    })
                    .catch(err => {
                        console.log("error while creating property on blockchain", err)
                        return reject(err)
                    })
                    .then((data) => {
                        return lms.objGetNFTToken(details.propertyId, { from: address })
                    }).then((data) => {
                        console.log(data.toNumber())
                        var propertyModelInst = new PropertyModel();
                        details._id = uuidv4();
                        details.NFTTokenId = data.toNumber();
                        return resolve(propertyModelInst.createProperty(details));
                    })
                    .catch(err => {
                        console.log("error while creating property in db", err)
                        return reject(err)
                    })
            } else {
                return reject("wrong input")
            }
        })
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
            dbFilter.tenantUserId = filter.tenantUserId;
        }
        if (filter.availability) {
            dbFilter.availability = filter.availability;
        }
        var propertyModelInst = new PropertyModel();
        return propertyModelInst.findProperty(dbFilter);
    }

    getPropertyById(propertyId, address, lms) {
        return new Promise(async (resolve, reject) => {
            if (propertyId) {
                lms.getProperty(propertyId, { from: address })
                    .then(async (data) => {
                        resolve(data);
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

    setRent(propertyId, details, address, lms) {
        var propertyModelInst = new PropertyModel();
        return new Promise(async (resolve, reject) => {
            if (propertyId && details.securityDeposit && details.rentAmount && address) {
                lms.setRent(propertyId, details.securityDeposit, details.rentAmount, { from: address })
                    .then(async (data) => {
                        await propertyModelInst.updateProperty(propertyId, { rentAmount: details.rentAmount, securityDeposit: details.securityDeposit });
                        resolve(data);
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

    withdrawFunds(address, lms) {
        return new Promise(async (resolve, reject) => {
            if (address) {
                lms.withdraw({ from: address })
                    .then(async (data) => {
                        resolve(data);
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

    changeStatus(propertyId, address, status, lms) {
        return new Promise(async (resolve, reject) => {
            if (address && propertyId) {
                if (status === 'deactivate') {
                    lms.deactivateProperty(propertyId, { from: address })
                        .then(async (data) => {
                            resolve(data);
                        })
                        .catch(err => {
                            console.log(err)
                            return reject(err)
                        })
                }
                else if (status == 'activate') {
                    lms.activateProperty(propertyId, { from: address })
                        .then(async (data) => {
                            resolve(data);
                        })
                        .catch(err => {
                            console.log(err)
                            return reject(err)
                        })
                } else {
                    return reject("Status shuold be either activate or deactivate")
                }
            } else {
                return reject("wrong input")
            }
        })
    }


    updateProperty(id, data) {
        var propertyModelInst = new PropertyModel();
        return propertyModelInst.updateProperty(id, data);
    }
}


module.exports = PropertyService;
