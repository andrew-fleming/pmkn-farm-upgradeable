import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("PmknFarm", () => {

    let pmknFarm: Contract;
    let pmknFarmV2: Contract;
    let mockDai: Contract;

    let owner: SignerWithAddress;
    let alice: SignerWithAddress;

    let res: any;

    beforeEach(async() => {
        const PmknFarm = await ethers.getContractFactory("PmknFarm");
        const PmknFarmV2 = await ethers.getContractFactory("PmknFarmV2");
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        [owner, alice] = await ethers.getSigners();
        mockDai = await MockERC20.deploy("MockDai", "mDAI");
        let daiAmount = ethers.utils.parseEther("999")
        await Promise.all([
            mockDai.approve(owner.address, daiAmount),
            mockDai.approve(alice.address, daiAmount),
            mockDai.mint(owner.address, daiAmount),
            mockDai.mint(alice.address, daiAmount)
        ])
        pmknFarm = await upgrades.deployProxy(PmknFarm, [owner.address, mockDai.address]);
        pmknFarmV2 = await upgrades.upgradeProxy(pmknFarm.address, PmknFarmV2);
})

    describe("Stake", async() => {
        it("should update isStaking", async() => {
            await mockDai.approve(pmknFarm.address, 1)
            await pmknFarmV2.stake(1)
            
            expect(await pmknFarmV2.getIsStaking(owner.address))
                .to.eq(true)
        })

        it("should update balance", async() => {
            let amount = ethers.utils.parseEther("50")
            await mockDai.approve(pmknFarm.address, amount)
            await pmknFarmV2.stake(amount)
            expect(await pmknFarmV2.getStakingBalance(owner.address))
                .to.eq(amount)

            await mockDai.approve(pmknFarm.address, amount)
            await pmknFarmV2.stake(amount)
            expect(await pmknFarmV2.getStakingBalance(owner.address))
                .to.eq(ethers.utils.parseEther("100"))
        })

        it("should revert", async() => {
            await expect(pmknFarmV2.stake(0))
                .to.be.revertedWith("Either amount or balance is 0")
        })

        it("should emit event", async() => {
            let toTransfer = ethers.utils.parseEther("10")
            await mockDai.approve(pmknFarm.address, toTransfer)

            await expect(pmknFarmV2.stake(toTransfer))
                .to.emit(pmknFarmV2, 'Stake')
                .withArgs(owner.address, toTransfer);
        })
    })

    describe("Unstake", async() => {
        let toTransfer = ethers.utils.parseEther("10")
 
        beforeEach(async() => {
            await mockDai.approve(pmknFarm.address, toTransfer)
            await pmknFarmV2.stake(toTransfer)
        })

        it("should unstake total", async() => {
            await pmknFarmV2.unstake(toTransfer)
            expect(await pmknFarmV2.getStakingBalance(owner.address))
                .to.eq(0)
        })

        it("should unstake partial", async() => {
            let partialUnstake = ethers.utils.parseEther("3")
            await pmknFarmV2.unstake(partialUnstake)
            expect(await pmknFarmV2.getStakingBalance(owner.address))
                .to.eq(ethers.utils.parseEther("7"))
        })

        it("should emit Unstake event", async() => {
            expect(await pmknFarmV2.unstake(toTransfer))
                .to.emit(pmknFarmV2, "Unstake")
                .withArgs(owner.address, toTransfer)
        })
    })




})