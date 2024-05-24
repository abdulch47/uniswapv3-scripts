// Token addresses
TETHER_ADDRESS= '0x0165878A594ca255338adfa4d48449f69242Eb8F'
USDC_ADDRESS= '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'
WRAPPED_BITCOIN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
WRAPPED_ETH_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'


const { Contract } = require("ethers")

const artifacts = {
    Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
    Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
    WrappedBTC: require("../artifacts/contracts/WrappedBitcoin.sol/WrappedBitcoin.json")
  };


async function main(){
    const [owner,signer2] = await ethers.getSigners();
    const provider = waffle.provider;

    const usdtContract = new Contract(TETHER_ADDRESS,artifacts.Usdt.abi,provider)
    const usdcContract = new Contract(USDC_ADDRESS,artifacts.Usdc.abi,provider)
    const BtcContract = new Contract(WRAPPED_BITCOIN_ADDRESS,artifacts.WrappedBTC.abi,provider)
    const WrappedETH = new Contract(WRAPPED_ETH_ADDRESS,artifacts.WrappedBTC.abi,provider)

    UsdtBalance = await usdtContract.balanceOf(signer2.address)
    UsdcBalance = await usdcContract.balanceOf(signer2.address)
    BtcBalance = await BtcContract.balanceOf(signer2.address)
    WrapEThBalance = await WrappedETH.balanceOf(owner.address)

    console.log('USDT Value=', `'${UsdtBalance}'`)
    console.log('USDC Value=', `'${UsdcBalance}'`)
    console.log('WrappedBTC Value=', `'${BtcBalance}'`)
    console.log('WrappedETH Value=', `'${WrapEThBalance}'`)
}

/*
npx hardhat run --network localhost scripts/checkBalances.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });