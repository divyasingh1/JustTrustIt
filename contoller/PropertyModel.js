var Property = require('./Property');
var Promise = require('bluebird');
const { v4: uuidv4 } = require('uuid');

class PropertyModel {
    constructor() {
    }

    findProperty(filter) {
        return new Promise(function (resolve, reject) {
            Property.find(filter, function (err, property) {
                if (err) {
                    console.log("Error in finding property", err);
                    return reject("Error in finding property");
                }
                if (!property) {
                    console.log("property not found");
                    return reject("property not found");
                }
                return resolve(property)
            });
        });
    }

    createProperty(details) {
        details._id = uuidv4();
        details.propertyId = uuidv4();
        return new Promise(function (resolve, reject) {
            return Property.create(details, function (err, property) {
                if (err) {
                    console.log("Error in creating property", err)
                    return reject("Error in creating property");
                }
                return resolve(property)
            });
        });
    }

    updateProperty(propertyId, data){
        console.log(">>>>property update", propertyId, data)
        return new Promise ((resolve, reject)=>{
            Property.updateMany(
            {
                "propertyId": propertyId,
            },
            {
                "$set":
                    data
            }
         , (err, res)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(res)
                }
            })
        })
    }
}

module.exports = PropertyModel;