var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var PropertyService = require('./PropertyService');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const Web3 = require('web3');
const contract = require('truffle-contract');
const artifacts = require('../build/TrustedProperty.json');
if (typeof web3 !== 'undefined') {
    var web3 = new Web3(web3.currentProvider)
  } else {
    var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
}
const LMS = contract(artifacts)
LMS.setProvider(web3.currentProvider)

//working
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


//working
router.post('/changeStatus/:status/:propertyId', async function (req, res) {
    var propertyServiceInst = new PropertyService();
    const lms = await LMS.deployed();
    return propertyServiceInst.changeStatus(req.params.propertyId, req.user.publicKey, req.params.status, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS",  message: "Property " + req.params.status+ "d" + " successfully" });
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed" ,  message: "Property Couldn't be " + req.params.status+ "d" + " successfully", error: err});
        });
});


//not working
 router.post('/payrent/:contractId', async function (req, res) {
        var propertyServiceInst = new PropertyService();

        let { contractId } = req.params;
        const lms = await LMS.deployed();
        return propertyServiceInst.payrent(req.body.NFTTokenId, contractId, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS" , message: "Rent paid Successfully"});
        })
        .catch((err) => {
            res.status(400).send({ status: "Failed",  message: "Rent payment failed", error: err });
        });

    });


router.get('/getNFTOwner/:propertyId', async function (req, res) {
    var propertyServiceInst = new PropertyService();
    req.userId = req.user.userId;

    let { propertyId} = req.params;
    const lms = await LMS.deployed();
    return propertyServiceInst.vOwnerOf( propertyId, req.user.publicKey, lms)
    .then((data) => {
        res.send({ "status": "SUCCESS" , message: "Got Contract Details Successfully", data});
    })
    .catch((err) => {
        res.status(500).send({ status: "Failed",  message: "Contract Details fetching error", error: err });
    });
})

    //working
router.post('/', async function (req, res) {
    var propertyServiceInst = new PropertyService();
    req.userId = req.user.userId;
    req.publicKey = req.user.publicKey;
    const lms = await LMS.deployed();
    return propertyServiceInst.createProperty(req.userId, req.body, lms, req.publicKey)
        .then((data) => {
            console.log("Property created successfully")
            res.send({ "status": "SUCCESS" , message: "Property Created Successfully", data});
        })
        .catch((err) => {
            console.log("Error in create Property", err);
            res.status(400).send({ status: "Failed",  message: "Property Couldn't be created successfully", error: err });
        });
});

//working
    router.post('/depositSecurity/:contractId', async function (req, res) {
        var propertyServiceInst = new PropertyService();
        req.userId = req.user.userId;
        let { contractId } = req.params;
        const lms = await LMS.deployed();
        return propertyServiceInst.depositSecurity(req.userId, contractId, lms)
        .then((data, data2) => {
            res.send({ "status": "SUCCESS" , message: "Security deposited Successfully"});
        })
        .catch((err) => {
            res.status(400).send({ status: "Failed",  message: "deposit security failed", error: err });
        });
    })

//need mapping 
router.get('/getContractDetails/:contractId', async function (req, res) {
    var propertyServiceInst = new PropertyService();
    req.userId = req.user.userId;

    let { contractId} = req.params;
    const lms = await LMS.deployed();
    return propertyServiceInst.getContractDetails(req.userId, contractId, req.user.publicKey, lms)
    .then((data) => {
        res.send({ "status": "SUCCESS" , message: "Got Contract Details Successfully", data});
    })
    .catch((err) => {
        res.status(500).send({ status: "Failed",  message: "Contract Details fetching error", error: err });
    });
})

//working
router.post('/withdrawFunds', async function (req, res) {
    var propertyServiceInst = new PropertyService();
    const lms = await LMS.deployed();
    return propertyServiceInst.withdrawFunds(req.user.publicKey, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS",  message: "Funds withdrawn successfully" });
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed" ,  message: "Error in withdraw funds", error: err});
        });
});

module.exports = router;