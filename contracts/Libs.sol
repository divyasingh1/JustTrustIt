// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

library LibCommon{

    function bIsValidDate(int day, int month, int year) pure public returns(bool) {
        if(day > 0 && month > 0 && year > 0){
            return true;
        }
        return false;
    }
    
    function bIsValidRating(int review) pure public returns(bool) {
        if(review > 0 && review < 5){
            return true;
        }
        return false;
    }
    
    function bIsValidTime(int hour, int minute, int secs) pure public returns(bool) {
        if(hour > 0 && hour <= 12 && minute > 0 && minute <= 60 && secs > 0 && secs <= 60){
            return true;
        }
        return false;
    }
    
    function iDateStructureToDateInt(Date memory date) pure public returns(int dateInt){
        dateInt = date.m_iDay * 100 * 100 + date.m_iMonth * 100 + date.m_iYear;
        return dateInt;
    }
    
    struct Date{
        int m_iDay;
        int m_iMonth;
        int m_iYear;
    }
    
    struct Time{
        int m_iHours;
        int m_iMinutes;
        int m_iSeconds;
    }

    struct Review{
        int m_iRating;
        string m_strComment;
    }
    
    struct Document{
        string m_strDocumentDescription;
        bytes m_bytDocumentHash;
    }
}

library LibProperty {   
    
    enum PropertyType {
        House,                         //  0 House
        Apartment,                     //  1 Apartment
        Townhouse,                     //  2 Townhouse
        Villa,                         //  3 Villa
        RetirementLiving               //  4 Retirement living
    }

    struct Property {
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
        bool m_bExists;
    }
    
    struct PaymentRecipts{
        string m_strSecurityDepositTxId;
        string[] m_arrMonthlyRenttxIds;
    }

}
