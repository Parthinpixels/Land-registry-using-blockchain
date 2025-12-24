import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  plugins: [hardhatToolboxMochaEthers],
};

export default config;
