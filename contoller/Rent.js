var mongoose = require('mongoose');
var RentSchema = new mongoose.Schema({
    _id:{
        type: String,
        require: true
    },
    rentAmount:{
        type: Number,
        require: true
    },
    contractId:{
        type: String,
        require: true
    }
},
{
    timestamps: true
});

mongoose.model('rents',RentSchema);

module.exports = mongoose.model('rents');