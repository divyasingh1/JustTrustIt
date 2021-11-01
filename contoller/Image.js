var mongoose = require('mongoose');
var PropertySchema = new mongoose.Schema({
    _id: {
        type: String,
        require: true
    },
    imageId: {
        type: String,
        require: true
    },
    propertyId: {
        type: String,
        require: true
    },
    fieldname: {
        type: String
    },
    originalname: {
        type: String
    },
    encoding: {
        type: String
    },
    mimetype: {
        type: String
    },
    destination: {
        type: String
    },
    filename: {
        type: String
    },
    path: {
        type: String
    },
    size: {
        type: Number
    }
},
    {
        timestamps: true
    });




mongoose.model('images', PropertySchema);

module.exports = mongoose.model('images');