var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var PropertyService = require('./PropertyService');
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


router.get('/property/list', function (req, res) {
    var propertyServiceInst = new PropertyService();
    return propertyServiceInst.findProperty(req.query)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Property Fetched Successfully", data: data });
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed" , message: "Property Couldn't be fetched successfully", error: err});
        });
});

router.get('/property/:propertyId/:address',async function (req, res) {
    var propertyServiceInst = new PropertyService();
    const lms = await LMS.deployed();
    return propertyServiceInst.getPropertyById(req.params.propertyId, req.params.address, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Property Fetched Successfully", data: data });
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed" , message: "Property Couldn't be fetched successfully", error: err});
        });
});

router.get('/property/isPropertyAvailable/:propertyId/:address',async function (req, res) {
    var propertyServiceInst = new PropertyService();
    const lms = await LMS.deployed();
    return propertyServiceInst.isPropertyAvailable(req.params.propertyId, req.params.address, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Property Fetched Successfully", data: data });
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed" , message: "Property Couldn't be fetched successfully", error: err});
        });
});

router.get('/rental_request/list', function (req, res) {
    var rentalRequestServiceInst = new RentalRequestService();
    return rentalRequestServiceInst.findRentalRequest(req.query)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Rental requests Fetched Successfully", data: data });
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed" , message: "rental requests Couldn't be fetched successfully", error: err});
        });
});

module.exports = router;