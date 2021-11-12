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
                lms.methods.isPropertyAvailable(propertyId).call({ from: address })
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
                lms.methods.depositSecurity(contractId).send({ from: rentalRequest[0].tenantAddress, value: property[0].securityDeposit })
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

    async payPerMonthRent(propertyId, txHash) {
        let rentModelInst = new RentModel();
        return new Promise(async (resolve, reject) => {
            if (propertyId) {
                var rentalRequestModelInst = new RentalRequestModel();
                let rentalRequest = await rentalRequestModelInst.findRentalRequest({ propertyId, requestApprovalDone: true });

                if (rentalRequest.length <= 0) {
                    return reject("Rental request not found or is not approved");
                }

                let rent = await rentModelInst.findRent({ contractId: rentalRequest[0].contractId })
                if (rent.length < 0) {
                    return reject("Pay Rent for 1st month");
                }
                var propertyModelInst = new PropertyModel();
                let property = await propertyModelInst.findProperty({ propertyId: rentalRequest[0].propertyId });

                if (property.length <= 0) {
                    return reject("Property not found for this contract");
                }
                let rentDetails = {
                    rentAmount: rentalRequest[0].rentAmount,
                    contractId: rentalRequest[0].contractId,
                    txHash
                }
                await rentModelInst.createRent(rentDetails);
                let lastRentDate = new Date(property[0].rentToBePaid);
                var newDate = new Date(lastRentDate.setMonth(lastRentDate.getMonth() + 1));
                await propertyModelInst.updateProperty(propertyId, { rentToBePaid: newDate });
                return resolve();

            } else {
                return reject("wrong input");
            }
        })
    }

    async payrent(contractId, txHash, lms) {
        let rentModelInst = new RentModel();
        return new Promise(async (resolve, reject) => {
            if (contractId) {
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
                lms.methods.ADMIN().call()
                    .then(async (data) => {
                        console.log(data, rentalRequest[0].ownerAddress, rentalRequest[0].tenantAddress)
                        return lms.methods.approve(process.env.ADMIN_ADDRESS, property[0].NFTTokenId).send({ from: rentalRequest[0].ownerAddress })
                    })
                    .then(() => {
                        return lms.methods.bTransferFrom(rentalRequest[0].propertyId, rentalRequest[0].ownerAddress, rentalRequest[0].tenantAddress).send({ from: process.env.ADMIN_ADDRESS })
                    })
                    .then(async (data) => {
                        let rentDetails = {
                            rentAmount: rentalRequest[0].rentAmount,
                            contractId,
                            txHash
                        }
                        await rentModelInst.createRent(rentDetails);
                        await rentalRequestModelInst.updateRentalRequest(rentalRequest[0].rentalRequestId, { rentAndSecurityPaid: true });
                        var newDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
                        await propertyModelInst.updateProperty(property[0].propertyId, { rentToBePaid: newDate });
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
        console.log(contractId, "contractId")
        return new Promise(async (resolve, reject) => {
            if (contractId) {
                lms.methods.objGetRentAgreement(contractId).send({ from: address })
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
            "RetirementLiving": 4            //  4 Retirement living
        }

        return new Promise(async (resolve, reject) => {
            if (details) {
                details.dateOfPosting = new Date();
                lms.methods.vAddProperty(details.propertyId, details.location, details.dateOfPosting.toString(), true, PropertyType[details.propertyType]).send({from:address})
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
                        return lms.methods.objGetNFTToken(details.propertyId).call({from:address})
                    }).then((data) => {
                        console.log(data.toNumber())
                        var propertyModelInst = new PropertyModel();
                        details._id = uuidv4();
                        details.NFTTokenId = data.toNumber();
                        details.ownerAddress = address;
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
                lms.methods.getProperty(propertyId).call({ from: address })
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

    changeRent(propertyId, details, address) {
        var propertyModelInst = new PropertyModel();
        return new Promise(async (resolve, reject) => {
            if (propertyId && address && (details.rentAmount || details.securityDeposit)) {
                let updateData = {};
                if (details.rentAmount)
                    updateData.rentAmount = details.rentAmount;
                if (details.securityDeposit)
                    updateData.securityDeposit = details.securityDeposit;

                let property = await propertyModelInst.findProperty({ propertyId, availability: true })
                if (!property || property.length <= 0) {
                    console.log("Property not found or property is already rented")
                    return reject("Property not found or property is already rented")
                }
                return propertyModelInst.updateProperty(propertyId, updateData)
                    .then(async (data) => {
                        return resolve(data);
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
                lms.methods.withdraw().send({ from: address })
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

    changeStatus(propertyId, status) {
        var propertyModelInst = new PropertyModel();
        return new Promise(async (resolve, reject) => {
            if (propertyId) {
                if (status === 'deactivate') {
                    return propertyModelInst.updateProperty(propertyId, { active: false })
                        .then(async (data) => {
                            resolve(data);
                        })
                        .catch(err => {
                            console.log(err)
                            return reject(err)
                        })
                }
                else if (status == 'activate') {
                    return propertyModelInst.updateProperty(propertyId, { active: true })
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
