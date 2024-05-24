const { waffle, ethers } = require("hardhat");

// Token addresses
TETHER_ADDRESS= '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d'
// USDC_ADDRESS= '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'
// WRAPPED_BITCOIN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'

// Uniswap contract address
WETH_ADDRESS= '0x4200000000000000000000000000000000000006'
FACTORY_ADDRESS= '0x33128a8fC17869897dcE68Ed026d694621f6FDfD'
SWAP_ROUTER_ADDRESS= '0x2626664c2603336E57B271c5C0b26F421741e481'
// NFT_DESCRIPTOR_ADDRESS= '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
// POSITION_DESCRIPTOR_ADDRESS= '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
POSITION_MANAGER_ADDRESS= '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1'

const artifacts = {
  // UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  // NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};
const UniswapV3Factory = require('../baseFactory.json');
const NonfungiblePositionManager = require('../basePositionManager.json');

const { Contract, BigNumber } = require("ethers")
const bn = require('bignumber.js')
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

const provider = waffle.provider;

function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}

const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,
  NonfungiblePositionManager,
  provider
)
const factory = new Contract(
  FACTORY_ADDRESS,
  UniswapV3Factory,
  provider
)

console.log("fac aBi", factory);

async function deployPool(token0, token1, fee, price) {
  const [owner] = await ethers.getSigners();
  const createPool = await nonfungiblePositionManager.connect(owner).createAndInitializePoolIfNecessary(
    token0,
    token1,
    fee,
    price,
    { gasLimit: 5000000 }
  )
  const receipt = await createPool.wait();
  console.log("Pool created", receipt);
  const poolAddress = await factory.getPool(
    token0,
    token1,
    fee,
  )
  console.log("pool address:", poolAddress);
  if (poolAddress === ethers.constants.AddressZero) {
    throw new Error(`Pool not created or found for tokens ${token0} and ${token1} with fee ${fee}`);
  }
  return poolAddress;
}


async function main() {
  const usdtEth500 = await deployPool(TETHER_ADDRESS, WETH_ADDRESS, 500, encodePriceSqrt(1, 1))
  console.log('USDT_WETH_500=', `'${usdtEth500}'`)
}

/*
npx hardhat run --network localhost scripts/03_deployPools.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });