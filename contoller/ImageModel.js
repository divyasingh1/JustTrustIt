var Image = require('./Image');
var Promise = require('bluebird');

class ImageModel {
    constructor() {
    }

    findImage(filter) {
        return new Promise(function (resolve, reject) {
            Image.find(filter, function (err, Image) {
                if (err) {
                    console.log("Error in finding Image", err);
                    return reject("Error in finding Image");
                }
                if (!Image) {
                    console.log("Image not found");
                    return reject("Image not found");
                }
                return resolve(Image)
            });
        });
    }

    saveImage(details) {
        return new Promise(function (resolve, reject) {
            return Image.create(details, function (err, Image) {
                if (err) {
                    console.log("Error in creating Image", err)
                    return reject("Error in creating Image");
                }
                return resolve(Image)
            });
        });
    }

    // update(propertyId, data){
    //     console.log(">>>>property update", propertyId, data)
    //     return new Promise ((resolve, reject)=>{
    //         Property.updateMany(
    //         {
    //             "propertyId": propertyId,
    //         },
    //         {
    //             "$set":
    //                 data
    //         }
    //      , (err, res)=>{
    //             if(err){
    //                 reject(err)
    //             }else{
    //                 resolve(res)
    //             }
    //         })
    //     })
    // }
}

module.exports = ImageModel;