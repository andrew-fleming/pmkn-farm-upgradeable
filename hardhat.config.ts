import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-web3";
import "hardhat-gas-reporter";
import "solidity-coverage";
require('dotenv').config();


export default {
  solidity: "0.8.4",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 20
  },
  networks: {
    hardhat: {},
    kovan: {
      url: process.env.API_KEY,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    }
  }
};