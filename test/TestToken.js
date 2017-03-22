var Token = artifacts.require("./Token.sol");

// Note: Start TestRPC with the following arguments to prevent the Contract Owner's account from running out of Ether / the tests failing because of an Out of Gas exception:
// testrpc --gasLimit 0x57E7C4 --gasPrice 2
contract('Token', function(accounts) {
    it("should put 100 Tokens in the first account", function() {
        return Token.deployed().then(function(instance) {
          return instance.balanceOf.call(accounts[0]);
        }).then(function(balance) {
          assert.equal(balance.valueOf(), 100, "100 wasn't in the first account");
        });
    });

    /******************** Transfer function tests ********************/
    it("Should successfully send a token, from the contract, to a new address", function() {
        var tokenInstance;
        var amountToSend = 1;
        var originalBalance;
        var fromAccount = accounts[0];
        var destinationAccount = accounts[1];
        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return instance.balanceOf.call(fromAccount);
        }).then(function(originalAmount) {
            originalBalance = originalAmount.valueOf();
            return tokenInstance.transfer(destinationAccount, amountToSend);
        }).then(function(result) {
            assertEventContainedInformation(result, 'Transfer', {from: fromAccount, to: destinationAccount, value: amountToSend});
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(fromAccountBalance) {
            assert.equal(fromAccountBalance.valueOf(), originalBalance-amountToSend, "The correct amount was not remaining in the owning accounts' address");
            return tokenInstance.balanceOf.call(destinationAccount);
        }).then(function(toAccountBalance) {
            assert.equal(toAccountBalance.valueOf(), amountToSend, "The correct amount was not remaining in the destination accounts' address");
        });
    });


    it("Should not be possible to send more that is available in the contract to a new address", function() {
        var tokenInstance;
        var amountToSend = 101;
        var fromAccount = accounts[0];
        var destinationAccount = accounts[2];
        var originalBalance;
        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(originalAmount) {
            originalBalance = originalAmount.valueOf();
            return tokenInstance.transfer(destinationAccount, amountToSend);
        }).then(function(result) {
            assertNoEventsHappened(result);
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), originalBalance, "There should not be any tokens sent from the msg.sender's address");
            return tokenInstance.balanceOf.call(destinationAccount);
        }).then(function(destinationBalance) {
            assert.equal(destinationBalance.valueOf(), 0, "No Tokens were sent to the destination address");
        });
    });

    // test for negative value
    it("Should not be possible to request a negative amount of Tokens from the contract address", function() {
        var tokenInstance;
        var fromAccount = accounts[0];
        var destinationAccount = accounts[2];
        var originalBalance;
        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return instance.balanceOf.call(fromAccount);
        }).then(function(originalAmount) {
            originalBalance = originalAmount.valueOf();
            return tokenInstance.transfer(destinationAccount, -1);
        }).then(function(result) {
            assertNoEventsHappened(result);
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), originalBalance, "There should not be any tokens sent from the msg.sender's address");
            return tokenInstance.balanceOf.call(destinationAccount);
        }).then(function(destinationBalance) {
            assert.equal(destinationBalance.valueOf(), 0, "No Tokens were sent to the destination address");
        });
    });

    /******************** transferFrom function tests ********************/
    it("Should be possible to transfer from the contract owner's address the exact amount approved.", function() {
        var tokenInstance;
        var fromAccount = accounts[0];
        var allowedAccount = accounts[1];
        var allowedAmount = 5;
        var fromAccountInitialAmount;
        var allowedAccountInitialAmount;

        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(fromAccountInitialBalance) {
            fromAccountInitialAmount = fromAccountInitialBalance.toNumber();
            return tokenInstance.balanceOf.call(allowedAccount);
        }).then(function(allowedAccountInitialBalance) {
            allowedAccountInitialAmount = allowedAccountInitialBalance.toNumber();
            // Approve an address to transfer a number of Tokens from the Token contract's address
            return tokenInstance.approve(allowedAccount, allowedAmount);
        }).then(function(approveResult) {
            assertNoEventsHappened(approveResult);
            // Transfer the approved amount of Tokens from the contract owner's address to the approved address
            return tokenInstance.transferFrom(fromAccount, allowedAccount, allowedAmount, {from: allowedAccount});
        }).then(function(allowedTransferResult) {
            assertEventContainedInformation(allowedTransferResult, 'Transfer', {from: fromAccount, to: allowedAccount, value: allowedAmount});
            // Verify the amounts in each of the accounts after the transactions
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(fromAccountFinalBalance) {
            // Verify the amount in the contract owner's address
            assert.equal(fromAccountFinalBalance.toNumber()+allowedAmount, fromAccountInitialAmount, "Expected the final amount of Tokens in the contract owner's address to have been reduced by the allowed amount.")
            return tokenInstance.balanceOf.call(allowedAccount);
        }).then(function(allowedAccountFinalBalance) {
            // Verify the amount in the 'allowed' address
            assert.equal(allowedAccountFinalBalance.toNumber()-allowedAmount, allowedAccountInitialAmount, "Expected the final amount of Tokens in the 'allowed' address to have been the allowed amount minus the amount transferred to the 'destination' address.")
        });
    });

    it("Should not be possible to the transfer any Tokens using an account that has not been approved.", function() {
        var tokenInstance;
        var fromAccount = accounts[0];
        var destinationAccount = accounts[1];
        var amountAttemptedToTransfer = 1;
        var fromAccountInitialAmount;
        var destinationAccountInitialAmount;

        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(fromAccountInitialBalance) {
            fromAccountInitialAmount = fromAccountInitialBalance.toNumber();
            return tokenInstance.balanceOf.call(destinationAccount);
        }).then(function(destinationAccountInitialBalance) {
            destinationAccountInitialAmount = destinationAccountInitialBalance.toNumber();
            // Attempt to transfer an amount of Tokens from the contract owner's address to the destination address
            return tokenInstance.transferFrom(fromAccount, destinationAccount, amountAttemptedToTransfer, {from: destinationAccount});
        }).then(function(transferResult) {
            assertNoEventsHappened(transferResult);
            // Verify the amounts in each of the accounts after the transactions
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(fromAccountFinalBalance) {
            // Verify the amount in the contract owner's address
            assert.equal(fromAccountFinalBalance.toNumber(), fromAccountInitialAmount, "Expected the final amount of Tokens in the contract owner's address not to have changed.")
            return tokenInstance.balanceOf.call(destinationAccount);
        }).then(function(allowedAccountFinalBalance) {
            // Verify the amount in the 'allowed' address
            assert.equal(allowedAccountFinalBalance.toNumber(), destinationAccountInitialAmount, "Expected the final amount of Tokens in the 'allowed' address not to have changed.")
        });
    });

    it("Should not be possible to transfer more tokens than have been approved from the contract owner's address.", function() {
        var tokenInstance;
        var fromAccount = accounts[0];
        var allowedAccount = accounts[1];
        var allowedAmount = 5;
        var amountAttemptedToTransfer = 6;
        var fromAccountInitialAmount;
        var allowedAccountInitialAmount;

        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(fromAccountInitialBalance) {
            fromAccountInitialAmount = fromAccountInitialBalance.toNumber();
            return tokenInstance.balanceOf.call(allowedAccount);
        }).then(function(allowedAccountInitialBalance) {
            allowedAccountInitialAmount = allowedAccountInitialBalance.toNumber();
            // Approve an address to transfer a number of Tokens from the Token contract's address
            return tokenInstance.approve(allowedAccount, allowedAmount);
        }).then(function(approveResult) {
            assertNoEventsHappened(approveResult);
            // Transfer the approved amount of Tokens from the contract owner's address to the approved address
            return tokenInstance.transferFrom(fromAccount, allowedAccount, amountAttemptedToTransfer, {from: allowedAccount});
        }).then(function(transferResult) {
            assertNoEventsHappened(transferResult);
            // Verify the amounts in each of the accounts after the transactions
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(fromAccountFinalBalance) {
            // Verify the amount in the contract owner's address
            assert.equal(fromAccountFinalBalance.toNumber(), fromAccountInitialAmount, "Expected the final amount of Tokens in the contract owner's address not to have changed.")
            return tokenInstance.balanceOf.call(allowedAccount);
        }).then(function(allowedAccountFinalBalance) {
            // Verify the amount in the 'allowed' address
            assert.equal(allowedAccountFinalBalance.toNumber(), allowedAccountInitialAmount, "Expected the final amount of Tokens in the 'allowed' address not to have changed.")
        });
    });

    it("Should not be possible to transfer more tokens than are available from the contract owner's address, even if more have been approved.", function() {
        var tokenInstance;
        var fromAccount = accounts[0];
        var allowedAccount = accounts[1];
        var allowedAmount;
        var fromAccountInitialAmount;
        var allowedAccountInitialAmount;

        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(fromAccountInitialBalance) {
            fromAccountInitialAmount = fromAccountInitialBalance.toNumber();
            // Set up the test - allow the more than is in the contract owner's address
            allowedAmount = fromAccountInitialAmount + 1;
            return tokenInstance.balanceOf.call(allowedAccount);
        }).then(function(allowedAccountInitialBalance) {
            allowedAccountInitialAmount = allowedAccountInitialBalance.toNumber();
            // Approve an address to transfer a number of Tokens from the Token contract's address
            return tokenInstance.approve(allowedAccount, allowedAmount);
        }).then(function(approveResult) {
            assertNoEventsHappened(approveResult);
            // Transfer the approved amount of Tokens from the contract owner's address to the approved address
            return tokenInstance.transferFrom(fromAccount, allowedAccount, allowedAmount, {from: allowedAccount});
        }).then(function(transferResult) {
            assertNoEventsHappened(transferResult);
            // Verify the amounts in each of the accounts after the transactions
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(fromAccountFinalBalance) {
            // Verify the amount in the contract owner's address
            assert.equal(fromAccountFinalBalance.toNumber(), fromAccountInitialAmount, "Expected the final amount of Tokens in the contract owner's address not to have changed.")
            return tokenInstance.balanceOf.call(allowedAccount);
        }).then(function(allowedAccountFinalBalance) {
            // Verify the amount in the 'allowed' address
            assert.equal(allowedAccountFinalBalance.toNumber(), allowedAccountInitialAmount, "Expected the final amount of Tokens in the 'allowed' address not to have changed.")
        });
    });

    it("Should not be possible to transfer a negative amount of tokens from the contract owner's address, even if an amount has been approved.", function() {
        var tokenInstance;
        var fromAccount = accounts[0];
        var allowedAccount = accounts[1];
        var allowedAmount = 1;
        var fromAccountInitialAmount;
        var allowedAccountInitialAmount;

        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(fromAccountInitialBalance) {
            fromAccountInitialAmount = fromAccountInitialBalance.toNumber();
            return tokenInstance.balanceOf.call(allowedAccount);
        }).then(function(allowedAccountInitialBalance) {
            allowedAccountInitialAmount = allowedAccountInitialBalance.toNumber();
            // Approve an address to transfer a number of Tokens from the Token contract's address
            return tokenInstance.approve(allowedAccount, allowedAmount);
        }).then(function(approveResult) {
            assertNoEventsHappened(approveResult);
            // Transfer the approved amount of Tokens from the contract owner's address to the approved address
            return tokenInstance.transferFrom(fromAccount, allowedAccount, -1, {from: allowedAccount});
        }).then(function(transferResult) {
            assertNoEventsHappened(transferResult);
            // Verify the amounts in each of the accounts after the transactions
            return tokenInstance.balanceOf.call(fromAccount);
        }).then(function(fromAccountFinalBalance) {
            // Verify the amount in the contract owner's address
            assert.equal(fromAccountFinalBalance.toNumber(), fromAccountInitialAmount, "Expected the final amount of Tokens in the contract owner's address not to have changed.")
            return tokenInstance.balanceOf.call(allowedAccount);
        }).then(function(allowedAccountFinalBalance) {
            // Verify the amount in the 'allowed' address
            assert.equal(allowedAccountFinalBalance.toNumber(), allowedAccountInitialAmount, "Expected the final amount of Tokens in the 'allowed' address not to have changed.")
        });
    });


    /******************** Utility functions ********************/
    var assertEventHappened = function(result, eventName) {
        assert.notEqual(null, result, "The result of the function should not be null.");
        assert.notEqual(null, eventName, "The event name to assert happened should not be null.");
        assert.notEqual(null, result.logs, "The result should have logs containing the event.");

        for(var i = 0; i < result.logs.length; i++) {
            var log = result.logs[i];
            if(log.event === eventName) {
                return;
            }
        }

        assert(false, "Could not find the event named "+eventName+" in the result");
    }

    var assertEventContainedInformation = function(result, eventName, information) {
        assertEventHappened(result, eventName);
        for(var i = 0; i < result.logs.length; i++) {
            var log = result.logs[i];
            if(log.event === eventName) {
                var informationAttributes = Object.keys(information);
                for(var j = 0; j < informationAttributes.length; j++) {
                    var attributeName = informationAttributes[j];
                    assert.equal(information[attributeName], log.args[attributeName].valueOf(), "The event does not have a matching attribute " + attributeName + ".");
                }
            }
        }
    }

    var assertNoEventsHappened = function(result) {
        assert.notEqual(null, result, "The result of the function should not be null.");
        assert.notEqual(null, result.logs, "The result should have logs");
        assert.equal(0, result.logs.length, "The result logs should be empty.");
    }

});