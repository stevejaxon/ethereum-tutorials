pragma solidity ^0.4.0;

interface GetTogether {

    event GetTogetherCreated(address owner, uint getTogetherDate, uint maxCapacity, uint stakeRequired);
    event AttendeeRegistered(address attendee);
    event AttendeeCancelledRegistration(address attendee);

    function owner() public view returns (address);
    function coupon() public view returns (address);
    function getTogetherDate() public view returns (uint);
    function stakeRequired() public view returns (uint);
    function attendeesList() public view returns (address[]);
    function numberOfAttendees() public view returns (uint);
    function maxCapacity() public view returns (uint);
    function canCancel(uint datetime) public view returns (bool);
    function amountOfStakeReturnedOnCancellation(uint datetime) public view returns (uint);
    function whenStakeCanBeReturned() public view returns (uint);
    function amountOfStakeToBeReturned(address attendee, uint datetime) public view returns (uint);
    function register() public payable;
    function cancelRegistration() public;
    function cancelGetTogether() public;
}
