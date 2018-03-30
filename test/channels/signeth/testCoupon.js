let GetTogetherCoupon = artifacts.require("./GetTogetherCoupon.sol");
let MockGetTogether = artifacts.require("./MockGetTogether.sol");
const assert = require('chai').assert;
const Promise = require("bluebird");
const abi = require('ethereumjs-abi');
const addEvmFunctions = require("../../utils/evmFunctions");

const noExceptionError = new Error("should not have reached this point");
const secondsInADay = 86400;

contract('Coupon', async (accounts) => {

    let owner = accounts[0];
    let couponInstance;
    let mockGetTogetherInstance;

    before('// add the functions to modify time to web3', async () => {
        addEvmFunctions(web3);
        Promise.promisifyAll(web3.eth, { suffix: "Promise" });
        Promise.promisifyAll(web3.evm, { suffix: "Promise" });
    });

    beforeEach('Create contract instances', async () => {
        couponInstance = await GetTogetherCoupon.new();
        mockGetTogetherInstance = await MockGetTogether.new();
    });

    describe('owner tests', () => {
        it('should be true that the owner is set up correctly', async () => {
            couponOwner = await couponInstance.owner.call();
            assert.equal(couponOwner, owner, 'Expected that the Coupon owner would be correct');
        });
    });

    describe('deposit tests', () => {
        it('should be possible to deposit coupons in one single transfer', async () => {
            // Setup the test
            let depositor = accounts[1];
            let amountToDeposit = web3.toWei(1, 'ether');

            // test
            try {
                await couponInstance.deposit({from: depositor, value: amountToDeposit});
            } catch(e) {
                throw e;
            }

            // verify
            let amountDeposited = await couponInstance.balanceOf.call(depositor);
            assert.equal(amountDeposited, amountToDeposit)
        });

        it('should be possible to incrementally deposit coupons in multiple transfers', async () => {
            // Setup the test
            let depositor = accounts[2];
            let amountToDeposit1 = web3.toBigNumber(web3.toWei(1, 'kwei'));
            let amountToDeposit2 = web3.toBigNumber(web3.toWei(27, 'gwei'));
            let amountToDeposit3 = web3.toBigNumber(web3.toWei(716, 'gwei'));
            let amountToDeposit4 = web3.toBigNumber(web3.toWei(82, 'finney'));

            // test
            try {
                await couponInstance.deposit({from: depositor, value: amountToDeposit1});
                await couponInstance.deposit({from: depositor, value: amountToDeposit2});
                await couponInstance.deposit({from: depositor, value: amountToDeposit3});
                await couponInstance.deposit({from: depositor, value: amountToDeposit4});
            } catch(e) {
                throw e;
            }

            // verify
            let amountDeposited = await couponInstance.balanceOf.call(depositor);
            let amountExpected = amountToDeposit1.add(amountToDeposit2).add(amountToDeposit3).add(amountToDeposit4);

            assert.isTrue(amountDeposited.cmp(amountExpected) === 0);
        });
    });

    describe('Withdraw tests', () => {
        it('should be possible to withdraw all ether in on single transaction', async () => {
            // Setup
            let depositor = accounts[1];
            let deposit = web3.toBigNumber(web3.toWei(13796, 'kwei'));
            await couponInstance.deposit({from: depositor, value: deposit});
            let totalDeposited = await couponInstance.balanceOf.call(depositor);

            // Test
            try {
                await couponInstance.withdraw(totalDeposited, {from: depositor});
            } catch(e) {
                throw e;
            }

            // Verify
            let remainingDeposited = await couponInstance.balanceOf.call(depositor);
            assert.equal(remainingDeposited, 0, 'Expected that the user would have withdrawn all of their ether');
        });

        it('should be possible to withdraw part of the ether in on single transaction', async () => {
            // Setup
            let depositor = accounts[1];
            let deposit = web3.toBigNumber(web3.toWei(13796, 'kwei'));
            await couponInstance.deposit({from: depositor, value: deposit});
            let totalDeposited = await couponInstance.balanceOf.call(depositor);
            let withdrawlAmount = web3.toBigNumber(web3.toWei(2683, 'kwei'));

            // Test
            try {
                await couponInstance.withdraw(withdrawlAmount, {from: depositor});
            } catch(e) {
                throw e;
            }

            // Verify
            let remainingDeposited = await couponInstance.balanceOf.call(depositor);
            let expectedRemaining = totalDeposited.minus(withdrawlAmount);
            assert.isTrue(remainingDeposited.cmp(expectedRemaining) === 0, 'Expected that the user would have the expected amount of ether remaining in the coupon contract');
        });

        it('should be possible to withdraw all ether over the course of multiple transactions', async () => {
            // Setup
            let depositor = accounts[2];
            let deposit = web3.toBigNumber(web3.toWei(4929, 'kwei'));
            await couponInstance.deposit({from: depositor, value: deposit});
            let totalDeposited = await couponInstance.balanceOf.call(depositor);

            let withdrawlAmount1 = web3.toBigNumber(web3.toWei(100, 'wei'));
            let withdrawlAmount2 = web3.toBigNumber(web3.toWei(62, 'kwei'));
            let withdrawlAmount3 = web3.toBigNumber(web3.toWei(818, 'kwei'));
            let withdrawlAmount4 = web3.toBigNumber(web3.toWei(1111, 'wei'));
            let withdrawlAmount5 = totalDeposited.minus(withdrawlAmount1.add(withdrawlAmount2).add(withdrawlAmount3).add(withdrawlAmount4));

            // Test
            try {
                await couponInstance.withdraw(withdrawlAmount1, {from: depositor});
                await couponInstance.withdraw(withdrawlAmount2, {from: depositor});
                await couponInstance.withdraw(withdrawlAmount3, {from: depositor});
                await couponInstance.withdraw(withdrawlAmount4, {from: depositor});
                await couponInstance.withdraw(withdrawlAmount5, {from: depositor});
            } catch(e) {
                throw e;
            }

            // Verify
            let remainingDeposited = await couponInstance.balanceOf.call(depositor);
            assert.equal(remainingDeposited, 0, 'Expected that the user would have withdrawn all of their ether');
        });

        it('should be possible to withdraw part of the ether over the course of multiple transactions', async () => {
            // Setup
            let depositor = accounts[2];
            let deposit = web3.toBigNumber(web3.toWei(2, 'ether'));
            await couponInstance.deposit({from: depositor, value: deposit});
            let totalDeposited = await couponInstance.balanceOf.call(depositor);

            let withdrawlAmount1 = web3.toBigNumber(web3.toWei(17364937292, 'wei'));
            let withdrawlAmount2 = web3.toBigNumber(web3.toWei(2827, 'kwei'));
            let withdrawlAmount3 = web3.toBigNumber(web3.toWei(7728, 'kwei'));
            let withdrawlAmount4 = web3.toBigNumber(web3.toWei(888, 'gwei'));
            let withdrawlAmount5 = web3.toBigNumber(web3.toWei(62, 'finney'));
            let withdrawlAmount6 = web3.toBigNumber(web3.toWei(2701, 'gwei'));
            let withdrawlAmount7 = web3.toBigNumber(web3.toWei(7382, 'gwei'));

            // Test
            try {
                await couponInstance.withdraw(withdrawlAmount1, {from: depositor});
                await couponInstance.withdraw(withdrawlAmount2, {from: depositor});
                await couponInstance.withdraw(withdrawlAmount3, {from: depositor});
                await couponInstance.withdraw(withdrawlAmount4, {from: depositor});
                await couponInstance.withdraw(withdrawlAmount5, {from: depositor});
                await couponInstance.withdraw(withdrawlAmount6, {from: depositor});
                await couponInstance.withdraw(withdrawlAmount7, {from: depositor});
            } catch(e) {
                throw e;
            }

            // Verify
            let remainingDeposited = await couponInstance.balanceOf.call(depositor);
            let expectedRemaining = totalDeposited.minus(withdrawlAmount1.add(withdrawlAmount2).add(withdrawlAmount3).add(withdrawlAmount4).add(withdrawlAmount5).add(withdrawlAmount6).add(withdrawlAmount7))
            assert.isTrue(remainingDeposited.cmp(expectedRemaining) === 0, 'Expected that the user would have an amount of ether remaining in the contract');
        });

        it('should be possible to withdraw the ether than is not staked', async () => {
            // Setup
            let stakeRequired = await mockGetTogetherInstance.stakeRequired();
            let depositor = accounts[3];
            await couponInstance.deposit({from: depositor, value: stakeRequired * 10});
            let totalDeposited = await couponInstance.balanceOf.call(depositor);
            let amountToWithdraw = totalDeposited.sub(stakeRequired);

            // Test
            try {
                // Register and stake the deposit
                await couponInstance.registerForGetTogether(mockGetTogetherInstance.address, {from: depositor});
                // Withdraw the remaining amount deposited - that has not been staked
                await couponInstance.withdraw(amountToWithdraw, {from: depositor});
            } catch(e) {
                throw e;
            }

            // Verify
            let remainingDeposited = await couponInstance.balanceOf.call(depositor);
            assert.equal(remainingDeposited, 0, 'Expected that amount deposited (and not staked) would be 0');
        });

        it('should not be possible to withdraw more ether than is available (not staked)', async () => {
            // Setup
            let depositor = accounts[3];
            let smallestDenomination = web3.toBigNumber(web3.toWei(1, 'wei'));
            await couponInstance.deposit({from: depositor, value: smallestDenomination});
            let totalDeposited = await couponInstance.balanceOf.call(depositor);
            let amountToWithdraw = totalDeposited.add(smallestDenomination);

            // Test
            try {
                await couponInstance.withdraw(amountToWithdraw, {from: depositor});
                throw noExceptionError;
            } catch(e) {
                // Verify
                assert.notEqual(e, noExceptionError, 'Expected that the error caught was not the noExceptionError');
            }

            let remainingBalance = await couponInstance.balanceOf.call(depositor);
            assert.isTrue(remainingBalance.cmp(totalDeposited) === 0, 'Expected that no ether would have been withdrawn');
        });

        it('should not be possible to withdraw the ether when it is staked', async () => {
            // Setup
            let stakeRequired = await mockGetTogetherInstance.stakeRequired();
            let depositor = accounts[4];
            await couponInstance.deposit({from: depositor, value: stakeRequired});
            let totalDeposited = await couponInstance.balanceOf.call(depositor);

            // Test
            try {
                // Register and stake the deposit
                await couponInstance.registerForGetTogether(mockGetTogetherInstance.address, {from: depositor});
            } catch(e) {
                throw e;
            }

            try {
                // Try to withdraw the full balance when some of it is staked
                await couponInstance.withdraw(totalDeposited, {from: depositor});
                throw noExceptionError;
            } catch(e) {
                // Verify
                assert.notEqual(e, noExceptionError, 'Expected that the error caught was not the noExceptionError');
            }

            // Verify
            let remainingDeposited = await couponInstance.balanceOf.call(depositor);
            assert.equal(remainingDeposited, 0, 'Expected that there would be no balance because it is staked');
        });

        it('should not be possible to withdraw more ether than is available (when some is staked)', async () => {
            // Setup
            let stakeRequired = await mockGetTogetherInstance.stakeRequired();
            let depositor = accounts[2];
            await couponInstance.deposit({from: depositor, value: stakeRequired * 10});
            let totalDeposited = await couponInstance.balanceOf.call(depositor);

            // Test
            try {
                // Register and stake the deposit
                await couponInstance.registerForGetTogether(mockGetTogetherInstance.address, {from: depositor});
            } catch(e) {
                throw e;
            }

            try {
                // Try to withdraw the full balance when some of it is staked
                await couponInstance.withdraw(totalDeposited, {from: depositor});
                throw noExceptionError;
            } catch(e) {
                // Verify
                assert.notEqual(e, noExceptionError, 'Expected that the error caught was not the noExceptionError');
            }

            // Verify
            let remainingDeposited = await couponInstance.balanceOf.call(depositor);
            let expectedRemainingDeposited = totalDeposited.sub(stakeRequired);
            assert.isTrue(remainingDeposited.cmp(expectedRemainingDeposited) === 0, 'Expected that there would be no balance because it is staked');
        });
    });

    describe('Register tests', () => {
        it('should not be possible for the same account to register twice', async () => {
            // Setup
            let stakeRequired = await mockGetTogetherInstance.stakeRequired();
            let depositor = accounts[5];
            await couponInstance.deposit({from: depositor, value: stakeRequired * 2});

            // Test
            try {
                // Register and stake the deposit
                await couponInstance.registerForGetTogether(mockGetTogetherInstance.address, {from: depositor});
            } catch(e) {
                throw e;
            }

            try {
                // Try to register the second time
                await couponInstance.registerForGetTogether(mockGetTogetherInstance.address, {from: depositor});
                throw noExceptionError;
            } catch(e) {
                // Verify
                assert.notEqual(e, noExceptionError, 'Expected that the error caught was not the noExceptionError');
            }
        });

        it('should not be possible to register once the event has started', async () => {
            // Setup
            // Take a snapshot of the EVM before the test
            let snapshotId = await web3.evm.snapshotPromise();

            let stakeRequired = await mockGetTogetherInstance.stakeRequired();
            let depositor = accounts[1];
            await couponInstance.deposit({from: depositor, value: stakeRequired});

            // fast forward the evm to the time of the event ~1 day
            await web3.evm.increaseTimePromise(secondsInADay);
            // A new block has to be mined for 'now' to reflect the updated time on the evm
            await web3.evm.minePromise();

            // Test
            try {
                // Try to register and stake the deposit late
                await couponInstance.registerForGetTogether(mockGetTogetherInstance.address, {from: depositor});
                throw noExceptionError;
            } catch(e) {
                // Verify
                assert.notEqual(e, noExceptionError, 'Expected that the error caught was not the noExceptionError');
            }

            // Revert the EVM back to the snapshotId
            await web3.evm.revertPromise(snapshotId);
        });
    });

    describe('Redeem stake tests', () => {
        it('should be possible to \n' +
            '\t1. Deposit some balance. \n' +
            '\t2. Stake the required amount to attend a get-together. \n' +
            '\t3. For the get-together organised to provide a signature to unlock the balance. \n' +
            '\t4. For the attendee to un-stake the staked amount. \n', async () => {
            try {
                // Setup
                let stakeRequired = await mockGetTogetherInstance.stakeRequired();
                let depositor = accounts[1];
                await couponInstance.deposit({from: depositor, value: stakeRequired});
                let totalDeposited = await couponInstance.balanceOf.call(depositor);
                await couponInstance.registerForGetTogether(mockGetTogetherInstance.address, {from: depositor});

                let currentBalance = await couponInstance.balanceOf.call(depositor);
                assert.isTrue(currentBalance.cmp(totalDeposited.sub(stakeRequired)) === 0, 'The users account should have been reduced by the staked amount.');

                // Test
                // TODO move to the web3.js V1.x.x version of this
                let h = "0x" + abi.soliditySHA3(["address", "address", "uint"], [mockGetTogetherInstance.address, depositor, stakeRequired.toNumber()]).toString('hex');
                let sig = web3.eth.sign(owner, h).slice(2);
                let r = `0x${sig.slice(0, 64)}`;
                let s = `0x${sig.slice(64, 128)}`;
                let v = web3.toDecimal(sig.slice(128, 130)) + 27;

                // Move the time on 1 day; to the point where the stake can be redeemed
                await web3.evm.increaseTimePromise(secondsInADay);
                // A new block has to be mined for 'now' to reflect the updated time on the evm
                await web3.evm.minePromise();
                await couponInstance.redeemStake(mockGetTogetherInstance.address, depositor, stakeRequired, v, r, s, {from: depositor});

                // Verify
                currentBalance = await couponInstance.balanceOf.call(depositor);
                assert.isTrue(currentBalance.cmp(totalDeposited) === 0, 'The users stake should have been returned.');
            } catch(e) {
                throw e;
            }
        });

        it('should be possible redeem a stake grater than what was deposited if one person forfeits theirs', async () => {
            try {
                // Setup
                let stakeRequired = await mockGetTogetherInstance.stakeRequired();
                let depositor1 = accounts[1];
                let depositor2 = accounts[2];
                // Both addresses stake different balances in the coupon contract
                await couponInstance.deposit({from: depositor1, value: stakeRequired * 10});
                await couponInstance.deposit({from: depositor2, value: stakeRequired * 5});
                // Keep a record of the staked balances before the testing
                let totalDeposited1 = await couponInstance.balanceOf.call(depositor1);
                let totalDeposited2 = await couponInstance.balanceOf.call(depositor2);
                // Register for an event
                await couponInstance.registerForGetTogether(mockGetTogetherInstance.address, {from: depositor1});
                await couponInstance.registerForGetTogether(mockGetTogetherInstance.address, {from: depositor2});
                // Keep a record of the resulting staked balances after the addresses register for an event
                let currentBalance1 = await couponInstance.balanceOf.call(depositor1);
                let currentBalance2 = await couponInstance.balanceOf.call(depositor2);
                assert.isTrue(currentBalance1.cmp(totalDeposited1.sub(stakeRequired)) === 0, 'The user 1s account should have been reduced by the staked amount.');
                assert.isTrue(currentBalance2.cmp(totalDeposited2.sub(stakeRequired)) === 0, 'The user 2s account should have been reduced by the staked amount.');

                // Test
                let totalIncludingForeitedStake = stakeRequired * 2;
                let h = "0x" + abi.soliditySHA3(["address", "address", "uint"], [mockGetTogetherInstance.address, depositor1, totalIncludingForeitedStake]).toString('hex');
                let sig = web3.eth.sign(owner, h).slice(2);
                let r = `0x${sig.slice(0, 64)}`;
                let s = `0x${sig.slice(64, 128)}`;
                let v = web3.toDecimal(sig.slice(128, 130)) + 27;

                // Move the time on 1 day; to the point where the stake can be redeemed
                await web3.evm.increaseTimePromise(secondsInADay);
                // A new block has to be mined for 'now' to reflect the updated time on the evm
                await web3.evm.minePromise();
                await couponInstance.redeemStake(mockGetTogetherInstance.address, depositor1, totalIncludingForeitedStake, v, r, s, {from: depositor1});

                // Verify
                currentBalance1 = await couponInstance.balanceOf.call(depositor1);
                currentBalance2 = await couponInstance.balanceOf.call(depositor2);
                assert.isTrue(currentBalance1.cmp(totalDeposited1.add(stakeRequired)) === 0, 'The users stake should have been returned + the amount forfeited');
                assert.isTrue(currentBalance2.cmp(totalDeposited2.sub(stakeRequired)) === 0, 'The users stake should not have been returned');

                // TODO check the other internal mapping is 0
            } catch(e) {
                throw e;
            }
        })

        // it should not be possible for someone to redeem their stake twice
        // it should not be possible for the owner of the coupon to sign txs for more than has been staked to an event
        // it should not be possible for someone other than the owner to be able to sign a valid tx
        // it should not be possible for a valid signature to be redeemed early

        // Even if the owner signs a tx afterwards to release a forfeited stake
    });
});