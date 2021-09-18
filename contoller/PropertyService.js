const { db } = require('./Property');
var PropertyModel = require('./PropertyModel');

class PropertyService {
    constructor() {
    }

    createProperty(userId,details) {
        details.userId = userId;
        var propertyModelInst = new PropertyModel();
        return propertyModelInst.createProperty(details);
    }
    
    findProperty(filter){
        let dbFilter = {};
        if(filter.propertyId){
            dbFilter.propertyId = filter.propertyId;
        }
        if(filter.userId){
            dbFilter.userId =  filter.userId;
        }
        if(filter.pincode){
            dbFilter.pincode =  filter.pincode;
        }
        if(filter.tenantUserId){
            dbFilter.tenantUserId = tenantUserId;
        }
        var propertyModelInst = new PropertyModel();
        return propertyModelInst.findProperty(dbFilter);
    }
    

    updateProperty(id, data){
        var propertyModelInst = new PropertyModel();
        return propertyModelInst.updateProperty(id, data);
    }
}


module.exports = PropertyService;
