pragma solidity ^0.4.0;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Coupon.sol';
import './GetTogether.sol';

/**
 * @title GetTogetherCoupon
 * @dev Implementation of the Coupon interface for use with the BlockTogether contract.
 */
// TODO decide whether the contract can be paused
contract GetTogetherCoupon is Ownable, Coupon {

    using SafeMath for uint256;

    mapping (address => uint) internal balances;
    mapping (address => mapping(address => uint)) stakes;

    modifier hasLargeEnoughBalance(uint _amount) {
        require(balances[msg.sender] >= _amount);
        _;
    }

    function deposit() public payable {
        balances[msg.sender] = balances[msg.sender].add(msg.value);
        Deposited(msg.sender, msg.value);
    }

    function withdraw(uint _amount) public hasLargeEnoughBalance(_amount) {
        require(_amount > 0);
        balances[msg.sender] = balances[msg.sender].sub(_amount);
        msg.sender.transfer(_amount);
        Withdrawn(msg.sender, _amount);
    }

    function balanceOf(address _account) public returns (uint) {
        return balances[_account];
    }

    function registerForGetTogether(address _getTogether) public {
        require(_getTogether != address(0));
        GetTogether getTogether = GetTogether(_getTogether);
        require(getTogether.getTogetherDate() > now);
        require(getTogether.numberOfAttendees() < getTogether.maxCapacity());
        stake(getTogether.stakeRequired(), _getTogether);
    }

    function stake(uint _amount, address _getTogether) internal hasLargeEnoughBalance(_amount) {
        // Require that the msg.sender has not already registered / staked a balance for the get-together
        require(stakes[_getTogether][msg.sender] == 0);
        balances[msg.sender] = balances[msg.sender].sub(_amount);
        stakes[_getTogether][msg.sender] = _amount;
    }
}
