var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var PropertyService = require('./PropertyService');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


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


module.exports = router;