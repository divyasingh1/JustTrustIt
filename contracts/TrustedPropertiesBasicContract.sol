// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.5;


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




/**
 * @title Utility contract to store a property listing
 */
contract TrustedPropertyListing {

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


    // TODO: Require a legal property-document-id to verify property
    // TODO: Add floor (uint8)
    // TODO: Add country_code (gives stack too deep error - max 16 local variables allowed in a function)
    struct Property {
        string id;
        bool doesExist;
        bool isActive;
        PropertyType propertyType;
        bytes8 unit_number;            // House/Apartment/Flat number
        bytes6 pincode;
        string location;
        NumberOf rooms;
        NumberOf bathrooms;
        NumberOf parking;
        // string comments;
        uint initialAvailableDate;
        address originalOwner;
        address currentTenant;
        uint256 postedAt;               // Date of listing
    }

    /// Public view of a listed property
    struct PropertyView {
        bool isActive;
        bool isAvailable;
        PropertyType propertyType;
        bytes8 unit_number;            // House/Apartment/Flat number
        bytes6 pincode;
        string location;
        NumberOf rooms;
        NumberOf bathrooms;
        NumberOf parking;
        address originalOwner;
        uint currentRent;
        uint currentSecurity;
    }


    /// Struct to hold the property rent details
    struct PropertyRent {
        uint security_deposit;                  // Initial security deposit required (in wei)
		uint rent_amount;                       // Rent amount per month (in wei)
		uint256 updatedAt;                      // Rent update timestamp
    }


    /// Mapping of property_id to the Property data
    /// TODO: Make private
    mapping (string => Property) internal properties;

    /// Mapping of property_id to it's Rent data
    /// TODO: Make private
    mapping (string => PropertyRent) internal propertyRents;

    /// Mapping of hash of a property to property_id
    mapping (bytes32 => string) private propertyHashes;

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


    /// Return the hash of a property
    // TODO: Add country_code, unique legal property-document-id, etc
    function _propertyHash(
        PropertyType propertyType,
        bytes8 unit_number,
        bytes6 pincode,
        string memory location
    ) private pure returns (bytes32) {
        return keccak256(abi.encode(propertyType, unit_number, pincode, location));
    }


    /// Add new property
    function addProperty (
        string memory property_id,
        PropertyType propertyType,
        bytes8 unit_number,
        bytes6 pincode,
        string memory location,
        NumberOf rooms,
        NumberOf bathrooms,
        NumberOf parking,
        // string memory comments,
        uint initialAvailableDate)
    public
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
        PropertyType propertyType,
        bytes8 unit_number,
        bytes6 pincode,
        string memory location,
        NumberOf rooms,
        NumberOf bathrooms,
        NumberOf parking,
        // string memory comments,
        uint initialAvailableDate)
    public
    propertyDoesNotExist(property_id)
    {
        require(originalOwner != address(0x0), "Invalid originalOwner address (0x0)");
        require(!properties[propertyHashes[_propertyHash(propertyType, unit_number, pincode, location)]].doesExist, "Duplicate property hash!");

        properties[property_id] = Property({
            id: property_id,
            doesExist: true,
            isActive: true,
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
            postedAt: block.timestamp
        });

        propertyCount++;
        activePropertyCount++;

        emit PropertyAdded(originalOwner, property_id);
    }


    /// Get the property details
    /// @dev anyone can get the property details
    function getProperty (
        string memory property_id)
    public
    view
    propertyExists(property_id)
    returns (PropertyView memory)
    {
        return PropertyView({
            isActive: properties[property_id].isActive,
            isAvailable: properties[property_id].currentTenant != address(0x0),
            location: properties[property_id].location,
            propertyType: properties[property_id].propertyType,
            unit_number: properties[property_id].unit_number,
            pincode: properties[property_id].pincode,
            rooms: properties[property_id].rooms,
            bathrooms: properties[property_id].bathrooms,
            parking: properties[property_id].parking,
            originalOwner: properties[property_id].originalOwner,
            currentRent: propertyRents[property_id].rent_amount,
            currentSecurity: propertyRents[property_id].security_deposit
        });
    }


    /// Set rent for the property
    /// @dev Only the property owner can set rent
    function setRent (
        string memory property_id,
        uint security_deposit,
        uint rent_amount)
    public
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
    public
    view
    returns (bool)
    {
        return properties[property_id].isActive && properties[property_id].currentTenant != address(0x0) && propertyRents[property_id].rent_amount > 0;
    }


    //only original owner can mark property as in-active
    function deactivateProperty (
        string memory property_id)
    public
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
    public
    propertyExists(property_id)
    propertyNotActive(property_id)
    propertyOwnerOnly(property_id)
    returns (bool)
    {
        properties[property_id].isActive = true;
        activePropertyCount++;
        return true;
    }

}




/**
 * @title Basic contract for TrustedProperties
 */
