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
    NFTTokenId: {
        type: Number,
        required: true
    },
    propertyName:{
        type: String
    },
    transactionHash:{
        type: String,
        required: true
    },
    initialAvailableDate:{
        type: String
    },
    propertyType:{
        type: String
    },
    location:{
        type: String
    },
    pincode:{
        type: Number
    },
    parking: {
        type: String
    },
    bathrooms: {
        type: String
    },
    rooms: {
        type: String
    },
    unitNumber : {
        type: String
    },
    securityDeposit:{
        type: Number
    },
    rentAmount:{
        type: Number
    },
    availability: {
        type: Boolean,
        default: true
    },
    ownerAddress: {
        type: String
    },
    KYC:{
        type: Boolean,
        default: true
    },
    active: {
        type:Boolean,
        default: true
    },
    rentToBePaid:{
        type: String
    }
},
{
    timestamps: true
});



   
mongoose.model('properties',PropertySchema);

module.exports = mongoose.model('properties');