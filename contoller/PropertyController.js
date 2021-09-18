var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var PropertyService = require('./PropertyService');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const Web3 = require('web3');
const contract = require('truffle-contract');
const artifacts = require('../build/TrustedPropertiesBasicContract.json');
if (typeof web3 !== 'undefined') {
    var web3 = new Web3(web3.currentProvider)
  } else {
    var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
}
const LMS = contract(artifacts)
LMS.setProvider(web3.currentProvider)

router.patch('/:propertyId', function (req, res) {
    var propertyServiceInst = new PropertyService();
    return propertyServiceInst.updateProperty(req.params.propertyId, req.body)
        .then((data) => {
            res.send({ "status": "SUCCESS",  message: "Property updated successfully" });
        })
        .catch((err) => {
            res.status(400).send({ status: "Failed" ,  message: "Property Couldn't be updated successfully", error: err});
        });
});

router.post('/', function (req, res) {
    var propertyServiceInst = new PropertyService();
    req.userId = req.user.userId;
    return propertyServiceInst.createProperty(req.userId, req.body)
        .then((data) => {
            res.send({ "status": "SUCCESS" , message: "Property Created Successfully", data});
        })
        .catch((err) => {
            console.log("Error in create Property", err);
            res.status(400).send({ status: "Failed",  message: "Property Couldn't be fetched successfully", error: err });
        });
});

    router.post('/depositSecurity/:contractId', async function (req, res) {
        var propertyServiceInst = new PropertyService();
        req.userId = req.user.userId;
        let { contractId } = req.params;
        const accounts = await web3.eth.getAccounts();
        const lms = await LMS.deployed();
        return propertyServiceInst.depositSecurity(req.userId, contractId, lms)
        .then((data, data2) => {
            console.log("data", data, typeof data)
            if(data == "Security already deposited"){
               res.status(400).send({ status: "Failed",  message: data, error: err });
            }
            res.send({ "status": "SUCCESS" , message: "rent deposited Successfully", data});
        })
        .catch((err) => {
            console.log("Error in deposit rent====================", err);
            res.status(400).send({ status: "Failed",  message: "deposit security failed", error: err });
        });
    })

    router.post('/payrent/:contractId', async function (req, res) {
        var propertyServiceInst = new PropertyService();
        req.userId = req.user.userId;

        let { contractId } = req.params;
        const accounts = await web3.eth.getAccounts();
        const lms = await LMS.deployed();
        return propertyServiceInst.payrent(req.userId, contractId, lms)
        .then((data) => {
            console.log("data", data, typeof data)
            res.send({ "status": "SUCCESS" , message: "rent paid Successfully", data});
        })
        .catch((err) => {
            console.log("Error in deposit rent====================", err);
            res.status(400).send({ status: "Failed",  message: "pay rent failed", error: err });
        });

    });

module.exports = router;