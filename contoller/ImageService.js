var PropertyModel = require('./PropertyModel');
const ImageModel = require('./ImageModel');
const { v4: uuidv4 } = require('uuid');
var fs = require("fs");

class ImageService {
    constructor() {
    }


    covertImageToBuffer(imageFile) {
        console.log("imageFile", imageFile)
        return new Promise(async (resolve, reject) => {
            fs.readFile(imageFile, function (err, data) {
                if (err) reject(err);
                // Encode to base64
                var encodedImage = new Buffer(data, 'binary').toString('base64');
                return resolve(encodedImage);
            })

        });
    }

    convertBufferToImage(buffer) {
        return new Promise(async (resolve, reject) => {
            // Decode from base64
            if (err) reject(err);
            var decodedImage = new Buffer(buffer, 'base64').toString('binary');
            return resolve(decodedImage);
        });
    }

    saveImage(propertyId, details={}) {
        details.imageId = uuidv4();
        details.propertyId = propertyId;
        return new Promise(async (resolve, reject) => {
            if (details) {

                var propertyModelInst = new PropertyModel();
                let property = await propertyModelInst.findProperty({ propertyId });
                if (!property || !property.length) {
                    return reject("Property not found");
                }
                let imageModelInst = new ImageModel();
                details._id = uuidv4();
                return resolve(imageModelInst.saveImage(details));
            } else {
                return reject("wrong input")
            }
        })
    }

    findImage(filter) {
        let dbFilter = {};
        if (filter.imageId) {
            dbFilter.imageId = filter.imageId;
        }
        if (filter.propertyId) {
            dbFilter.propertyId = filter.propertyId;
        }
        var imageModelInst = new ImageModel();
        return imageModelInst.findImage(dbFilter);
    }



    updateImage(id, data) {
        var imageModelInst = new ImageModel();
        return imageModelInst.updateImage(id, data);
    }
}


module.exports = ImageService;
