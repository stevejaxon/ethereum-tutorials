var Token = artifacts.require("./Token.sol");

module.exports = function(deployer) {
  deployer.deploy(Token, 100, 'My Test Token', 0, '£');
};
