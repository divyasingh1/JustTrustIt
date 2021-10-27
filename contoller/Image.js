var mongoose = require('mongoose');
var PropertySchema = new mongoose.Schema({
    _id:{
        type: String,
        require: true
    },
    imageId:{
        type: String,
        require: true
    },
    propertyId:{
        type: String,
        require: true
    },
    imageType : {
        type: String
    },
    imageBuffer:{
        type: Number
    }
},
{
    timestamps: true
});



   
mongoose.model('images',PropertySchema);

module.exports = mongoose.model('images');