import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { toUtf8Bytes } from "ethers/lib/utils";

const formatNftBalance = async(contract: Contract, user: string, id: number): Promise<number> => {
    let balance = ethers.utils.formatEther(await contract.balanceOf(user, id));
    return Number(balance) * 10**18;
}

describe("NFTFactory", () => {

    let jack: Contract;
    let jackV2: Contract;
    let sally: Contract;
    let sallyV2: Contract;

    let owner: SignerWithAddress;
    let alice: SignerWithAddress;

    beforeEach(async() => {
        const NFTFactory = await ethers.getContractFactory("NFTFactory");
        const NFTFactoryV2 = await ethers.getContractFactory("NFTFactoryV2");
        [owner, alice] = await ethers.getSigners();
        jack = await upgrades.deployProxy(NFTFactory, ["jack.token"]);
        jackV2 = await upgrades.upgradeProxy(jack.address, NFTFactoryV2);
        sally = await upgrades.deployProxy(NFTFactory, ["sally.token"]);
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

        it("should pause and unpause nft tx", async() => {
            // check transfers okay
            await jackV2.safeTransferFrom(owner.address, alice.address, 0, 1, toUtf8Bytes(""))
            
            await jackV2.pause()
            await expect(jackV2.safeTransferFrom(owner.address, alice.address, 0, 1, toUtf8Bytes("")))
                .to.be.revertedWith("ERC1155Pausable: token transfer while paused")

            await jackV2.unpause()
            expect(await jackV2.safeTransferFrom(owner.address, alice.address, 0, 1, toUtf8Bytes("")))
                .to.be.ok
        })
    })

    describe("Access Control", async() => {
        let minter
        let pauser

        beforeEach(async() => {
            minter = await jackV2.MINTER_ROLE()
            pauser = await jackV2.PAUSER_ROLE()
            await jackV2.grantRole(minter, alice.address)
            await jackV2.grantRole(pauser, alice.address)
        })

        it("should revoke role in V2 and reflect in base", async() => {
            await jackV2.revokeRole(minter, alice.address)
            await expect(jack.connect(alice).mint(owner.address, 1, 1, toUtf8Bytes("")))
                .to.be.revertedWith("NFTFactory: must have minter role to mint")
        })

        it("should renounce role in base and extend to V2", async() => {
            await jack.connect(alice).renounceRole(pauser, alice.address)
            await expect(jackV2.connect(alice).pause())
                .to.be.revertedWith("NFTFactory: must have pauser role to pause")
        })
    })
})