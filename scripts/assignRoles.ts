import { ethers } from "hardhat";
import PmknTokenV2 from "../artifacts/contracts/v2/PmknTokenV2.sol/PmknTokenV2.json";
import NFTFactoryV2 from "../artifacts/contracts/v2/NFTFactoryV2.sol/NFTFactoryV2.json";

const PMKNTOKEN = "INSERT_ADDRESS"
const NFTFACTORY = "INSERT_ADDRESS"
const PMKNFARM = "INSERT_ADDRESS"

const minter = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
const pauser = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PAUSER_ROLE"));

const main = async() => {
    const pmknToken = await ethers.getContractAt(PmknTokenV2["abi"], PMKNTOKEN);
    const nftFactory = await ethers.getContractAt(NFTFactoryV2["abi"], NFTFACTORY);

    await pmknToken.grantRole(minter, PMKNFARM);
    console.log(`PmknToken minter role assigned to ${PMKNFARM}`);

    await nftFactory.grantRole(minter, PMKNFARM);
    await nftFactory.grantRole(pauser, PMKNFARM);
    console.log(`NFTFactory minter and pauser role assigned to ${PMKNFARM}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error)
        process.exit(1)
    });
