pragma solidity ^0.4.0;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Coupon.sol';

/**
 * @title GetTogetherCoupon
 * @dev Implementation of the Coupon interface for use with the BlockTogether contract.
 */
// TODO decide whether the contract can be paused
contract GetTogetherCoupon is Ownable, Coupon {

    using SafeMath for uint256;

    mapping (address => uint) internal balances;

    function deposit() public payable {
        balances[msg.sender] = balances[msg.sender].add(msg.value);
        Deposited(msg.sender, msg.value);
    }

    function withdraw(uint _amount) public {
        uint balance = balances[msg.sender];
        require(balance >= _amount);
        require(_amount > 0);
        balances[msg.sender] = balance.sub(_amount);
        msg.sender.transfer(_amount);
        Withdrawn(msg.sender, _amount);
    }

    function balanceOf(address _account) public returns (uint) {
        return balances[_account];
    }
}
