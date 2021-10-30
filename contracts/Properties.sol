// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import {LibCommon, LibProperty} from "./Libs.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract TrustedProperty is ERC721{
    
    using Counters for Counters.Counter;
    Counters.Counter private gc_iTokenCounter;
    
    uint public constant gc_iMintFee = 10;
    address public ADMIN;
    
    struct PropertyDetails{
        LibProperty.Property m_objProperty;
        LibProperty.PropertyType m_ePropertytype;
    }
    
    mapping(string => PropertyDetails) private gc_mapProperties;
    mapping(string => LibCommon.Review[]) private gc_mapReviews;
    mapping(string => LibCommon.Document[]) private gc_mapMaintenenceDocuments;
    mapping(string => bool) private gc_mapPropertyExists;
    mapping(string => uint256) private gc_mapPidToTokenId;
    mapping(string => LibProperty.RentContract) private gc_mapContracts;
    mapping(uint256 => LibProperty.PaymentReceipts) private gc_mapRentAgreementToReceipts;
    
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
        require(gc_mapPropertyExists[propertyId], "Property does not exist");
        _;
    }
    
    modifier modFromShouldBeOwner(string memory propertyId, address from) {
        require(ownerOf(gc_mapPidToTokenId[propertyId]) == from, "Property Does not belong to #From address");
        _;
    }

    modifier modPropertyShouldNotExist(string memory propertyId) {
        require(!(gc_mapPropertyExists[propertyId]), "Property already exists");
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

    modifier modPropertyShouldNotBeRentedWithContracted(string memory propertyId) {
        require(!(gc_mapContracts[propertyId].m_bExists), "Property is already rented under an existing contract");
        _;
    }
    
    modifier modPropertyShouldBeRentedWithContracted(string memory propertyId) {
        require(gc_mapContracts[propertyId].m_bExists, "Property is not rented under an existing contract");
        _;
    }
    
    event evtAddedProperty(address ownerAddress, bytes32 hash, string propertyId);
    event evtContractAdded(uint256 contractId);
    event evtSecurityDeposited(uint256 contractId, uint amount, string trxnId);
    event evtRentPaid(uint256 contractId, uint amount, string trxnId);
    event evtContractTerminated(uint256 contractId);
    
    constructor(string memory name, string memory symbol) public ERC721(name, symbol){
        ADMIN = msg.sender;
    }
    
    function 
    vAddProperty(string memory propertyId, string memory addr, string memory dateOfPosting, bool isActive, LibProperty.PropertyType propertyType)
        modPropertyShouldNotExist(propertyId) public{
        uint256 index = gc_iTokenCounter.current();
        address[] memory tenantList;
        LibProperty.Property memory tempProperty = LibProperty.Property({m_strAddress:addr, 
                                                                        m_objDateOfPosting:dateOfPosting, 
                                                                        m_bIsActive:isActive,
                                                                        m_arrTenantList:tenantList
        });
        
        PropertyDetails memory propertyDetails = PropertyDetails(tempProperty, LibProperty.PropertyType(propertyType));
        gc_mapProperties[propertyId] = propertyDetails;
        gc_mapPidToTokenId[propertyId] = index;
        
        _mint(msg.sender, index);
        gc_mapPropertyExists[propertyId] = true;
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
        gc_mapMaintenenceDocuments[propertyId].push(LibCommon.Document(desc, hash));
        return true;
    }
    
    function vInitRentAgreement(uint256 contractId, string memory propertyId, address tenant, uint8 duration, string memory startDate, uint rent, uint deposit,  string memory securityDepositTxId, string memory rentTxId)
    public modOnlyOwnerCanAccess(propertyId) modPropertyShouldNotBeRentedWithContracted(propertyId) {

        require(rent > gc_iMintFee, "Rent must be more than the mint fee!");
        require(deposit > gc_iMintFee, "Security deposit must be more than the mint fee!");
        
        gc_mapContracts[propertyId] = LibProperty.RentContract({
            m_iContractId: contractId,
            m_eAgreementStatus: LibProperty.AgreementStatus.DepositPending,
            m_addrOwner: msg.sender,
            m_addrTenant: tenant,
            m_iSecurityDeposit: deposit,
            m_iRentAmount: rent,
            m_iDurationInMonths: duration,
            m_strMoveInDate: startDate,
            m_strDateOfCreation: block.timestamp,
            m_bExists: true
        });
        gc_mapProperties[propertyId].m_objProperty.m_arrTenantList.push(tenant);
        string[] memory rentTxIds;
        LibProperty.PaymentReceipts memory tempReceipts = LibProperty.PaymentReceipts({m_strSecurityDepositTxId: securityDepositTxId,
                                                                                   m_arrMonthlyRenttxIds: rentTxIds});
        gc_mapRentAgreementToReceipts[contractId] = tempReceipts;
        gc_mapRentAgreementToReceipts[contractId].m_arrMonthlyRenttxIds.push(rentTxId);
        emit evtSecurityDeposited(contractId, deposit, securityDepositTxId);
        emit evtRentPaid(contractId, rent, rentTxId);
        emit evtContractAdded(contractId);
    }
    
    function objGetRentAgreement(string memory propertyId) public modPropertyShouldBeRentedWithContracted(propertyId) view returns(LibProperty.RentContract memory){
        return gc_mapContracts[propertyId];
    }
    
    function vAddRentTxId(string memory propertyId, string memory rentTxId) public modAdminOwnerCanAccess() modPropertyShouldBeRentedWithContracted(propertyId) {
        gc_mapRentAgreementToReceipts[gc_mapContracts[propertyId].m_iContractId].m_arrMonthlyRenttxIds.push(rentTxId);
        emit evtRentPaid(gc_mapContracts[propertyId].m_iContractId, gc_mapContracts[propertyId].m_iRentAmount, rentTxId);
    }
    
    function objGetPaymentReceipts(string memory propertyId) public view modAdminOwnerCanAccess() returns(LibProperty.PaymentReceipts memory){
        return gc_mapRentAgreementToReceipts[gc_mapContracts[propertyId].m_iContractId];
    }
    
    function vBurnRentAgreement(string memory propertyId)
    public modAdminOwnerCanAccess() modPropertyShouldBeRentedWithContracted(propertyId) {
        uint contractId = gc_mapContracts[propertyId].m_iContractId;
        delete gc_mapContracts[propertyId];
        emit evtContractTerminated(contractId);
    }
}