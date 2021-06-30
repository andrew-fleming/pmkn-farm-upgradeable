import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { Contract, BigNumber } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { toUtf8Bytes } from "ethers/lib/utils";

const formatNftBalance = async(contract: Contract, user: string, id: Number) => {
    let balance = ethers.utils.formatEther(await contract.balanceOf(user, id));
    return Number(balance) * 10**18;
}

describe("PmknFarm", () => {

    let jack: Contract;
    let jackV2: Contract;
    let sally: Contract;
    let sallyV2: Contract;

    let owner: SignerWithAddress;
    let alice: SignerWithAddress;

    let res: any;

    beforeEach(async() => {
        const NFTFactory = await ethers.getContractFactory("NFTFactory");
        const NFTFactoryV2 = await ethers.getContractFactory("NFTFactoryV2");
        [owner, alice] = await ethers.getSigners();
        jack = await upgrades.deployProxy(NFTFactory, ["Jack"]);
        jackV2 = await upgrades.upgradeProxy(jack.address, NFTFactoryV2);
        sally = await upgrades.deployProxy(NFTFactory, ["Sally"]);
        sallyV2 = await upgrades.upgradeProxy(sally.address, NFTFactoryV2);
    })

    describe("Init", async() => {

        it("should init", async() => {
            expect(jack).to.be.ok
            expect(sally).to.be.ok
        })
    })

    describe("Mint", async() => {

        it("should mint from V2 contract and reflect balance in base contract", async() => {
            //console.log(nftFactory)
            let jackData = "jack"
            await jackV2.mint(owner.address, 0, 5, toUtf8Bytes(jackData))
            await sallyV2.mint(alice.address, 0, 6, toUtf8Bytes(jackData))

            expect(await formatNftBalance(jack, owner.address, 0))
                .to.eq(5)
            expect(await formatNftBalance(sally, alice.address, 0))
                .to.eq(6)
        })
    })

    describe("Pause", async() => {
        let pauser;

        beforeEach(async() => {
            pauser = await jackV2.PAUSER_ROLE()
            await jackV2.grantRole(pauser, owner.address)
            await jackV2.mint(owner.address, 0, 5, toUtf8Bytes(""))
            await sallyV2.mint(alice.address, 0, 6, toUtf8Bytes(""))
        })
        it("should grant pauser role in V2 and reflect in base state", async() => {
            await jack.hasRole(pauser, owner.address)
        })

        it("should pause nft tx's", async() => {
            // check transfers okay
            await jackV2.safeTransferFrom(owner.address, alice.address, 0, 1, toUtf8Bytes(""))
            
            await jackV2.pause()
            await expect(jackV2.safeTransferFrom(owner.address, alice.address, 0, 1, toUtf8Bytes("")))
                .to.be.revertedWith("ERC1155Pausable: token transfer while paused")


        })
    })
})