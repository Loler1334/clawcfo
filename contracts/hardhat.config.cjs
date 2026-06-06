require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const privateKey = process.env.AGENT_PRIVATE_KEY
  ? process.env.AGENT_PRIVATE_KEY.startsWith("0x")
    ? process.env.AGENT_PRIVATE_KEY
    : `0x${process.env.AGENT_PRIVATE_KEY}`
  : undefined;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  defaultNetwork: "mantleSepolia",
  networks: {
    mantleSepolia: {
      url: process.env.MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz",
      chainId: 5003,
      accounts: privateKey ? [privateKey] : [],
    },
    mantle: {
      url: "https://rpc.mantle.xyz",
      chainId: 5000,
      accounts: privateKey ? [privateKey] : [],
    },
  },
  etherscan: {
    apiKey: {
      mantleSepolia: process.env.MANTLES_CAN_API_KEY ?? "placeholder",
      mantle: process.env.MANTLES_CAN_API_KEY ?? "placeholder",
    },
    customChains: [
      {
        network: "mantleSepolia",
        chainId: 5003,
        urls: {
          apiURL: "https://api-sepolia.mantlescan.xyz/api",
          browserURL: "https://sepolia.mantlescan.xyz",
        },
      },
      {
        network: "mantle",
        chainId: 5000,
        urls: {
          apiURL: "https://api.mantlescan.xyz/api",
          browserURL: "https://mantlescan.xyz",
        },
      },
    ],
  },
};
