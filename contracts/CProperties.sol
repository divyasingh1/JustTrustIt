// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import {LibCommon} from "./LibCommon.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

library LibProperty {   
    
    enum PropertyType {
        House,                         //  0 House
        Apartment,                     //  1 Apartment
        Townhouse,                     //  2 Townhouse
        Villa,                         //  3 Villa
        RetirementLiving               //  4 Retirement living
    }

    struct Property {
        string m_iPropertyId;
        string m_strAddress; 
        string m_objDateOfPosting;
        bool m_bIsActive;
        address[] m_arrTenantList;
    }

}

contract TrustedProperty is ERC721{
    
    using Counters for Counters.Counter;
    Counters.Counter private gc_iTokenCounter;
    
    address public ADMIN;
    
    struct PropertyDetails{
        LibProperty.Property m_objProperty;
        LibProperty.PropertyType m_ePropertytype;
    }
    
    mapping(string => PropertyDetails) private gc_mapProperties;
    mapping(string => LibCommon.Review[]) private gc_mapReviews;
    mapping(string => LibCommon.Document[]) private gc_mapMaintenenceDocuments;
    mapping (bytes32 => bool) private gc_mapPropertyHashes;
    mapping (string => uint256) private gc_mapPidToTokenId;
    
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
        require(tenantFound, "Not the Tenant, Authorization failed.");
        _;
    }
    
    event evtDebug(bool val, bytes32 hash);
    event evtDebugPD(string m_strAddress, string m_objDateOfPosting, LibProperty.PropertyType m_ePropertytype);
    modifier modOnlyOwnerCanAccess(string memory propertyId) {
        require(ownerOf(gc_mapPidToTokenId[propertyId]) == msg.sender, "Not an Owner, Authorization failed.");
        _;
    }
    
    modifier modAdminOwnerCanAccess() {
        require(ADMIN == msg.sender, "Not an Admin, Authorization failed.");
        _;
    }

    modifier modPropertyShouldExist(string memory propertyId) {
        require(gc_mapPropertyHashes[bytGeneratePropertyHashByObject(gc_mapProperties[propertyId])], "Property does not exist");
        _;
    }
    
    modifier modFromShouldBeOwner(string memory propertyId, address from) {
        require(ownerOf(gc_mapPidToTokenId[propertyId]) == from, "Property Does not belong to #From address");
        _;
    }
    
    modifier modHashShouldBeUnique(string memory addr, int propertyType) {
        require(!gc_mapPropertyHashes[bytGeneratePropertyHash(addr, propertyType)], "Hash is not unique, Same Property exists with a different Token");
        _;
    }

    modifier modPropertyShouldNotExist(string memory propertyId) {
        require(gc_mapPropertyHashes[bytGeneratePropertyHashByObject(gc_mapProperties[propertyId])] == false, "Property already exists");
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
    
    event evtAddedProperty(address ownerAddress, bytes32 hash, string propertyId);
    event evtRemovedProperty(address ownerAddress, string propertyId);
    constructor(string memory name, string memory symbol) public ERC721(name, symbol){
        ADMIN = msg.sender;
    }
    
    function bytGeneratePropertyHashByObject(PropertyDetails memory propertyDetails) private pure returns (bytes32) {
        return keccak256(abi.encode(propertyDetails.m_objProperty.m_strAddress,
                                    propertyDetails.m_ePropertytype));
    }
    
    function bytGeneratePropertyHash(string memory addr, int propertyType) private pure returns (bytes32) {
        return keccak256(abi.encode(addr, propertyType));
    }
    
    function 
    vAddProperty(string memory propertyId, string memory addr, string memory dateOfPosting, bool isActive, int propertyType)
        modPropertyShouldNotExist(propertyId) modHashShouldBeUnique(addr, propertyType) public{
        uint256 index = gc_iTokenCounter.current();
        address[] memory tenantList;
        LibProperty.Property memory tempProperty = LibProperty.Property({m_iPropertyId:propertyId, 
                                                                        m_strAddress:addr, 
                                                                        m_objDateOfPosting:dateOfPosting, 
                                                                        m_bIsActive:isActive,
                                                                        m_arrTenantList:tenantList
        });
        
        PropertyDetails memory propertyDetails = PropertyDetails(tempProperty, LibProperty.PropertyType(propertyType));
        gc_mapProperties[propertyId] = propertyDetails;
        gc_mapPidToTokenId[propertyId] = index;
        _mint(msg.sender, index);
        bytes32 hash = bytGeneratePropertyHashByObject(propertyDetails);
        gc_mapPropertyHashes[hash] = true;
        gc_iTokenCounter.increment();
    }
    
    function bTransferFrom(string memory propertyId, address from, address to) modAdminOwnerCanAccess() modFromShouldBeOwner(propertyId, from) public returns(bool){
        safeTransferFrom(from, to, gc_mapPidToTokenId[propertyId]);
        return true;
    }
    
    function vOwnerOf(string memory propertyId) public returns(address) {
        ownerOf(gc_mapPidToTokenId[propertyId]);
    }
    
    function objGetProperty(string memory propertyId) public view modPropertyShouldExist(propertyId) returns (PropertyDetails memory) {
        return gc_mapProperties[propertyId];
    }
    
    function objGetNFTToken(string memory propertyId) public view modPropertyShouldExist(propertyId) returns (uint256) {
        return gc_mapPidToTokenId[propertyId];
    }
    
    function vAddReviews( string memory propertyId, int rating, string memory comment)
    public  modPropertyShouldExist(propertyId) modOnlyTenantCanAccess(propertyId) returns (bool) {
        if(!LibCommon.bIsValidRating(rating)){
            return false;
        }
        gc_mapReviews[propertyId].push(LibCommon.Review(rating, comment));
        return true;
    }
    
    function vAddMaintenenceDocuments(string memory propertyId, string memory desc, bytes memory hash)
    public  modPropertyShouldExist(propertyId) modOnlyOwnerCanAccess(propertyId) returns (bool) {
        gc_mapMaintenenceDocuments[propertyId].push(LibCommon.Document(msg.sender, desc, hash));
        return true;
    }
}