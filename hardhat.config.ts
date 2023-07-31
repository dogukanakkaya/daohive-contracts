import 'dotenv/config'
import "tsconfig-paths/register";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import { POLYGONSCAN_API_KEY, POLYGON_MUMBAI_RPC_PROVIDER } from './config';

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    mumbai: {
      accounts: [],
      url: POLYGON_MUMBAI_RPC_PROVIDER
    }
  },
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY
  }
};

export default config;
