import { ethers, upgrades } from "hardhat";
import { lottoConfig, farmConfig } from "./config";

const nftPrice = ethers.utils.parseEther("1");

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log(`Deploying contracts with ${deployer.address}`);

    const PmknToken = await ethers.getContractFactory("PmknToken");
    const pmknToken = await upgrades.deployProxy(PmknToken, [deployer.address, "PmknToken", "PMKN"]);
    await pmknToken.deployed();
    console.log(`PmknToken address: ${pmknToken.address}`);

    const NFTFactory = await ethers.getContractFactory("NFTFactory");
    const nftFactory = await upgrades.deployProxy(NFTFactory, ["Jack-O-Lanter", "JACK", "jack.token", nftPrice]);
    await nftFactory.deployed();
    console.log(`NFTFactory address: ${nftFactory.address}`);

    const Lottery = await ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy(nftFactory.address, pmknToken.address, ...lottoConfig);
    console.log(`Lottery address: ${lottery.address}`);

    const PmknFarm = await ethers.getContractFactory("PmknFarm");
    const pmknFarm = await upgrades.deployProxy(PmknFarm, 
        [
            deployer.address, 
            ...farmConfig, 
            pmknToken.address, 
            nftFactory.address, 
            lottery.address
        ]
    );
    await pmknFarm.deployed();
    console.log(`PmknFarm address: ${pmknFarm.address}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error)
        process.exit(1)
    })