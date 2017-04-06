var Token = artifacts.require("./Token.sol");
var HoneyPot = artifacts.require("./HoneyPot.sol");
var HoneyBadger = artifacts.require("./HoneyBadger.sol");

module.exports = function(deployer) {
  deployer.deploy(Token, 100, 'My Test Token', 0, '£');
  deployer.deploy(HoneyPot, {value: web3.toWei(5, "Ether")});
};
