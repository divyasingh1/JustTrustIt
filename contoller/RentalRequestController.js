var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var RentalRequestService = require('./RentalRequestService');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const Web3 = require('web3');
const contract = require('truffle-contract');
const artifacts = require('../build/TrustedPropertiesBasicRentContract.json');
if (typeof web3 !== 'undefined') {
    var web3 = new Web3(web3.currentProvider)
  } else {
    var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
}
const LMS = contract(artifacts)
LMS.setProvider(web3.currentProvider)
    //const lms = LMS.at(contract_address) for remote nodes deployed on ropsten or rinkeby

router.patch('/:rentalRequestId',async function (req, res) {
    var rentalRequestServiceInst = new RentalRequestService();
    req.userId = req.user.userId;
    req.publicKey = req.user.publicKey;
    const lms = await LMS.deployed();
    return rentalRequestServiceInst.updateRentalRequest(req.params.rentalRequestId, req.userId,  req.publicKey, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Rental request Approved successfully"});
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed" , message: "Rental request couldn't be Approved successfully", error: err});
        });
});


router.post('/', function (req, res) {
    var rentalRequestServiceInst = new RentalRequestService();
    req.userId = req.user.userId;
    if(!req.body.propertyId){
        return res.status(400).send({ status: "Failed" , message: "PropertyId is required"});
    }
    return rentalRequestServiceInst.createRentalRequest(req.userId, req.user.publicKey, req.body)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Rental request Sent successfully",data});
        })
        .catch((err) => {
            res.status(400).send({ status: "Failed" , message: "Rental request couldn't be created successfully", error: err});
        });
});

router.patch('/extendContractDurationRequest/:contractId',async function (req, res) {
    var rentalRequestServiceInst = new RentalRequestService();
    req.userId = req.user.userId;
    req.publicKey = req.user.publicKey;
    const lms = await LMS.deployed();
    return rentalRequestServiceInst.extendContractDurationRequest(req.userId,  req.publicKey, req.params.contractId,  req.body.extensionDuration, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Extend Contract Duration Request successful"});
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed" , message: "extend Contract Duration Request request failed", error: err});
        });
});


router.patch('/extendContractDurationConfirm/:contractId',async function (req, res) {
    var rentalRequestServiceInst = new RentalRequestService();
    req.userId = req.user.userId;
    req.publicKey = req.user.publicKey;
    const lms = await LMS.deployed();
    return rentalRequestServiceInst.extendContractDurationConfirm(req.userId,  req.publicKey, req.params.contractId,  req.body.extensionDuration, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Extend Contract Duration Request confirmed"});
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed" , message: "extend Contract Duration Request request confirmation failed", error: err});
        });
});

module.exports = router;