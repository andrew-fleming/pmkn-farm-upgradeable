import { ethers, upgrades } from "hardhat";

const PMKNTOKEN = "INSERT_DEPLOYED_ADDRESS"
const NFTFACTORY = "INSERT_DEPLOYED_ADDRESS"
const PMKNFARM = "INSERT_DEPLOYED_ADDRESS"

const main = async() => {
    const PmknTokenV2 = await ethers.getContractFactory("PmknTokenV2");
    await upgrades.upgradeProxy(PMKNTOKEN, PmknTokenV2);
    console.log("PmknToken upgraded...")

    const NFTFactoryV2 = await ethers.getContractFactory("NFTFactoryV2");
    await upgrades.upgradeProxy(NFTFACTORY, NFTFactoryV2);
    console.log("NFTFactory upgraded...")

    const PmknFarmV2 = await ethers.getContractFactory("PmknFarmV2");
    await upgrades.upgradeProxy(PMKNFARM, PmknFarmV2);
    console.log("PmknFarm upgraded...")

    console.log("Upgrade complete.")
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error)
        process.exit(1)
    })