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

    describe('Purchase tests', () => {
        it('should be possible to purchase coupons in one single transfer', async () => {

        });

        it('should be possible to incrementally purchase coupons in multiple transfers', async () => {

        });
    });

    describe('Withdraw tests', () => {
        it('should be possible to withdraw all ether in on single transaction', async () => {

        });

        it('should be possible to withdraw all ether over the course of multiple transactions', async () => {

        });
    })
});