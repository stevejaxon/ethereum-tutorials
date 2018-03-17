pragma solidity ^0.4.0;

interface Event {
    function getOwnerAddress() external view returns (address);
    function getStartDate() external view returns (uint);
    function getEndDate() external view returns (uint);
    function getStakeRequired() external view returns (uint);
    function getAttendeesListSize() external view returns (uint);
    function getMaxCapacity() external view returns (uint);
}
