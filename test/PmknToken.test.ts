import { ethers, upgrades } from "hardhat";
import { expect} from "chai";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


describe("PmknToken Deployment", () => {
    let owner: SignerWithAddress;
    let pmknToken: Contract;

    beforeEach(async() => {
        const PmknToken = await ethers.getContractFactory("PmknToken");
        [owner] = await ethers.getSigners();
        pmknToken = await PmknToken.deploy();
    })

    describe("Init", async() => {
        it("should init", async() => {
            expect(pmknToken).to.be.ok
        })
    })
})


describe("PmknToken Contract", () => {

    let owner: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;

    let pmknToken: Contract;
    let pmknTokenV2: Contract;

    before(async() => {
        const PmknToken = await ethers.getContractFactory("PmknToken");
        const PmknTokenV2 = await ethers.getContractFactory("PmknTokenV2");

        [owner, alice, bob] = await ethers.getSigners();

        pmknToken = await upgrades.deployProxy(PmknToken, [owner.address, "PmknToken", "PMKN"]);
        pmknTokenV2 = await upgrades.upgradeProxy(pmknToken.address, PmknTokenV2);
    })

    describe("Init", async() => {
        it("should deploy", async() => {
            expect(pmknToken).to.be.ok
            expect(pmknTokenV2).to.be.ok
            expect(await pmknToken.name())
                .to.eq("PmknToken")
            expect(await pmknTokenV2.name())
                .to.eq("PmknToken")
        })

        it("should have the same address", async() => {
            expect(pmknToken.address).to.eq(pmknTokenV2.address)
        })
    })

    describe("Access Control", async() => {
        it("should grant minter role", async() => {
            let minter = await pmknTokenV2.MINTER_ROLE()
            await pmknToken.grantRole(minter, alice.address)
            expect(await pmknToken.hasRole(minter, alice.address))
                .to.eq(true)
        })

        it("should mint tokens from minter after assigned role", async() => {
            let minter = await pmknTokenV2.MINTER_ROLE()
            await pmknTokenV2.grantRole(minter, alice.address)
            await pmknTokenV2.connect(alice).mint(owner.address, 1)
            expect(await pmknTokenV2.balanceOf(owner.address))
                .to.eq(1)

            expect(await pmknToken.balanceOf(owner.address))
                .to.eq(1)
        })

        it("should revert for non-minter", async() => {
            await expect(pmknTokenV2.mint(alice.address, 1))
                .to.be.revertedWith("Must have minter role to mint")
        })
    })

})