let BlockTogether = artifacts.require("./BlockTogether.sol");
let GetTogetherCoupon = artifacts.require("./GetTogetherCoupon.sol");

contract('BlockTogether', async (accounts) => {

    let owner = accounts[0];
    let couponInstance;
    let blockTogetherInstance;

    before('Retrieve contract instances', async () => {
        couponInstance = await GetTogetherCoupon.new();
        //console.log(couponInstance);

    });

    describe('', () => {
        it('', async () => {
            console.log(couponInstance);
        });
    });
});