contract TrustedPropertiesBasicRentContract is TrustedPropertyListing, Ownable {

    /// How much wei/token required as fee for any transaction?
    uint public contractTransactionFee;

    enum AgreementStatus {
    	Uninitialized,     // 0
    	DepositPending,    // 1
    	Active,            // 2
    	Completed,         // 3
    	Terminated         // 4
    }


	struct RentContract {

		bool doesExist;

		string property_id;
		AgreementStatus status;
		address owner;                          // Property owner address
		address tenant;                         // Tenant address
		uint security_deposit;                  // Initial security deposit required (in wei)
		uint rent_amount;                       // Rent amount per month (in wei)
		uint8 duration;                         // Duration of the agreement (in months)
		uint8 remaining_payments;               // Count of monthly payments due
		uint security_deposit_balance;          // Current balance of security deposit
        bytes10 start_date;                     // Contract start date (format: yyyy-mm-dd)
		uint8 duration_extension_request;       // Duration (in months) for contract extension requested by Tenant
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
        require(contracts[contract_id].doesExist, "Contract does not exist");
        _;
    }

    modifier contractDoesNotExist(uint contract_id) {
        require(!contracts[contract_id].doesExist, "Contract already exists");
        _;
    }

    modifier ownerOnly(uint contract_id) {
        require(msg.sender == contracts[contract_id].owner, "Only the registered property owner is allowed to do this");
        _;
    }

    modifier tenantOnly(uint contract_id) {
        require(msg.sender == contracts[contract_id].tenant, "Only the registered tenant is allowed to do this");
        _;
    }

    modifier activeContractOnly(uint contract_id) {
        require(contracts[contract_id].status == AgreementStatus.Active, "This is only allowed for active contracts");
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
        bytes10 start_date
    )
    public
    propertyOwnerOnly(property_id)
    contractDoesNotExist(contract_id) {

        require(isPropertyAvailable(property_id), "Property not available for renting");
        require(propertyRents[property_id].rent_amount > contractTransactionFee, "Rent must be more than fee!");
        require(propertyRents[property_id].security_deposit > contractTransactionFee, "Security deposit must be more than fee!");

        contracts[contract_id] = RentContract({
            doesExist: true,
            property_id: property_id,
            status: AgreementStatus.DepositPending,
            owner: msg.sender,
            tenant: tenant,
            security_deposit: propertyRents[property_id].security_deposit,
            rent_amount: propertyRents[property_id].rent_amount,
            duration: duration,
            start_date: start_date,
            remaining_payments: duration,
            security_deposit_balance: 0,
            duration_extension_request: 0,
            createdAt: block.timestamp
        });

        emit ContractAdded(contract_id);
    }


    /// Deposit the security amount from tenant to owner
    /// @param contract_id The id of the contract to deposit security amount for
    function depositSecurity(uint contract_id)
    public
    payable
    contractExists(contract_id)
    tenantOnly(contract_id) {

        // RentContract contract = contracts[contract_id];

        require(contracts[contract_id].status == AgreementStatus.DepositPending, "Security already deposited");
        require(msg.value >= contracts[contract_id].security_deposit, "Insufficient security deposit amount");

        uint debit_amount = contracts[contract_id].security_deposit;

        contracts[contract_id].security_deposit_balance = (debit_amount - contractTransactionFee);
		contracts[contract_id].status = AgreementStatus.Active;


		// Transfer the security deposit amount to owner (minus the platform fee)
		// balances[contracts[contract_id].owner] += (debit_amount - contractTransactionFee);

		// Refund any extra amount to the tenant
		if (msg.value > debit_amount) {
		    balances[contracts[contract_id].tenant] += (msg.value - debit_amount);
		}

		emit SecurityDeposited(contract_id, contracts[contract_id].security_deposit, contractTransactionFee);
		emit ExtraAmountRefunded(contract_id, msg.value - debit_amount);
    }



    /// Deposit the security amount from tenant to owner
    /// @param contract_id The id of the contract to pay rent for
    /// @dev only Tenant can pay the rent
    function payRent(uint contract_id)
    public
    payable
    contractExists(contract_id)
    tenantOnly(contract_id)
    activeContractOnly(contract_id) {

        // RentContract contract = contracts[contract_id];

        require(msg.value >= contracts[contract_id].rent_amount, "Insufficient rent amount");

        contracts[contract_id].remaining_payments -= 1;
        if (contracts[contract_id].remaining_payments == 0) {
            // Contract over
		    contracts[contract_id].status = AgreementStatus.Completed;

		    // Refund security deposit to the Tenant
		    balances[contracts[contract_id].tenant] += contracts[contract_id].security_deposit_balance;
        }

        uint debit_amount = contracts[contract_id].rent_amount;


		// Transfer the rent amount to owner (minus the platform fee)
		balances[contracts[contract_id].owner] += (debit_amount - contractTransactionFee);

		// Refund any extra amount to the tenant
		if (msg.value > debit_amount) {
		    balances[contracts[contract_id].tenant] += (msg.value - debit_amount);
		}

		emit RentPaid(contract_id, contracts[contract_id].security_deposit, contractTransactionFee);
		emit ExtraAmountRefunded(contract_id, msg.value - debit_amount);
    }


    /**
     * Allow users to withdraw from their wallet
     * @return whether the withdrawal was successful
     */
    function withdraw() public returns (bool) {
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
    function getPendingFunds() public view returns (uint) {
        return balances[msg.sender];
    }


    /// Get the details of a contract
    /// @param contract_id The id of the contract to get details of
    function getContractDetails(uint contract_id)
        public
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
            createdAt: contracts[contract_id].createdAt
        });
    }


    /// Request to extend the contract duration - from tenant to owner
    /// @param contract_id The id of the contract to to pay rent for
    /// @param extension_duration The number of months for which thetenant wants to extend the contract
    /// @dev only Tenant can make the request
    function extendContractDurationRequest(uint contract_id, uint8 extension_duration)
    public
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
    function extendContractDurationConfirm(uint contract_id, uint8 extension_duration)
    public
    contractExists(contract_id)
    ownerOnly(contract_id)
    activeContractOnly(contract_id) {

        require(contracts[contract_id].duration_extension_request == extension_duration, "Extension-duration does not match the what is requested by the tenant");

        contracts[contract_id].duration += extension_duration;
        contracts[contract_id].remaining_payments += extension_duration;
        contracts[contract_id].duration_extension_request = 0;

        emit ContractDurationExtended(contract_id, extension_duration);
    }

}
