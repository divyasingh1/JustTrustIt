var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var RentalRequestService = require('./RentalRequestService');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const Web3 = require('web3');
var fs = require('fs');
var path = require("path")
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

let config = {
    "url": "https://dltestnet.dltlabs.com/api/3.3/",

    "header": [

        {

            "name": "Authorization",

            "value": "71bade62-f12f-47c2-af8b-28cfdb6d4844"

        }

    ]
}

let web3 = new Web3(new Web3.providers.HttpProvider(config.url,
    {
        headers: config.header
    }
));


var parsed= JSON.parse(fs.readFileSync(path.join(__dirname,"../build/contract/TrustedProperty.json")));
var abi = parsed.contracts['TrustedProperty.sol'].TrustedProperty.abi;
const lms = new web3.eth.Contract(abi, process.env.CONTRACT_ADDRERSS);

web3.eth.getBlockNumber().then((result) => {
    console.log("Latest Ethereum Block is ", result);
});

router.patch('/:rentalRequestId',async function (req, res) {
    var rentalRequestServiceInst = new RentalRequestService();
    req.userId = req.user.userId;
    req.publicKey = req.user.publicKey;
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

router.post('/burnRentAgreement/:contractId',async function (req, res) {
    var rentalRequestServiceInst = new RentalRequestService();
    req.userId = req.user.userId;
    return rentalRequestServiceInst.vBurnRentAgreement(req.params.contractId,lms, req.user.publicKey)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Rental request burned successfully",data});
        })
        .catch((err) => {
            res.status(400).send({ status: "Failed" , message: "Rental request couldn't be burnt successfully", error: err});
        });
});

router.patch('/extendContractDurationRequest/:contractId',async function (req, res) {
    var rentalRequestServiceInst = new RentalRequestService();
    req.userId = req.user.userId;
    req.publicKey = req.user.publicKey;
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
    return rentalRequestServiceInst.extendContractDurationConfirm(req.userId,  req.publicKey, req.params.contractId,  req.body.extensionDuration, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Extend Contract Duration Request confirmed"});
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed" , message: "extend Contract Duration Request request confirmation failed", error: err});
        });
});

router.get('/getPendingFunds', async function (req, res) {
    var rentalRequestServiceInst = new RentalRequestService();
    req.userId = req.user.userId;
    req.publicKey = req.user.publicKey;
    return rentalRequestServiceInst.getPendingFunds(req.userId, req.user.publicKey, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Got pending funds", data });
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed", message: "Get pending funds failed", error: err });
        });
})

router.get('/list', async function (req, res) {
    var rentalRequestServiceInst = new RentalRequestService();
    req.userId = req.user.userId;
    req.publicKey = req.user.publicKey;
    return rentalRequestServiceInst.findPropertyJoin(req.userId)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Got rental requests are their properties", data });
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed", message: "FAILED", error: err });
        });
})
    

module.exports = router;