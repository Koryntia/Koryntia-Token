# Token Contract Deployment - README

## Overview

This repository contains a simple ERC20 token smart contract built using the Solidity programming language. The contract utilizes OpenZeppelin's ERC20 standard implementation and `Ownable` module to ensure ownership control. The token is customizable by name, symbol, and initial supply during deployment, and is deployed using the Hardhat development environment.

### Features

- **ERC20 Token Standard**: Provides basic token functionalities (balance, transfer, approve, etc.) that are compliant with the ERC20 standard.
- **Ownable**: Includes ownership management functionality using OpenZeppelin's `Ownable` contract.
- **Initial Supply**: The token's initial supply is minted and transferred to the specified owner upon contract deployment.

## Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en/) (v16.x or higher)
- [Hardhat](https://hardhat.org/) (v2.x or higher)
- [Solidity](https://soliditylang.org/) (v0.8.x)

### Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/your-repo/erc20-token.git
    cd erc20-token
    ```

2. **Install dependencies**:

    Run the following command to install the necessary node modules (including Hardhat and OpenZeppelin libraries):

    ```bash
    npm install
    ```

3. **Compile the contract**:

    Compile the smart contracts to check for errors and generate the ABI and bytecode:

    ```bash
    npx hardhat compile
    ```

## Token Contract

### Token.sol

The `Token` contract is an implementation of the ERC20 standard with an initial supply and ownership control.

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) Ownable(owner) {
        _mint(owner, initialSupply);
    }
}
```

- **Parameters**:
- `name`: The name of the token (e.g., "MyToken").
- `symbol`: The symbol of the token (e.g., "MTK").
- `initialSupply`: The initial supply of tokens (in smallest unit).
- `owner`: The address of the owner who will receive the initial supply.

## Deployment

### Step-by-step Guide

1. **Create a Hardhat project**:

   If you haven't already initialized a Hardhat project, run the following command in your terminal:

   ```bash
   npx hardhat
   ```

   Follow the instructions to create a new Hardhat project.

2. **Set up Hardhat Configuration**:

   In the `hardhat.config.js` file, ensure that the Solidity version matches the version used in your smart contract (`0.8.24` in this case):

   ```js
   module.exports = {
     solidity: "0.8.24",
   };
   ```

3. **Write a deployment script**:

   In the `scripts/` directory, create a file named `deploy.js` with the following content:

   ```js
   async function main() {
     const [deployer] = await ethers.getSigners();

     console.log("Deploying contracts with the account:", deployer.address);

     const initialSupply = ethers.utils.parseEther("1000000"); // Adjust as needed
     const Token = await ethers.getContractFactory("Token");
     const token = await Token.deploy("MyToken", "MTK", initialSupply, deployer.address);

     console.log("Token deployed to:", token.address);
   }

   main()
     .then(() => process.exit(0))
     .catch((error) => {
       console.error(error);
       process.exit(1);
     });
   ```

4. **Deploy the contract**:

   To deploy the contract to a local Hardhat network, run:

   ```bash
   npx hardhat node
   ```

   In another terminal, deploy the contract:

   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

   Alternatively, you can deploy to a public network like Ethereum, Goerli, or Sepolia by configuring Hardhat to connect to those networks.

### Sample Hardhat Configuration for Goerli

To deploy to Goerli, update your `hardhat.config.js` to include the Goerli network configuration:

```js
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.24",
  networks: {
    goerli: {
      url: "https://eth-goerli.alchemyapi.io/v2/YOUR_ALCHEMY_API_KEY",
      accounts: [`0x${YOUR_PRIVATE_KEY}`],
    },
  },
};
```

Make sure to replace `YOUR_ALCHEMY_API_KEY` and `YOUR_PRIVATE_KEY` with your actual Alchemy API key and Ethereum wallet private key.

Run the following to deploy to Goerli:

```bash
npx hardhat run scripts/deploy.js --network goerli
```

## Testing

### Write Unit Tests

You can write unit tests using Hardhat's `waffle` library and the Mocha/Chai framework.

Example test:

```js
const { expect } = require("chai");

describe("Token", function () {
  it("Should deploy the token and assign initial supply to owner", async function () {
    const [owner] = await ethers.getSigners();
    const initialSupply = ethers.utils.parseEther("1000000");

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("MyToken", "MTK", initialSupply, owner.address);

    const ownerBalance = await token.balanceOf(owner.address);
    expect(await token.totalSupply()).to.equal(ownerBalance);
  });
});
```

Run tests using:

```bash
npx hardhat test
```
