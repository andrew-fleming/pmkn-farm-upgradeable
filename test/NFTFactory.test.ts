import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("NFTFactory", () => {

    let jack: Contract;
    let jackV2: Contract;
    let sally: Contract;
    let sallyV2: Contract;

    let owner: SignerWithAddress;
    let alice: SignerWithAddress;

    const minter = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
    const pauser = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PAUSER_ROLE"));
    const jackPrice = ethers.utils.parseEther("5");
    const sallyPrice = ethers.utils.parseEther("5");


    beforeEach(async() => {
        const NFTFactory = await ethers.getContractFactory("NFTFactory");
        const NFTFactoryV2 = await ethers.getContractFactory("NFTFactoryV2");
        [owner, alice] = await ethers.getSigners();
        jack = await upgrades.deployProxy(NFTFactory, ["Jack-O-Lantern", "JACK", "jack.token", jackPrice]);
        jackV2 = await upgrades.upgradeProxy(jack.address, NFTFactoryV2);
        sally = await upgrades.deployProxy(NFTFactory, ["Sally-O-Lantern", "SALLY", "sally.token", sallyPrice]);
        sallyV2 = await upgrades.upgradeProxy(sally.address, NFTFactoryV2);
        await jackV2.grantRole(minter, owner.address)
        await sallyV2.grantRole(minter, alice.address)
    })

    describe("Init", async() => {
        it("should init", async() => {
            expect(jack).to.be.ok
            expect(sally).to.be.ok
        })

        it("should display minter role", async() => {
            expect(await jack.hasRole(minter, owner.address))
                .to.be.true
            
            expect(await sally.hasRole(minter, alice.address))
                .to.be.true
        })
    })

    describe("Mint", async() => {
        it("should mint tokens", async() => {
            await jackV2.mint(alice.address)
            expect(await jack.balanceOf(alice.address))
                .to.eq(1)
        })

        it("should return total supply", async() => {
            await jackV2.mint(alice.address)
            await jackV2.mint(alice.address)
            await jackV2.mint(owner.address)
            expect(await jack.totalSupply())
                .to.eq(3)
        })

        it("should enumerate tokenIds", async() => {
            await jackV2.mint(alice.address)
            await jackV2.mint(alice.address)
            await jackV2.mint(owner.address)
            let res = await jack.tokenOfOwnerByIndex(owner.address, 0)
            expect(res).to.eq(2)

        })

        it("should revert mint from non-minter", async() => {
            await expect(jackV2.connect(alice).mint(owner.address))
                .to.be.reverted
        })
    })

    describe("Pause", async() => {
        beforeEach(async() => {
            await jackV2.grantRole(pauser, alice.address)
        })

        it("should assign pause role", async() => {
            expect(await jack.hasRole(pauser, alice.address))
                .to.be.true
        })

        it("should pause", async() => {
            await jackV2.connect(alice).pause()
            await expect(jack.mint(owner.address))
                .to.be.reverted
        })

        it("should pause and unpause", async() => {
            await jackV2.connect(alice).pause()
            await expect(jack.mint(owner.address))
                .to.be.reverted
            await jackV2.connect(alice).unpause()
            expect(await jack.mint(owner.address))
                .to.be.ok
        })
    })
})