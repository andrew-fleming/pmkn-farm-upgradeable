# pmkn-farm-upgradeable

This repo uses OpenZeppelin's proxy-pattern protocol for upgradeability and mimics the original [PmknFarm yield farming dApp](https://github.com/andrew-fleming/pmkn-farm). 

## Prerequisites
```
NodeJS and NPM >= 7.5.0
```
***
## Installation
In directory root:
```
npm i
```
***
## Testing
```
npx hardhat test
```
***
## Deployment
### Prerequisites
This dApp accepts DAI as its staking token; therefore, you'll need to acquire Kovan DAI if you deploy to Kovan (as it's preconfigured). To attain kDAI, you'll need to lock kETH in a Maker vault in exchange for kDAI.
* Network Provider
    * Infura.io
    * Alchemy.com
* MetaMask 
    * MetaMask.io
* Kovan DAI 
    * https://oasis.app/borrow?network=kovan
* Kovan LINK
    * https://kovan.chain.link/

The Hardhat configuration file and scripts have been set up to deploy on the Kovan testnet. Use the .env_sample as a template for the requisite API_KEY and PRIVATE_KEY. Infura and Alchemy offer free API access to testnets and mainnet. Once you have an API endpoint and your private key from MetaMask, create a dotenv file within the PmknFarm root:

```
touch .env
```
Populate the .env with your API_KEY and PRIVATE_KEY. 
<br>
_*If you're posting on GitHub, DO NOT FORGET to .gitignore the dotenv(.env) file!_
<br>
<br>
Uncomment out the Kovan network details in hardhat.config.ts:

In the PmknFarm root, run:
```
npx hardhat run scripts/deployFarm.ts --network kovan
```
## Upgrades
Your terminal will display the contract addresses upon deployment. Copy/paste them to the requisite variable in scripts/deployUpgrade.ts
```
const PMKNTOKEN = "INSERT_DEPLOYED_ADDRESS"
const NFTFACTORY = "INSERT_DEPLOYED_ADDRESS"
const PMKNFARM = "INSERT_DEPLOYED_ADDRESS"
```
Thereafter, run the deployUpgrade script.
```
npx hardhat run scripts/deployUpgrade.ts --network kovan
```
## Role Assignment
The PmknFarm and Lottery contracts will not run properly unless they are assigned as minters for PmknToken and NFTFactory. Insert the requisite contract addresses in the proper variables inside scripts/assignRoles.ts. Finally, run the script. 

```
npx hardhat run scripts/assignRoles.ts --network kovan
```
