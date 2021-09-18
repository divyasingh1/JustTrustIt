var mongoose = require('mongoose');
var PropertySchema = new mongoose.Schema({
    _id:{
        type: String,
        require: true
    },
    propertyId:{
        type: String,
        require: true
    },
    tenantUserId:{
        type: String
    },
    userId:{
        type: String,
        required: true
    },
    propertyName:{
        type: String
    },
    houseNo:{
        type: Number
    },
    flatNo:{
        type: Number
    },
    street:{
        type: String
    },
    address:{
        type: String
    },
    pincode:{
        type: Number
    },
    floor:{
        type: Number
    },
    KYC: {
        type: String
    },
    latitude: {
        type: String
    },
    longitude: {
        type: String
    },
    rentPerMonth: {
        type: Number
    },
    securityDepositAmount: {
        type: Number
    },
    availability: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

mongoose.model('properties',PropertySchema);

module.exports = mongoose.model('properties');