// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import {LibCommon} from "./LibCommon.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

library LibProperty {   
    
    enum PropertyType {
        Bus,                         //  0 Bus
        Van,                     //  1 Van
        Car,                     //  2 Car
        SUV,  //3 SUV
        Ambulance                         //  3 Ambulance
    }

    struct Property {
        string m_iPropertyId;
        string m_strAddress; 
        string m_objDateOfPosting;
        bool m_bIsActive;
        address[] m_arrTenantList;
    }
    
    enum AgreementStatus {
        Uninitialized,     // 0
        DepositPending,    // 1
        Active,            // 2
        Completed,         // 3
        Terminated         // 4
    }
    
    struct RentContract {
        AgreementStatus m_eAgreementStatus;
        address m_addrOwner;                          
        address m_addrTenant;
        uint256 m_iContractId;
        uint m_iRentAmount; 
        uint m_iSecurityDeposit;
        uint8 m_iDurationInMonths;   
        string m_strMoveInDate;      
        uint256 m_strDateOfCreation;
    }

}

contract TrustedProperty is ERC721{
    
    using Counters for Counters.Counter;
    Counters.Counter private gc_iTokenCounter;
    
    // uint public constant gc_iMintFee = 10;
    address public ADMIN;
    
    struct PropertyDetails{
        LibProperty.Property m_objProperty;
        LibProperty.PropertyType m_ePropertytype;
    }
    
    struct PropertyToRentLink{
        bool m_bExists;
        string m_strPropertyId;
    }
    
    mapping(string => PropertyDetails) private gc_mapProperties;
    mapping(string => LibCommon.Review[]) private gc_mapReviews;
    mapping(string => LibCommon.Document[]) private gc_mapMaintenenceDocuments;
    mapping (bytes32 => bool) private gc_mapPropertyHashes;
    mapping (string => uint256) private gc_mapPidToTokenId;
    mapping(string => LibProperty.RentContract) private gc_mapContracts;
    mapping(uint256 => PropertyToRentLink) private gc_mapContractsExists;
    
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
    
    modifier modContractShouldExist(uint256 contractId) {
        require(gc_mapContractsExists[contractId].m_bExists, "Contract Does Not Exist");
        _;
    }

    modifier modContractShouldNotExist(uint256 contractId) {
        require(!(gc_mapContractsExists[contractId].m_bExists), "Contract Already Exists");
        _;
    }

    
    event evtAddedProperty(address ownerAddress, bytes32 hash, string propertyId);
    event evtRemovedProperty(address ownerAddress, string propertyId);
    event evtContractAdded(uint256 contractId);
    event evtSecurityDeposited(string contractId, uint amount, uint trxn_fee);
    event evtRentPaid(string contractId, uint amount, uint trxn_fee);
    event evtContractTerminated(uint256 contractId);
    event evtDebug(bool val, bytes32 hash);
    event evtDebugPD(string m_strAddress, string m_objDateOfPosting, LibProperty.PropertyType m_ePropertytype);
    
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
    
    function vInitRentAgreement(uint256 contractId, string memory propertyId, address tenant, uint8 duration, string memory startDate, uint rent, uint deposit)
    public modOnlyOwnerCanAccess(propertyId) modContractShouldNotExist(contractId) {

        // require(rent > gc_iMintFee, "Rent must be more than the mint fee!");
        // require(deposit > gc_iMintFee, "Security deposit must be more than the mint fee!");

        gc_mapContracts[propertyId] = LibProperty.RentContract({
            m_iContractId: contractId,
            m_eAgreementStatus: LibProperty.AgreementStatus.DepositPending,
            m_addrOwner: msg.sender,
            m_addrTenant: tenant,
            m_iSecurityDeposit: deposit,
            m_iRentAmount: rent,
            m_iDurationInMonths: duration,
            m_strMoveInDate: startDate,
            m_strDateOfCreation: block.timestamp
        });
        
        gc_mapContractsExists[contractId].m_bExists = true;
        gc_mapContractsExists[contractId].m_strPropertyId = propertyId;
        emit evtContractAdded(contractId);
    }
    
    function objGetRentAgreement(uint256 contractId) public modContractShouldExist(contractId) view returns(LibProperty.RentContract memory){
        return gc_mapContracts[gc_mapContractsExists[contractId].m_strPropertyId];
    }
    
    function vBurnRentAgreement(uint256 contractId)
    public modAdminOwnerCanAccess() modContractShouldExist(contractId) {
        delete gc_mapContracts[gc_mapContractsExists[contractId].m_strPropertyId];
        delete gc_mapContractsExists[contractId];
        emit evtContractAdded(contractId);
    }
}