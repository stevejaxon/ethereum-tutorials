let GetTogetherCoupon = artifacts.require("./GetTogetherCoupon.sol");
const assert = require('chai').assert;

contract('Coupon', async (accounts) => {

    let owner = accounts[0];
    let couponInstance;

    before('Create contract instances', async () => {
        couponInstance = await GetTogetherCoupon.new();
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

        });

        it('should be possible to withdraw all ether over the course of multiple transactions', async () => {

        });

        it('should be possible to withdraw part of the ether over the course of multiple transactions', async () => {

        });

        it('should not be possible to withdraw more ether than is available (not staked)', async () => {

        });

        it('should not be possible to withdraw more ether than is available (when some is staked)', async () => {

        });
    })
});