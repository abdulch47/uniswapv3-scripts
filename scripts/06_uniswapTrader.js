// Import ethers from Hardhat, not directly from the ethers package
const { ethers } = require("hardhat");
const IUniswapV3PoolABI = require('../basePoolabi.json');
// const SwapRouterABI = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json').abi;
const SwapRouterABI = require('../baseRouter.json');
const ERC20ABI = require('../ERC20.json'); 
const { getPoolImmutables, getPoolState } = require('./helpers')

async function main() {
    // Use Hardhat's provider and signers
    const [owner, signer2, signer3, signer4] = await ethers.getSigners();
    const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/base/1fafb0aced6bc72f687822748c78b9e8e8b4511d03d7958fafb3f78327ba21bc');

    // Example addresses, replace these with your local Hardhat deployed addresses
    const poolAddress = '0xd0b53D9277642d899DF5C87A3966A349A798F224'; // USDC to WETH pool on base mainnet
    const swapRouterAddress = '0x2626664c2603336E57B271c5C0b26F421741e481'; // Your local Uniswap SwapRouter address
    
    // Initialize contracts with the local signer
    const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
    // console.log("pool", poolContract);
    const swapRouterContract = new ethers.Contract(swapRouterAddress, SwapRouterABI, provider);

 
    const name0 = 'Tether USD';
    const symbol0 = 'USDT';
    const decimals0 = 6;
    const address0 = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

    const name1 = 'USDC';
    const symbol1 = 'USDC';
    const decimals1 = 6;
    const address1 = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; 

    const name3 = 'Wrapped Eth'
    const symbol3 = 'WETH'
    const decimals3 = 18;
    const address3 = '0x4200000000000000000000000000000000000006'; 

    const name4 = 'LinkToken';
    const symbol4 = 'LINK';
    const decimals4 = 18;
    const address4 = '0x7eCc65A5E734a8bcAf24eEA0AC9C7cfE6355bc30'; 

    // Define the swap parameters
    const inputAmount = ethers.utils.parseEther("1.22");
    console.log("Amount eth:", inputAmount.toString())
    const approvalAmount = inputAmount.mul(100000);

    // Approve the SwapRouter to spend token
    const tokenContract0 = new ethers.Contract(address0, ERC20ABI, provider);
    // const tokenContract1 = new ethers.Contract(address4, ERC20ABI, provider);


    // await tokenContract0.connect(signer2).approve(swapRouterAddress, approvalAmount);
    // await tokenContract1.connect(signer2).approve(swapRouterAddress, approvalAmount);

    // Set up swap parameters
    // const immutables = await getPoolImmutables(poolContract);
    // const state = await getPoolState(poolContract);
    const token0 = await poolContract.token0();
    const token1 = await poolContract.token1();
    const fee = await poolContract.fee();
    console.log("Token0", token0);
    console.log("Token1", token1);
    console.log("fee:", fee);
    const tokenContract1 = new ethers.Contract(token1, ERC20ABI, provider);
    console.log("name", await tokenContract1.name());
    const balanceBefore = await tokenContract1.balanceOf(signer2.address);
    console.log('Balance before swap:', balanceBefore.toString());

    const params = {
        tokenIn: token0,
        tokenOut: token1,
        recipient: signer2.address,
        // deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: inputAmount.toString(),
        fee: fee,
        amountOutMinimum: 10000000000,
        sqrtPriceLimitX96: 0,
    };
    const feeData = await provider.getFeeData()
    console.log("Gas",feeData.gasPrice.toString());
    // Execute the swap
    const transaction = await swapRouterContract.connect(signer2).exactInputSingle(params, {
        value: inputAmount.toString(),
        // gasPrice: feeData.gasPrice.toString(), // Set the gas price
        gasPrice: 5593972284,
        gasLimit: 3000000
    });

    console.log(`Transaction hash: ${transaction.hash}`);
    const receipt = await transaction.wait();
    // console.log("reeee", receipt);
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    const balanceAfter = await tokenContract1.balanceOf(signer2.address);
    console.log('Balance after swap:', balanceAfter.toString());

    
    const params1 = {
        tokenIn: token1,
        tokenOut: token0,
        recipient: signer2.address,
        // deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: inputAmount.toString(),
        amountOutMinimum: 10000000000,
        sqrtPriceLimitX96: 0,
    };

    const approval = await tokenContract1.connect(signer2).approve(swapRouterAddress, approvalAmount);
    await approval.wait();
    // Execute the swap
    const transaction1 = await swapRouterContract.connect(signer2).exactInputSingle(params1, {
        gasPrice: 5593972284,
        gasLimit: 3000000
    });

    console.log(`Transaction hash: ${transaction1.hash}`);
    const receipt1 = await transaction1.wait();
    console.log(`Transaction confirmed in block ${receipt1.blockNumber}`);
    const balanceAfter1 = await tokenContract1.balanceOf(signer2.address);
    console.log('Balance after swap:', balanceAfter1.toString());
    console.log("total supply:", await tokenContract1.totalSupply())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
