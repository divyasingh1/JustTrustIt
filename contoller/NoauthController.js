var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var PropertyService = require('./PropertyService');
var RentalRequestService = require('./RentalRequestService');

var fs = require('fs');
var path = require("path")
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


const Web3 = require('web3');

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