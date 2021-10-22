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
    },
    contractId:{
        type: Number,
        require: true
    },
    tenantAddress:{
        type: String,
        require: true
    },
    securityDeposit:{
        type: Number,
        require: true
    },
    rentAmount:{
        type: Number,
        require: true
    }, 
    duration:{
        type: Number,
        require: true
    }, 
    startDate:{
        type: String,
        require: true
    },
    fromAddress:{
        type: String,
        require: true
    }
},
{
    timestamps: true
});

mongoose.model('rentalrequests',RentalRequestSchema);

module.exports = mongoose.model('rentalrequests');