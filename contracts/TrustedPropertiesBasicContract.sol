// SPDX-License-Identifier: UNLICENSED
pragma solidity ~0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";



// ----------------------------------------------------------------------------
// Library: Property Data Structure
// ----------------------------------------------------------------------------
library Properties {

    enum PropertyType {
        House,                         //  0 House
        ApartmentAndUnit,              //  1 Apartment and unit
        Townhouse,                     //  2 Townhouse
        Villa,                         //  3 Villa
        BlockOfUnits,                  //  4 Block of units (?)
        RetirementLiving               //  5 Retirement living
    }

    // The number of rooms, bathrooms, parking spaces, etc.
    enum NumberOf {
        Zero,                          //  0 Zero
        One,                           //  1 One
        Two,                           //  2 Two
        Three,                         //  3 Three
        Four,                          //  4 Four
        Five,                          //  5 Five
        SixOrMore                      //  6 Six or more
    }

    enum PropertyStatus {
        Uninitialized,          // 0
        AvailableForRent,       // 1
        Rented,                 // 3
        AvailableForReRent,     // 2
        ReRented                // 4
    }

    enum AgreementStatus {
        Uninitialized,     // 0
        DepositPending,    // 1
        Active,            // 2
        Completed,         // 3
        Terminated         // 4
    }

}




// ================================================================================
//              UTILITY CONTRACT: Ownable/Admin
// ================================================================================

/**
* @title Utility super-class to provide basic ownership features
*/
contract Ownable {

    /// Current smart-contract owner/admin
    address payable public admin;

    constructor() {
        admin = payable(msg.sender);
    }

    /// Allowed only by the admin
    modifier onlyAdmin {
        require(msg.sender == admin, "Only the admin is allowed to do this!");
        _;
    }
}




// ================================================================================
//              CONTRACT: TPRentalKey NFT Metadata (On-Chain)
// ================================================================================

/**
 * On-chain metadata for NFT TPRentalKey
 */
contract TPRentalKeyMetadataOnChain {

    struct TPRentalKeyMetadata {
        uint256 startTime;
        uint256 endTime;
    }

    // Mapping of ERC721 TPRentalKey NFT to it's metadata
    mapping (uint256 => TPRentalKeyMetadata) internal tprkey_meta_map;

    /**
     * Is the RentalToken still valid?
     */
    function _isValid(
        uint256 token_id,
        uint256 timestamp)
    internal
    view
    returns (bool) {
        return timestamp >= tprkey_meta_map[token_id].startTime &&
            timestamp <= tprkey_meta_map[token_id].endTime;
    }


    /**
     * Set the RentalToken metadata
     */
    function _setMetadata(
        uint256 token_id,
        uint256 startTime,
        uint256 endTime)
    internal {
        tprkey_meta_map[token_id].startTime = startTime;
        tprkey_meta_map[token_id].endTime = endTime;
    }


    /**
     * Returns the RentalToken metadata
     */
    function getMetadata(
        uint256 token_id)
    public
    view
    returns (uint256 startTime, uint256 endTime) {
        return (
            tprkey_meta_map[token_id].startTime,
            tprkey_meta_map[token_id].endTime
        );
    }

}




// ================================================================================
//              CONTRACT: TPRentalKey ERC721 NFT
// ================================================================================

/**
 * TPRentalKey ERC721 NFT: For tokenizing the rental access for tenants
 */
contract TPRentalKey is ERC721, TPRentalKeyMetadataOnChain {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor()
    ERC721("Item", "ITM")
    TPRentalKeyMetadataOnChain() {
    }


    /// Mint a new TPRentalKey token and assign it to the tenant
    function mintRental(
        address tenant,
        uint256 startTime,
        uint256 endTime)
    internal
    returns (uint256)
    {
        _tokenIds.increment();

        uint256 newTokenID = _tokenIds.current();

        _setMetadata(newTokenID, startTime, endTime);
        _safeMint(tenant, newTokenID);

        return newTokenID;
    }

}




// ================================================================================
//              CONTRACT: Unique Properties
// ================================================================================

/**
 * @title Utility contract to ensure the listed properties are unique
 */
