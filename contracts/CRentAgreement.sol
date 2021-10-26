// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./CProperties.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RentAgreement is Ownable, ERC721{
    
    enum AgreementStatus {
        Uninitialized,     // 0
        DepositPending,    // 1
        Active,            // 2
        Completed,         // 3
        Terminated         // 4
    }
    
    struct RentContract {
        string m_strRentAgreementId;
        string m_strPropertyId;
        AgreementStatus m_eAgreementStatus;
        address m_addrOwner;                          
        address m_addrTenant;                         
        // uint security_deposit;                  // Initial security deposit required (in wei)
        uint rent_amount;                       // Rent amount per month (in wei)
        uint8 duration;                         // Duration of the agreement (in months)
        // uint8 remaining_payments;               // Count of monthly payments due
        // uint security_deposit_balance;          // Current balance of security deposit
        string start_date;                     // Contract start date (format: yyyy-mm-dd)
        // uint8 duration_extension_request;       // Duration (in months) for contract extension requested by Tenant
        uint256 createdAt;                      // Contract creation timestamp
    }
    
    LibProperty.Property m_objProperty;
    LibProperty.PropertyType m_objPropertyType;
    constructor(string memory name, string memory symbol) public ERC721(name, symbol){
        
    }
}