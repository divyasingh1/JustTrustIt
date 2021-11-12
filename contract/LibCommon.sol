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
        address m_addrOwnerName;
        string m_strDocumentDescription;
        bytes m_bytDocumentHash;
    }
}