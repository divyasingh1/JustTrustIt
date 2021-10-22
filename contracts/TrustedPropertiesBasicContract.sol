// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.5;


/**
* @title Utility super-class to provide basic ownership features
*/
contract Ownable {

	/// Current contract owner
	address public owner;

	constructor() {
		owner = msg.sender;
	}

	/// Allowed only by the owner
	modifier onlyOwner {
		require(msg.sender == owner, "Only the owner is allowed to perform this action!");
		_;
	}
}


/**
 * @title Basic contract for TrustedProperties
 */
contract TrustedPropertiesBasicRentContract is Ownable {

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

		/// Agreement status (active, complete, terminated, etc)
		AgreementStatus status;

		/// Property ID
		string property_id;

		/// Property owner account's address
		address owner;

		/// Tenant account's address
		address tenant;

		/// Security-deposit escrow account's public-key
		// address security_escrow_pubkey;

		/// Minimum security deposit (in Lamports) to be made by the tenant before the contract begins
		uint security_deposit;

		/// Rent amount per month (in Lamports)
		uint rent_amount;

		/// Duration of the agreement (in months)
		uint8 duration;

		/// Count of monthly payments due
		uint8 remaining_payments;

		/// Count of monthly payments due
		uint remaining_security_deposit;

		/// Contract start date (format: yyyy-mm-dd)
		string start_date;

		/// Duration (in months) for contract extension requested by Tenant
		uint8 duration_extension_request;
	}

    /// Mapping of contract_id to the Contract data
	mapping (uint => RentContract) private contracts;

	/// Mapping of users' balances (user address to amount due)
	mapping (address => uint) private balances;


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


    constructor (uint trxnFee) {
        contractTransactionFee = trxnFee;
    }


    /// Initialize RentContract by the owner
    function initializeRentContract(uint contract_id, string memory property_id, address tenant, uint security_deposit, uint rent_amount, uint8 duration, string memory start_date) public {
        address owner = msg.sender;

        require(contracts[contract_id].doesExist != true, "Contract already exists");
        require(rent_amount > contractTransactionFee, "Rent can't be less than fee!");

        contracts[contract_id] = RentContract({
            doesExist: true,
            property_id: property_id,
            status: AgreementStatus.DepositPending,
            owner: owner,
            tenant: tenant,
            security_deposit: security_deposit,
            rent_amount: rent_amount,
            duration: duration,
            start_date: start_date,
            remaining_payments: duration,
            remaining_security_deposit: 0,
            duration_extension_request: 0
        });

        emit ContractAdded(contract_id);
    }


    /// Deposit the security amount from tenant to owner
    /// @param contract_id The id of the contract to deposit security amount for
    function depositSecurity(uint contract_id) public payable {

        // RentContract contract = contracts[contract_id];

        require(contracts[contract_id].doesExist == true, "Contract doesn't exist");
        require(msg.sender == contracts[contract_id].tenant, "Only the registered tenant can deposit security amount");
        require(contracts[contract_id].status == AgreementStatus.DepositPending, "Security already deposited");
        require(msg.value >= contracts[contract_id].security_deposit, "Insufficient security deposit amount");

        uint debit_amount = contracts[contract_id].security_deposit;

        contracts[contract_id].remaining_security_deposit = (debit_amount - contractTransactionFee);
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
    /// @param contract_id The id of the contract to to pay rent for
    /// @dev only Tenant can pay the rent
    function payRent(uint contract_id) public payable {

        // RentContract contract = contracts[contract_id];

        require(contracts[contract_id].doesExist == true, "Contract doesn't exist");
        require(msg.sender == contracts[contract_id].tenant, "Only the registered tenant can deposit rent");
        require(contracts[contract_id].status == AgreementStatus.Active, "Not an active contract");
        require(msg.value >= contracts[contract_id].rent_amount, "Insufficient rent amount");

        contracts[contract_id].remaining_payments -= 1;
        if (contracts[contract_id].remaining_payments == 0) {
            // Contract over
		    contracts[contract_id].status = AgreementStatus.Completed;

		    // Refund security deposit to the Tenant
		    balances[contracts[contract_id].tenant] += contracts[contract_id].remaining_security_deposit;
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
        returns ( RentContract memory) {

        require(contracts[contract_id].doesExist == true, "Contract doesn't exist");
        require(msg.sender == contracts[contract_id].owner ||
            msg.sender == contracts[contract_id].tenant ||
            msg.sender == owner,
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
            remaining_security_deposit: contracts[contract_id].remaining_security_deposit,
            start_date: contracts[contract_id].start_date,
            duration_extension_request: contracts[contract_id].duration_extension_request
        });
    }

}
