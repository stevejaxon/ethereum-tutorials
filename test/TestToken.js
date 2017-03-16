var Token = artifacts.require("./Token.sol");

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
        var destinationAccount = accounts[2];
        var originalBalance;
        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.balanceOf.call(accounts[0]);
        }).then(function(originalAmount) {
            originalBalance = originalAmount.valueOf();
            return tokenInstance.transfer(destinationAccount, amountToSend);
        }).then(function(result) {
            assertNoEventsHappened(result);
            return tokenInstance.balanceOf.call(accounts[0]);
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
        var destinationAccount = accounts[2];
        var originalBalance;
        return Token.deployed().then(function(instance) {
            tokenInstance = instance;
            return instance.balanceOf.call(accounts[0]);
        }).then(function(originalAmount) {
            originalBalance = originalAmount.valueOf();
            return tokenInstance.transfer(destinationAccount, -1);
        }).then(function(result) {
            assertNoEventsHappened(result);
            return tokenInstance.balanceOf.call(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), originalBalance, "There should not be any tokens sent from the msg.sender's address");
            return tokenInstance.balanceOf.call(destinationAccount);
        }).then(function(destinationBalance) {
            assert.equal(destinationBalance.valueOf(), 0, "No Tokens were sent to the destination address");
        });
    });
    /******************** Transfer function tests ********************/



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