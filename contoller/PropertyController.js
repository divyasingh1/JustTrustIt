var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var PropertyService = require('./PropertyService');

var fs = require('fs');
var path = require("path")
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


const Web3 = require('web3');

let config = {
    "url": process.env.RPC_URL,

    "header": [

        {

            "name": "Authorization",

            "value": process.env.PROJECT_SECRET

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


//working
router.patch('/:propertyId', function (req, res) {
    var propertyServiceInst = new PropertyService();
    return propertyServiceInst.updateProperty(req.params.propertyId, req.body)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Property updated successfully" });
        })
        .catch((err) => {
            res.status(400).send({ status: "Failed", message: "Property Couldn't be updated successfully", error: err });
        });
});


//working
router.post('/changeStatus/:status/:propertyId', async function (req, res) {
    var propertyServiceInst = new PropertyService();
    return propertyServiceInst.changeStatus(req.params.propertyId, req.params.status, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Property " + req.params.status + "d" + " successfully" });
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed", message: "Property Couldn't be " + req.params.status + "d" + " successfully", error: err });
        });
});


router.post('/changeRent/:propertyId', async function (req, res) {
    var propertyServiceInst = new PropertyService();
    let { propertyId } = req.params;
    return propertyServiceInst.changeRent(propertyId, req.body, req.user.publicKey)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Rent changes Successfully" });
        })
        .catch((err) => {
            res.status(400).send({ status: "Failed", message: "Rent change failed", error: err });
        });

});
// working
router.post('/payrent/:contractId', async function (req, res) {
    var propertyServiceInst = new PropertyService();

    let { contractId } = req.params;
;
    return propertyServiceInst.payrent(contractId, req.body.txHash, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Rent paid Successfully" });
        })
        .catch((err) => {
            res.status(400).send({ status: "Failed", message: "Rent payment failed", error: err });
        });

});

router.post('/payPerMonthRent/:propertyId', async function (req, res) {
    var propertyServiceInst = new PropertyService();
    let { propertyId } = req.params;
    return propertyServiceInst.payPerMonthRent(propertyId, req.body.txHash)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Rent paid Successfully" });
        })
        .catch((err) => {
            res.status(400).send({ status: "Failed", message: "Rent payment failed", error: err });
        });

});


router.get('/getNFTOwner/:propertyId', async function (req, res) {
    var propertyServiceInst = new PropertyService();
    req.userId = req.user.userId;

    let { propertyId } = req.params;
 
    return propertyServiceInst.vOwnerOf(propertyId, req.user.publicKey, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Got Contract Details Successfully", data });
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed", message: "Contract Details fetching error", error: err });
        });
})

//working
router.post('/', async function (req, res) {
    var propertyServiceInst = new PropertyService();
    req.userId = req.user.userId;
    req.publicKey = req.user.publicKey;
  
    return propertyServiceInst.createProperty(req.userId, req.body, lms, req.publicKey)
        .then((data) => {
            console.log("Property created successfully")
            res.send({ "status": "SUCCESS", message: "Property Created Successfully", data });
        })
        .catch((err) => {
            console.log("Error in create Property", err);
            res.status(400).send({ status: "Failed", message: "Property Couldn't be created successfully", error: err });
        });
});

//working
router.post('/depositSecurity/:contractId', async function (req, res) {
    var propertyServiceInst = new PropertyService();
    req.userId = req.user.userId;
    let { contractId } = req.params;

    return propertyServiceInst.depositSecurity(req.userId, contractId, lms)
        .then((data, data2) => {
            res.send({ "status": "SUCCESS", message: "Security deposited Successfully" });
        })
        .catch((err) => {
            res.status(400).send({ status: "Failed", message: "deposit security failed", error: err });
        });
})

//need mapping 
router.get('/getContractDetails/:contractId', async function (req, res) {
    var propertyServiceInst = new PropertyService();
    req.userId = req.user.userId;

    let { contractId } = req.params;
   
    return propertyServiceInst.getContractDetails(req.userId, contractId, req.user.publicKey, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Got Contract Details Successfully", data });
        })
        .catch((err) => {
            res.status(404).send({ status: "Not Found", message: "Contract Details not found", error: err });
        });
})

//working
router.post('/withdrawFunds', async function (req, res) {
    var propertyServiceInst = new PropertyService();
  
    return propertyServiceInst.withdrawFunds(req.user.publicKey, lms)
        .then((data) => {
            res.send({ "status": "SUCCESS", message: "Funds withdrawn successfully" });
        })
        .catch((err) => {
            res.status(500).send({ status: "Failed", message: "Error in withdraw funds", error: err });
        });
});



module.exports = router;