var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var PropertyService = require('./PropertyService');
var RentalRequestService = require('./RentalRequestService');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


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