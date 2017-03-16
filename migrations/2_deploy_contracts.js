var ConvertLib = artifacts.require("./ConvertLib.sol");
var Token = artifacts.require("./Token.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, Token);
  deployer.deploy(Token, 100, 'My Test Token', 0, '£');
};
