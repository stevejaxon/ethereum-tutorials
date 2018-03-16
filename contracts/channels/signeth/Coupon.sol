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

    mapping (address => uint) public balances;
    mapping (address => mapping (address => uint256)) public allowed;

    event NewPriceSet(uint price);

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

    // TODO think about timelocking staked value
    // TODO think about how you ensure that only upto the current balance can be staked
    function approve(address _eventContract, uint256 _value) external {
        allowed[msg.sender][_eventContract] = _value;
        // Approval(msg.sender, _spender, _value);
    }

    function() public payable {
        balances[msg.sender] = balances[msg.sender].add(msg.value);
    }

    // TODO how to prevent someone from pulling the plug to avoid losing their stake?
    function withdraw() external {
        uint amount = balances[msg.sender];
        balances[msg.sender] = 0;
        delete allowed[msg.sender];
        msg.sender.transfer(amount);
    }
}
