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
    }
},
{
    timestamps: true
});



   
mongoose.model('properties',PropertySchema);

module.exports = mongoose.model('properties');