contract UniqueProperty {

    /// Mapping of hash of a property to property_id
    mapping (bytes32 => string) internal propertyHashes;

    /// Return the hash of a property
    // TODO: Add country_code, unique legal property-document-id, etc
    function _propertyHash(
        Properties.PropertyType propertyType,
        string memory unit_number,
        string memory pincode,
        string memory location)
    internal
    pure
    returns (bytes32) {
        return keccak256(abi.encode(propertyType, unit_number, pincode, location));
    }

}




// ================================================================================
//              CONTRACT: Property Listing + Config (Discount, Re-rent)
// ================================================================================

/**
 * @title Utility contract to store a property listing
 */
contract TrustedPropertyListing is UniqueProperty {

    // TODO: Require a legal property-document-id to verify property
    // TODO: Add floor (uint8)
    // TODO: Add country_code (gives stack too deep error - max 16 local variables allowed in a function)
    struct Property {
        bool doesExist;
        string id;
        bool isActive;
        Properties.PropertyStatus status;
        Properties.PropertyType propertyType;
        string unit_number;            // House/Apartment/Flat number
        string pincode;
        string location;
        Properties.NumberOf rooms;
        Properties.NumberOf bathrooms;
        Properties.NumberOf parking;
        // string comments;
        uint initialAvailableDate;
        address originalOwner;
        address currentTenant;          // Current tenant (different than primary tenant if re-rented)
        address primaryTenant;          // Main tenant (first one to rent the property)
        uint256 postedAt;               // Date of listing
    }

    // Public view of a listed property
    struct PropertyView {
        bool isActive;
        bool isAvailable;
        Properties.PropertyStatus status;
        Properties.PropertyType propertyType;
        string unit_number;            // House/Apartment/Flat number
        string pincode;
        string location;
        Properties.NumberOf rooms;
        Properties.NumberOf bathrooms;
        Properties.NumberOf parking;
        address originalOwner;
        uint currentRent;
        uint currentSecurity;
        bool discount_available;
        uint discount_amount;
        uint8 discount_duration;
    }


    // Struct to hold the property rent details
    struct PropertyRent {
        uint security_deposit;                  // Initial security deposit required (in wei)
        uint rent_amount;                       // Rent amount per month (in wei)
        uint256 updatedAt;                      // Rent update timestamp
    }


    // Struct to hold the rent discount details when paid in bulk
    // TODO: Dynamic discounts
    struct RentDiscount {
        bool enabled;                           // Is discount active?
        uint amount;                            // Discount amount
        uint8 duration;                         // Duration (in months) for which rent has to be paid to avail discount
    }


    // Struct to hold property re-renting configuration
    struct PropertyReRent {
        bool allowed;                           // Is re-renting allowed? Only Property owner can set this.
        uint security_deposit;                  // Initial security deposit required (in wei)
        uint rent_amount;                       // Rent amount per month (in wei)
        uint256 updatedAt;                      // Rent update timestamp
    }


    /// Mapping of property_id to the Property data
    mapping (string => Property) internal properties;

    /// List of all properties (property_id)
    string[] public property_list;

    /// Mapping of property_id to it's Rent data
    mapping (string => PropertyRent) internal propertyRents;

    /// Mapping of property_id to RentDiscount data
    mapping(string => RentDiscount) internal propertyRentDiscounts;

    /// Mapping of property_id to Re-Renting Config
    mapping(string => PropertyReRent) internal propertyReRentals;


    uint32 public propertyCount = 0;
    uint32 public activePropertyCount = 0;


    event PropertyAdded(address ownerAddress, string property_id);
    event PropertyRemoved(address ownerAddress, string property_id);
    event RentChanged(string property_id, uint security_deposit, uint rent_amount);


    modifier propertyOwnerOnly(string memory property_id) {
        require(properties[property_id].originalOwner == msg.sender, "Only property owner can do this");
        _;
    }

    modifier propertyExists(string memory property_id) {
        require(properties[property_id].doesExist, "Property does not exist");
        _;
    }

    modifier propertyDoesNotExist(string memory property_id) {
        require(!properties[property_id].doesExist, "Property already exists");
        _;
    }

    modifier propertyIsActive(string memory property_id) {
        require(properties[property_id].isActive, "Property is in-active exists");
        _;
    }

    modifier propertyNotActive(string memory property_id) {
        require(!properties[property_id].isActive, "Property is already active exists");
        _;
    }


    // ~~~~~~~~~~~~~~~~~~~ PROPERTY ADD+CONFIG LOGIC ~~~~~~~~~~~~~~~~~~~~~~~~~~~

    /// Add new property
    function addProperty (
        string memory property_id,
        Properties.PropertyType propertyType,
        string memory unit_number,
        string memory pincode,
        string memory location,
        Properties.NumberOf rooms,
        Properties.NumberOf bathrooms,
        Properties.NumberOf parking,
    // string memory comments,
        uint initialAvailableDate)
    external
    {
        addPropertyOnBehalfOfOwner({
            property_id: property_id,
            originalOwner: msg.sender,
            location: location,
            propertyType: propertyType,
            unit_number: unit_number,
            pincode: pincode,
            rooms: rooms,
            bathrooms: bathrooms,
            parking: parking,
            // comments: comments,
            initialAvailableDate: initialAvailableDate
        });
    }


    /// Add new property on behalf of another owner
    function addPropertyOnBehalfOfOwner (
        string memory property_id,
        address originalOwner,
        Properties.PropertyType propertyType,
        string memory unit_number,
        string memory pincode,
        string memory location,
        Properties.NumberOf rooms,
        Properties.NumberOf bathrooms,
        Properties.NumberOf parking,
    // string memory comments,
        uint initialAvailableDate)
    public
    propertyDoesNotExist(property_id)
    {
        require(originalOwner != address(0x0), "Invalid owner address");
        require(!properties[propertyHashes[_propertyHash(propertyType, unit_number, pincode, location)]].doesExist, "Duplicate property hash");

        properties[property_id] = Property({
            id: property_id,
            doesExist: true,
            isActive: true,
            status: Properties.PropertyStatus.AvailableForRent,
            originalOwner: originalOwner,
            location: location,
            propertyType: propertyType,
            unit_number: unit_number,
            pincode: pincode,
            rooms: rooms,
            bathrooms: bathrooms,
            parking: parking,
            // comments: comments,
            initialAvailableDate: initialAvailableDate,
            currentTenant: address(0x0),
            primaryTenant: address(0x0),
            postedAt: block.timestamp
        });

        // Store a hash-mapping (for unique property check)
        propertyHashes[_propertyHash(propertyType, unit_number, pincode, location)] = property_id;

        property_list.push(property_id);
        propertyCount++;
        activePropertyCount++;

        emit PropertyAdded(originalOwner, property_id);
    }


    /// Get the property details
    /// @dev anyone can get the property details
    function getProperty (
        string memory property_id)
    external
    view
    propertyExists(property_id)
    returns (PropertyView memory)
    {
        return PropertyView({
            isActive: properties[property_id].isActive,
            status: properties[property_id].status,
            isAvailable: properties[property_id].currentTenant == address(0x0),
            location: properties[property_id].location,
            propertyType: properties[property_id].propertyType,
            unit_number: properties[property_id].unit_number,
            pincode: properties[property_id].pincode,
            rooms: properties[property_id].rooms,
            bathrooms: properties[property_id].bathrooms,
            parking: properties[property_id].parking,
            originalOwner: properties[property_id].originalOwner,
            currentRent: propertyRents[property_id].rent_amount,
            currentSecurity: propertyRents[property_id].security_deposit,
            discount_available: propertyRentDiscounts[property_id].enabled,
            discount_amount: propertyRentDiscounts[property_id].amount,
            discount_duration: propertyRentDiscounts[property_id].duration
        });
    }


    /// Set rent for a property
    /// @dev Only the property owner can set rent
    function setRent (
        string memory property_id,
        uint security_deposit,
        uint rent_amount)
    external
    propertyIsActive(property_id)
    propertyOwnerOnly(property_id)
    returns (bool)
    {
        properties[property_id].isActive = true;
        propertyRents[property_id] = PropertyRent({
            security_deposit: security_deposit,
            rent_amount: rent_amount,
            updatedAt: block.timestamp
        });
        return true;
    }


    /// Is the property available for renting?
    /// @dev Returns true if property is active, not currently rented and the rent amount is set
    function isPropertyAvailable (
        string memory property_id)
    internal
    view
    returns (bool)
    {
        return properties[property_id].isActive && properties[property_id].currentTenant == address(0x0) && propertyRents[property_id].rent_amount > 0;
    }


    //only original owner can mark property as in-active
    function deactivateProperty (
        string memory property_id)
    external
    propertyIsActive(property_id)
    propertyOwnerOnly(property_id)
    returns (bool)
    {
        properties[property_id].isActive = false;
        activePropertyCount--;
        return true;
    }


    //only original owner can mark property as active
    function activateProperty (
        string memory property_id)
    external
    propertyExists(property_id)
    propertyNotActive(property_id)
    propertyOwnerOnly(property_id)
    returns (bool)
    {
        properties[property_id].isActive = true;
        activePropertyCount++;
        return true;
    }


    // function _setCurrentTenant (
    //     string memory property_id,
    //     address tenant)
    // internal
    // {
    //     properties[property_id].currentTenant = tenant;

    //     if (properties[property_id].status == Properties.PropertyStatus.AvailableForReRent) {
    //         properties[property_id].status = Properties.PropertyStatus.ReRented;
    //     }
    //     else {
    //         properties[property_id].primaryTenant = tenant;
    //         properties[property_id].status = Properties.PropertyStatus.Rented;
    //     }
    // }


    function _resetCurrentTenant (
        string memory property_id)
    internal
    {
        if (properties[property_id].status == Properties.PropertyStatus.ReRented &&
            properties[property_id].currentTenant != properties[property_id].primaryTenant) {
            // Rerented property. Set it back to rented.
            properties[property_id].currentTenant = properties[property_id].primaryTenant;
            properties[property_id].status = Properties.PropertyStatus.Rented;

        } else {
            // Rented property. Set it back to Available.
            properties[property_id].currentTenant = properties[property_id].primaryTenant = address(0x0);
            properties[property_id].status = Properties.PropertyStatus.AvailableForRent;
        }
    }



    // ~~~~~~~~~~~~~~~~~~~ DISCOUNT LOGIC ~~~~~~~~~~~~~~~~~~~~~~~~~~~

    /// Set rent-discount for a property
    /// @dev Only the property owner can set rent
    function setDiscount (
        string memory property_id,
        uint discount_amount,
        uint8 duration)
    external
    propertyIsActive(property_id)
    propertyOwnerOnly(property_id)
    {
        require(propertyRents[property_id].rent_amount > 0, "Set the property rent first");
        require(discount_amount < propertyRents[property_id].rent_amount, "Discount must be less than rent");
        require(duration > 1, "Duration must be more than 1 month");

        propertyRentDiscounts[property_id] = RentDiscount({
            enabled: true,
            amount: discount_amount,
            duration: duration
        });
    }


    /// Clear rent-discount for a property
    /// @dev Only the property owner can set rent
    function clearDiscount (
        string memory property_id)
    external
    propertyOwnerOnly(property_id)
    {
        propertyRentDiscounts[property_id].enabled = false;
    }



    // ~~~~~~~~~~~~~~~~~~~ RE-RENTAL CONFIG LOGIC ~~~~~~~~~~~~~~~~~~~~~~~~~~~

    /// Allow/disallow rerenting of the property
    /// @dev Only the property owner can allow re-rentals
    function allowReRental (
        string memory property_id,
        bool allowed)
    external
    propertyIsActive(property_id)
    propertyOwnerOnly(property_id)
    {
        propertyReRentals[property_id].allowed = allowed;
    }


    /// Set re-rental amount for a property
    /// @dev Only the current tenant can set it, if re-rental allowed by the owner
    function setReRentAmount (
        string memory property_id,
        uint security_deposit,
        uint rent_amount)
    external
    {
        require(propertyReRentals[property_id].allowed, "ReRent not allowed");
        require(msg.sender == properties[property_id].primaryTenant, "Only main tenant can do this");

        propertyReRentals[property_id].security_deposit = security_deposit;
        propertyReRentals[property_id].rent_amount = rent_amount;
    }


    /// Set re-rental amount for a property
    /// @dev Only the current tenant can set it, if re-rental allowed by the owner
    /// @param publish True, if you want to publish your rented property for Re-Renting; false otherwise.
    function publishForReRent (
        string memory property_id,
        bool publish)
    external
    {
        require(propertyReRentals[property_id].allowed, "ReRent not allowed");
        require(msg.sender == properties[property_id].primaryTenant, "Only main tenant can do this");
        require(propertyReRentals[property_id].rent_amount > 0, "Rent not set");

        if (publish) {
            require(properties[property_id].status == Properties.PropertyStatus.Rented, "Require Property status = 2");
            properties[property_id].status = Properties.PropertyStatus.AvailableForReRent;
        } else {
            require(properties[property_id].status == Properties.PropertyStatus.AvailableForReRent, "Require Property status = 3");
            properties[property_id].status = Properties.PropertyStatus.Rented;
        }
    }

}





