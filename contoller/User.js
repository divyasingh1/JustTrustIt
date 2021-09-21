var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    _id:{
        type: String,
        require: true
    },
    emailId:{
        type: String
    },
    publicKey:{
        type: String,
        require: true,
        unique: true
    },
    userId:{
        type: String,
        required: true
    },
    userName:{
        type: String
    }
},
{
    timestamps: true
});

mongoose.model('user',UserSchema);

module.exports = mongoose.model('user');