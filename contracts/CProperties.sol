// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import {LibCommon} from "./LibCommon.sol";

library LibProperty {   
    
    enum PropertyType {
        House,                         //  0 House
        Apartment,                     //  1 Apartment
        Townhouse,                     //  2 Townhouse
        Villa,                         //  3 Villa
        RetirementLiving               //  4 Retirement living
    }

    struct Property {
        string m_strPropertyId;
        string m_strAddress; 
        string m_objDateOfPosting;
        bool m_bIsActive;
        address m_addrOwner;
        address[] m_arrTenantList;
    }

}

contract TrustedProperty {
    struct PropertyDetails{
        LibProperty.Property m_objProperty;
        LibProperty.PropertyType m_ePropertytype;
    }
    
    mapping(string => PropertyDetails) private gc_mapProperties;
    mapping(string => LibCommon.Review[]) private gc_mapReviews;
    mapping(string => LibCommon.Document[]) private gc_mapMaintenenceDocuments;
    mapping (bytes32 => string) private gc_mapPropertyHashes;
    
    uint32 public gc_iPropertyCount = 0;
    uint32 public gc_iActivePropertyCount = 0;
    
    modifier modOnlyTenantCanAccess(string memory propertyId) {
        bool tenantFound = false;
        uint i;
        uint len = gc_mapProperties[propertyId].m_objProperty.m_arrTenantList.length;
        for (i = 0; i < len; i++) { 
            if(gc_mapProperties[propertyId].m_objProperty.m_arrTenantList[i] == msg.sender){
                tenantFound = true;
                break;
            } 
        }
        require(tenantFound, "Not the Owner, Authorization failed.");
        _;
    }
    
    modifier modOnlyOwnerCanAccess(string memory propertyId) {
        require(gc_mapProperties[propertyId].m_objProperty.m_addrOwner == msg.sender, "Not an Existing or Previous Tenant, Authorization failed.");
        _;
    }

    modifier modPropertyShouldExist(string memory propertyId) {
        require(keccak256(bytes(gc_mapProperties[propertyId].m_objProperty.m_strPropertyId)) == keccak256(bytes(propertyId)), "Property does not exist");
        _;
    }

    modifier modPropertyShouldNotExist(string memory propertyId) {
        require(!(keccak256(bytes(gc_mapProperties[propertyId].m_objProperty.m_strPropertyId)) == keccak256(bytes(propertyId))), "Property already exists");
        _;
    }

    modifier modPropertyShouldBeActive(string memory propertyId) {
        require(gc_mapProperties[propertyId].m_objProperty.m_bIsActive, "Property Active");
        _;
    }

    modifier modPropertyShouldNotBeActive(string memory propertyId) {
        require(!gc_mapProperties[propertyId].m_objProperty.m_bIsActive, "Property InActive");
        _;
    }
    
    event evtAddedProperty(address ownerAddress, string propertyId);
    event evtRemovedProperty(address ownerAddress, string propertyId);
    
    
    function bytGeneratePropertyHash(PropertyDetails memory propertyDetails) private pure returns (bytes32) {
        return keccak256(abi.encode(propertyDetails.m_objProperty.m_strPropertyId,
                                    propertyDetails.m_objProperty.m_strAddress,
                                    propertyDetails.m_objProperty.m_objDateOfPosting,
                                    propertyDetails.m_ePropertytype));
    }
    
    function 
    vAddProperty(string memory propertyId, string memory addr, string memory dateOfPosting, bool isActive, address tenant, int propertyType)
        modPropertyShouldNotExist(propertyId) public {
        
        address[] memory tenantList;
        LibProperty.Property memory tempProperty = LibProperty.Property({m_strPropertyId:propertyId, 
                                                                        m_strAddress:addr, 
                                                                        m_objDateOfPosting:dateOfPosting, 
                                                                        m_bIsActive:isActive,
                                                                        m_addrOwner:msg.sender,
                                                                        m_arrTenantList:tenantList
        });
        PropertyDetails memory propertyDetails = PropertyDetails(tempProperty, LibProperty.PropertyType(propertyType));
        gc_mapProperties[propertyId] = propertyDetails;
        gc_mapProperties[propertyId].m_objProperty.m_arrTenantList.push(tenant);
        gc_mapPropertyHashes[bytGeneratePropertyHash(propertyDetails)] = propertyId;
        gc_iPropertyCount++;
        gc_iActivePropertyCount++;
        
        emit evtAddedProperty(msg.sender, propertyId);
    }
    
    function objGetProperty(string memory propertyId) public view modPropertyShouldExist(propertyId) returns (PropertyDetails memory) {
        return gc_mapProperties[propertyId];
    }
    
    function vAddReviews ( string memory propertyId, int rating, string memory comment)
    public  modPropertyShouldExist(propertyId) modOnlyTenantCanAccess(propertyId) returns (bool) {
        if(!LibCommon.bIsValidRating(rating)){
            return false;
        }
        gc_mapReviews[propertyId].push(LibCommon.Review(rating, comment));
        return true;
    }
    
    function vAddMaintenenceDocuments (string memory propertyId, string memory desc, bytes memory hash)
    public  modPropertyShouldExist(propertyId) modOnlyOwnerCanAccess(propertyId) returns (bool) {
        gc_mapMaintenenceDocuments[propertyId].push(LibCommon.Document(msg.sender, desc, hash));
        return true;
    }

    function bDeactivateProperty(string memory propertyId) public modPropertyShouldBeActive(propertyId) modOnlyOwnerCanAccess(propertyId) returns (bool) {
        gc_mapProperties[propertyId].m_objProperty.m_bIsActive = false;
        gc_iActivePropertyCount--;
        return true;
    }

    function bActivateProperty(string memory propertyId) public modPropertyShouldExist(propertyId) modPropertyShouldNotBeActive(propertyId) modOnlyOwnerCanAccess(propertyId) returns (bool) {
        gc_mapProperties[propertyId].m_objProperty.m_bIsActive = true;
        gc_iActivePropertyCount++;
        return true;
    }
}