// ============================================================================
//              MAIN CONTRACT: Rent Agreement Contract
// ============================================================================

/**
 * @title Basic contract for TrustedProperties
 */
contract TrustedPropertiesBasicRentContract is TrustedPropertyListing, Ownable {

    /// How much wei/token required as fee for any transaction?
    uint public contractTransactionFee;


    struct RentContract {

        bool doesExist;

        string property_id;
        Properties.AgreementStatus status;
        address owner;                          // Property owner address
        address tenant;                         // Tenant address
        uint security_deposit;                  // Initial security deposit required (in wei)
        uint rent_amount;                       // Rent amount per month (in wei)
        uint8 duration;                         // Duration of the agreement (in months)
        uint8 remaining_payments;               // Count of monthly payments due
        uint security_deposit_balance;          // Current balance of security deposit
        string start_date;                      // Contract start date (format: yyyy-mm-dd)
        uint8 duration_extension_request;       // Duration (in months) for contract extension requested by Tenant
        bool allowReRental;                     // Re-Rentals allowed by the owner?
        uint256 createdAt;                      // Contract creation timestamp
    }

    /// Mapping of contract_id to the Contract data
    mapping (uint => RentContract) private contracts;

    /// Mapping of users' balances (user address to amount due)
    mapping (address => uint) private balances;



    // ----------------- EVENTS --------------------------------------

    /// Notify whenever a contract is added
    /// @param contract_id ID of the contract
    event ContractAdded(uint contract_id);

    /// Notify whenever security amount is deposited
    /// @param contract_id ID of the contract
    event SecurityDeposited(uint contract_id, uint amount, uint trxn_fee);

    /// Notify whenever a rent is paid
    /// @param contract_id ID of the contract
    /// @param amount Rent amount paid
    /// @param trxn_fee Fee deducted for the transaction
    event RentPaid(uint contract_id, uint amount, uint trxn_fee);

    /// Notify whenever a rent is paid
    /// @param contract_id ID of the contract
    /// @param duration Duration (in months) for the advance payment
    /// @param amount Total rent amount paid (minus the discount)
    /// @param discount Discount for the tenant
    /// @param trxn_fee Fee deducted for the transaction
    event AdvanceRentPaid(uint contract_id, uint8 duration, uint amount, uint discount, uint trxn_fee);

    /// Notify whenever the contract is prematurely terminated
    /// @param contract_id ID of the contract
    event ContractTerminated(uint contract_id);

    /// Notify whenever the contract is prematurely terminated
    /// @param contract_id ID of the contract
    event ExtraAmountRefunded(uint contract_id, uint amount);

    /// Notify whenever a request to extend the contract duration is made by the tenant
    /// @param contract_id ID of the contract
    /// @param extension_duration The number of months for which thetenant wants to extend the contract
    event ContractDurationExtensionRequested(uint contract_id, uint8 extension_duration);

    /// Notify whenever a request to extend the contract duration is confirmed by the owner
    /// @param contract_id ID of the contract
    /// @param extension_duration The number of months for which the contract is extended
    event ContractDurationExtended(uint contract_id, uint8 extension_duration);



    // ----------------- MODIFIERS --------------------------------------

    modifier contractExists(uint contract_id) {
        require(contracts[contract_id].doesExist, "Contract doesn't exist");
        _;
    }

    modifier contractDoesNotExist(uint contract_id) {
        require(!contracts[contract_id].doesExist, "Contract already exists");
        _;
    }

    modifier ownerOnly(uint contract_id) {
        require(msg.sender == contracts[contract_id].owner, "Only owner can do it");
        _;
    }

    modifier tenantOnly(uint contract_id) {
        require(msg.sender == contracts[contract_id].tenant, "Only tenant can do it");
        _;
    }

    modifier activeContractOnly(uint contract_id) {
        require(contracts[contract_id].status == Properties.AgreementStatus.Active, "Allowed for active contracts only");
        _;
    }



    // ----------------- METHODS --------------------------------------

    constructor (uint trxnFee) {
        contractTransactionFee = trxnFee;
    }


    /// Initialize RentContract by the owner
    function initializeRentContract(
        uint contract_id,
        string memory property_id,
        address tenant,
        uint8 duration,
        string memory start_date
    )
    external
    propertyOwnerOnly(property_id)
    contractDoesNotExist(contract_id) {

        require(isPropertyAvailable(property_id), "Property not available for renting");
        require(propertyRents[property_id].rent_amount > contractTransactionFee, "Rent must be more than fee!");
        require(propertyRents[property_id].security_deposit > contractTransactionFee, "Security deposit must be more than fee!");
        require(duration > 0, "Contract duration of zero months not allowed");

        contracts[contract_id] = RentContract({
            doesExist: true,
            property_id: property_id,
            status: Properties.AgreementStatus.DepositPending,
            owner: msg.sender,
            tenant: tenant,
            security_deposit: propertyRents[property_id].security_deposit,
            rent_amount: propertyRents[property_id].rent_amount,
            duration: duration,
            start_date: start_date,
            remaining_payments: duration,
            security_deposit_balance: 0,
            duration_extension_request: 0,
            allowReRental: propertyReRentals[property_id].allowed,
            createdAt: block.timestamp
        });

        // Set the current teannt of the property
        properties[property_id].currentTenant = tenant;

        if (properties[property_id].status == Properties.PropertyStatus.AvailableForReRent) {
            properties[property_id].status = Properties.PropertyStatus.ReRented;
        }
        else {
            properties[property_id].primaryTenant = tenant;
            properties[property_id].status = Properties.PropertyStatus.Rented;
        }

        emit ContractAdded(contract_id);
    }


    /// Deposit the security amount (from tenant to to contract-account)
    /// @param contract_id The id of the contract to deposit security amount for
    function depositSecurity(uint contract_id)
    external
    payable
    contractExists(contract_id)
    tenantOnly(contract_id) {

        // RentContract contract = contracts[contract_id];

        require(contracts[contract_id].status == Properties.AgreementStatus.DepositPending, "Security already deposited");
        require(msg.value >= contracts[contract_id].security_deposit, "Insufficient amount");

        uint debit_amount = contracts[contract_id].security_deposit;

        contracts[contract_id].security_deposit_balance = (debit_amount - contractTransactionFee);
        contracts[contract_id].status = Properties.AgreementStatus.Active;


        // Transfer the security deposit amount to owner (minus the platform fee)
        // balances[contracts[contract_id].owner] += (debit_amount - contractTransactionFee);

        // Refund any extra amount to the tenant
        if (msg.value > debit_amount) {
            balances[contracts[contract_id].tenant] += (msg.value - debit_amount);
        }

        emit SecurityDeposited(contract_id, contracts[contract_id].security_deposit, contractTransactionFee);
        emit ExtraAmountRefunded(contract_id, msg.value - debit_amount);
    }



    // Process a successful contract termination
    function _processContractTermination(
        uint contract_id)
    private {
        // Is it the last payment?
        if (contracts[contract_id].remaining_payments == 0 && contracts[contract_id].status != Properties.AgreementStatus.Completed) {

            // Contract over
            contracts[contract_id].status = Properties.AgreementStatus.Completed;

            // Refund security deposit to the Tenant
            balances[contracts[contract_id].tenant] += contracts[contract_id].security_deposit_balance;
            contracts[contract_id].security_deposit_balance = 0;

            // Reset the current teannt of the property
            _resetCurrentTenant(contracts[contract_id].property_id);
        }
    }



    /// Pay the rent amount for one month (from tenant to owner)
    /// @param contract_id The id of the contract to pay rent for
    /// @dev only Tenant can pay the rent
    function payRent(
        uint contract_id)
    external
    payable
    contractExists(contract_id)
    tenantOnly(contract_id)
    activeContractOnly(contract_id) {

        uint debit_amount = contracts[contract_id].rent_amount;

        require(msg.value >= debit_amount, "Insufficient amount");

        contracts[contract_id].remaining_payments -= 1;

        // Is it the last payment? Terminate the contract...
        // TODO: Terminate contract only after the renting period is over
        _processContractTermination(contract_id);


        // Transfer the rent amount to owner (minus the platform fee)
        balances[contracts[contract_id].owner] += (debit_amount - contractTransactionFee);

        // Refund any extra amount to the tenant
        if (msg.value > debit_amount) {
            balances[contracts[contract_id].tenant] += (msg.value - debit_amount);
        }

        emit RentPaid(contract_id, contracts[contract_id].rent_amount, contractTransactionFee);
        emit ExtraAmountRefunded(contract_id, msg.value - debit_amount);
    }


    /// Pay the rent amount in adavnce for getting a discount (from tenant to owner)
    /// @param contract_id The id of the contract to pay rent for
    /// @param duration The duration for which advance payment is being done
    /// @dev Only Tenant can pay the rent
    /// @dev Advance payment allowed only with the first rent payment
    /// @dev Rent discount must be active & advance duration must be equal to the discount duration
    function payAdvanceRent(
        uint contract_id,
        uint8 duration)
    external
    payable
    contractExists(contract_id)
    tenantOnly(contract_id)
    activeContractOnly(contract_id) {

        require(propertyRentDiscounts[contracts[contract_id].property_id].enabled, "Discount not enabled");
        require(contracts[contract_id].remaining_payments == contracts[contract_id].duration, "Allowed only with first payment");
        require(duration <= contracts[contract_id].remaining_payments, "Duration can't be more than remaining payments");
        require(duration == propertyRentDiscounts[contracts[contract_id].property_id].duration, "Duration must be same as property's discounted duration");

        uint debit_amount = contracts[contract_id].rent_amount * duration - propertyRentDiscounts[contracts[contract_id].property_id].amount;
        uint fee = contractTransactionFee * duration;

        require(msg.value >= debit_amount, "Insufficient amount");

        contracts[contract_id].remaining_payments -= duration;

        // Is it the last payment? Terminate the contract...
        _processContractTermination(contract_id);


        // Transfer the rent amount to owner (minus the platform fee)
        balances[contracts[contract_id].owner] += (debit_amount - fee);

        emit AdvanceRentPaid(contract_id, duration, debit_amount, propertyRentDiscounts[contracts[contract_id].property_id].amount, fee);

        // Refund any extra amount to the tenant
        if (msg.value > debit_amount) {
            balances[contracts[contract_id].tenant] += (msg.value - debit_amount);
            emit ExtraAmountRefunded(contract_id, msg.value - debit_amount);
        }
    }


    /**
     * Allow users to withdraw from their wallet
     * @return whether the withdrawal was successful
     */
    function withdraw()
    external
    returns (bool) {
        uint amount = balances[msg.sender];

        if (amount > 0) {
            balances[msg.sender] = 0;

            if (!payable(msg.sender).send(amount)) {
                balances[msg.sender] = amount;
                return false;
            }
        }

        return true;
    }


    /// Get the funds available in self's wallet
    function getPendingFunds()
    external
    view
    returns (uint) {
        return balances[msg.sender];
    }


    /// Get the details of a contract
    /// @param contract_id The id of the contract to get details of
    function getContractDetails(uint contract_id)
    external
    view
    contractExists(contract_id)
    returns ( RentContract memory) {

        require(msg.sender == contracts[contract_id].owner ||
        msg.sender == contracts[contract_id].tenant ||
            msg.sender == admin,
            "You are not allowed to view this contract");

        return RentContract({
            doesExist: true,
            property_id: contracts[contract_id].property_id,
            status: contracts[contract_id].status,
            owner: contracts[contract_id].owner,
            tenant: contracts[contract_id].tenant,
            security_deposit: contracts[contract_id].security_deposit,
            rent_amount: contracts[contract_id].rent_amount,
            duration: contracts[contract_id].duration,
            remaining_payments: contracts[contract_id].remaining_payments,
            security_deposit_balance: contracts[contract_id].security_deposit_balance,
            start_date: contracts[contract_id].start_date,
            duration_extension_request: contracts[contract_id].duration_extension_request,
            allowReRental: contracts[contract_id].allowReRental,
            createdAt: contracts[contract_id].createdAt
        });
    }


    /// Request to extend the contract duration - from tenant to owner
    /// @param contract_id The id of the contract to to pay rent for
    /// @param extension_duration The number of months for which thetenant wants to extend the contract
    /// @dev only Tenant can make the request
    function extendContractDurationRequest(
        uint contract_id,
        uint8 extension_duration)
    external
    contractExists(contract_id)
    tenantOnly(contract_id)
    activeContractOnly(contract_id) {

        contracts[contract_id].duration_extension_request = extension_duration;

        emit ContractDurationExtensionRequested(contract_id, extension_duration);
    }


    /// Request to extend the contract duration - from tenant to owner
    /// @param contract_id The id of the contract to to pay rent for
    /// @param extension_duration The number of months for which thetenant wants to extend the contract
    /// @dev only Property Owner can make the request
    function extendContractDurationConfirm(
        uint contract_id,
        uint8 extension_duration)
    external
    contractExists(contract_id)
    ownerOnly(contract_id)
    activeContractOnly(contract_id) {

        require(contracts[contract_id].duration_extension_request == extension_duration, "Extension-duration does not match the what is requested by the tenant");

        contracts[contract_id].duration += extension_duration;
        contracts[contract_id].remaining_payments += extension_duration;
        contracts[contract_id].duration_extension_request = 0;

        emit ContractDurationExtended(contract_id, extension_duration);
    }



    // ~~~~~~~~~~~~~~~~~~~~~~~~~~ RE-RENTAL CONTRACT LOGIC ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    /// Initialize Re-Rental Contract by the owner
    /// @ Only the primaryTenant can do this and only if allowed by the original Owner
    function initializeReRentalContract(
        uint contract_id,
        uint original_contract_id,
        address tenant,
        uint8 duration,
        string memory start_date
    )
    external
    contractDoesNotExist(contract_id) {

        // Only allowed for the tenant of an active contract, if the owner has allowed re-rentals.
        require(msg.sender == contracts[original_contract_id].tenant &&
            contracts[original_contract_id].status == Properties.AgreementStatus.Active &&
            contracts[original_contract_id].allowReRental,
            "Not allowed");

        string memory property_id = contracts[original_contract_id].property_id;

        require(propertyRents[property_id].rent_amount > contractTransactionFee, "Rent must be more than fee!");
        require(propertyRents[property_id].security_deposit > contractTransactionFee, "Security deposit must be more than fee!");
        require(duration > 0, "Zero contract duration not allowed");
        require (duration <= contracts[original_contract_id].duration, "ReRental contract can't be longer than original contract"); // TODO: Ensure contract is no longer than the remaining months of original contract

        contracts[contract_id] = RentContract({
            doesExist: true,
            property_id: property_id,
            status: Properties.AgreementStatus.DepositPending,
            owner: msg.sender,
            tenant: tenant,
            security_deposit: propertyRents[property_id].security_deposit,
            rent_amount: propertyRents[property_id].rent_amount,
            duration: duration,
            start_date: start_date,
            remaining_payments: duration,
            security_deposit_balance: 0,
            duration_extension_request: 0,
            allowReRental: false,
            createdAt: block.timestamp
        });

        // Set the current teannt of the property
        properties[property_id].currentTenant = tenant;

        if (properties[property_id].status == Properties.PropertyStatus.AvailableForReRent) {
            properties[property_id].status = Properties.PropertyStatus.ReRented;
        }
        else {
            properties[property_id].primaryTenant = tenant;
            properties[property_id].status = Properties.PropertyStatus.Rented;
        }

        emit ContractAdded(contract_id);
    }

}
