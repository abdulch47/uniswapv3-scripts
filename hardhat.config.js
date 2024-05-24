require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 5000,
        details: { yul: false },
      },
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc.ankr.com/base/1fafb0aced6bc72f687822748c78b9e8e8b4511d03d7958fafb3f78327ba21bc",
        blockNumber: 1361947,
      }
    }
  }
};