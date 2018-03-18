pragma solidity ^0.4.0;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * @title Coupon
 * @dev
 * Inspired by the ControlAccess Smart Contract (https://gist.github.com/PhABC/3d9f865592035ffde450b59aedcbaed6) presented as part of the
 * "Off-Chain Whitelist with On-Chain Verification for Ethereum Smart Contracts" article by Philippe Castonguay.
 */
// TODO decide whether the contract can be paused
contract Coupon is Ownable {

    using SafeMath for uint256;

    // TODO look at optimising size of data types later
    struct PaymentChannel {
        address owner;
        uint value;             // Total value stored in the payment channel
        uint stakeRequired;     // The amount of ETH required to be staked in order to attend
        uint totalAttendees;
        uint maxAttendees;
        uint scheduledFor;    // When the event starts
        uint settledBy;       // When the payment channel should be completely settled
    }

    mapping (address => uint) public balances;
    mapping (address => PaymentChannel) public channels;

    event RegistrationComplete(address indexed eventId, address attendee, uint attendeesListSize, uint stake);

    function registerEvent(address _eventContract, uint _stakeRequired, uint _maxAttendees, uint _scheduledFor, uint _settledBy) external {
        require(channels[_eventContract].owner == address(0));
        require(_maxAttendees > 1);
        require(_scheduledFor > now);
        require(_settledBy > _scheduledFor);

        channels[_eventContract] = PaymentChannel({
            owner: msg.sender,
            value: 0,
            stakeRequired: _stakeRequired,
            totalAttendees: 0,
            maxAttendees: _maxAttendees,
            scheduledFor: _scheduledFor,
            settledBy: _settledBy
            });
    }

    // TODO digital signature verification
    function transferFrom(address _from, address _to, uint256 _value, address _approver, uint8 _v, bytes32 _r, bytes32 _s) external {
        require(_to != address(0));
        require(_value <= balances[_from]);
        require(_value <= allowed[_from][_approver]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][_approver] = allowed[_from][_approver].sub(_value);
        // Transfer(_from, _to, _value);
    }

    // TODO think about how to prevent an address registering more than once
    function register(address _eventContract, uint256 _value) external payable {
        require(channels[_eventContract].owner != address(0));
        require(_value == msg.value);
        PaymentChannel storage channel = channels[_eventContract];
        require(channel.totalAttendees.add(1) <= channel.maxAttendees);
        require(msg.value == channel.stakeRequired);
        require(channel.value.add(msg.value) > channel.value);

        channel.totalAttendees = channel.totalAttendees.add(1);
        channel.value = channel.value.add(msg.value);

        RegistrationComplete(_eventContract, msg.sender, channel.totalAttendees, msg.value);
    }

    function() public payable {
        balances[msg.sender] = balances[msg.sender].add(msg.value);
    }

    function withdraw() external {
        uint amount = balances[msg.sender];
        balances[msg.sender] = 0;
        msg.sender.transfer(amount);
    }

    function getChannelsDetails(address _eventContract) external view returns (address, uint, uint, uint, uint, uint, uint) {
        PaymentChannel memory channel = channels[_eventContract];
        return (channel.owner, channel.value, channel.stakeRequired, channel.totalAttendees, channel.maxAttendees, channel.scheduledFor, channel.settledBy);
    }
}
