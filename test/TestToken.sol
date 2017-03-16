pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Token.sol";

contract TestToken {

  function testInitialBalanceUsingDeployedContract() {
    Token token = Token(DeployedAddresses.Token());

    uint expected = 100;

    Assert.equal(token.balanceOf(msg.sender), expected, "Owner should have 10000 Tokens initially");
  }

  /*function testInitialBalanceWithNewToken() {
    uint256 initialSupply = 100;
    string memory tokenName = 'Test';
    uint8 decimalUnits = 0;
    string memory tokenSymbol = '£';

    Token token = new Token(initialSupply, tokenName, decimalUnits, tokenSymbol);


    Assert.equal(token.balanceOf(tx.origin), initialSupply, "Owner should have 100 Tokens initially");
  }*/

}
