let GetTogetherCoupon = artifacts.require("./GetTogetherCoupon.sol");
let MockGetTogether = artifacts.require("./MockGetTogether.sol");
const assert = require('chai').assert;

const noExceptionError = new Error("should not have reached this point");

contract('Coupon', async (accounts) => {

    let owner = accounts[0];
    let couponInstance;
    let mockGetTogetherInstance;

    before('Create contract instances', async () => {
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

        it('should not be possible to withdraw more ether than is available (when some is staked)', async () => {

        });
    })
});