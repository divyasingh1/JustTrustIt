var mongoose = require('mongoose');
var RentalRequestSchema = new mongoose.Schema({
    _id:{
        type: String,
        require: true
    },
    tenantUserId:{
        type: String,
        require: true
    },
    ownerUserId : {
        type: String,
        require: true
    },
    rentalRequestId:{
        type: String,
        require: true
    },
    propertyId:{
        type: String,
        require: true,
    },
    requestApprovalDone:{
        type: String,
        require: true,
        default: false
    }
},
{
    timestamps: true
});

mongoose.model('rentalrequests',RentalRequestSchema);

module.exports = mongoose.model('rentalrequests');