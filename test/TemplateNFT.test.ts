import { ethers, upgrades } from "hardhat";
import { expect} from "chai";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


describe("Template NFT", () => {
    let owner: SignerWithAddress;
    let alice: SignerWithAddress;
    let templateNFT: Contract;
    let templateNFTV2: Contract;
    let templateNFTV3: Contract;
    let nftFactory: Contract;
    let nftFactoryV2: Contract;

    beforeEach(async() => {
        const TemplateNFT = await ethers.getContractFactory("TemplateNFT");
        const TemplateNFTV2 = await ethers.getContractFactory("TemplateNFTV2");
        const TemplateNFTV3 = await ethers.getContractFactory("TemplateNFTV2");
        const NFTFactory = await ethers.getContractFactory("NFTFactory");
        const NFTFactoryV2 = await ethers.getContractFactory("NFTFactoryV2");
        [owner, alice] = await ethers.getSigners();
        nftFactory = await upgrades.deployProxy(NFTFactory, ["Jack"]);
        nftFactoryV2 = await upgrades.upgradeProxy(nftFactory.address, NFTFactoryV2);
        templateNFT = await upgrades.deployProxy(TemplateNFT, [nftFactory.address]);
        templateNFTV2 = await upgrades.upgradeProxy(templateNFT.address, TemplateNFTV2);
        templateNFTV3 = await upgrades.upgradeProxy(templateNFT.address, TemplateNFTV3);
        let setter = await templateNFTV2.NFT_SETTER();
        await templateNFTV2.grantRole(setter, owner.address);
    })

    describe("Init", async() => {
        it("should init", async() => {
            expect(templateNFT).to.be.ok
            expect(templateNFTV2).to.be.ok
        })
    })

    describe("SetNFT", async() => {
        it("should store struct", async() => {
            let data = ethers.utils.solidityKeccak256([ "string" ], [ "data" ])
            let nftArgs = ["NewNFT", data, 1]
            await templateNFTV2.setNFT(...nftArgs)
            let res = await templateNFTV2.getNFT(0)

            expect(res[0]).to.eq(nftArgs[0])
            expect(res[1]).to.eq(nftArgs[1])
            expect(res[2]).to.eq(nftArgs[2])
        })

        it("should store multiple nft templates and update count", async() => {
            let data1 = ethers.utils.solidityKeccak256(["string"], ["data1"])
            let data2 = ethers.utils.solidityKeccak256(["string"], ["data2"])
            let data3 = ethers.utils.solidityKeccak256(["string"], ["data3"])
            let nftArgs1 = ["NewNFT1", data1, 1]
            let nftArgs2 = ["NewNFT1", data2, 5]
            let nftArgs3 = ["NewNFT1", data3, 10]

            expect(await templateNFT.nftCount())
                .to.eq(0)

            await Promise.all([
                templateNFTV2.setNFT(...nftArgs1),
                templateNFTV2.setNFT(...nftArgs2),
                templateNFTV2.setNFT(...nftArgs3),
            ])
            let res1 = await templateNFTV2.getNFT(0)
            let res2 = await templateNFTV2.getNFT(1)
            let res3 = await templateNFTV2.getNFT(2)

            expect(res1[0])
                .to.eq("NewNFT1")

            expect(res2[1])
                .to.eq(data2)

            expect(res3[2])
                .to.eq(10)

            // Check count
            expect(await templateNFT.nftCount())
                .to.eq(3)
        })

        it("should get V2's nft in V3", async() => {
            let data = ethers.utils.solidityKeccak256([ "string" ], [ "data" ])
            let nftArgs = ["NewNFT", data, 1]
            await templateNFTV2.setNFT(...nftArgs)
            let res = await templateNFTV3.getNFT(0)

            expect(res[0]).to.eq(nftArgs[0])
            expect(res[1]).to.eq(nftArgs[1])
            expect(res[2]).to.eq(nftArgs[2])
        })

        it("should revert non-setter", async() => {
            let data = ethers.utils.solidityKeccak256([ "string" ], [ "data" ])
            let nftArgs = ["NewNFT", data, 1]
            await expect(templateNFTV2.connect(alice).setNFT(...nftArgs))
                .to.be.revertedWith("TemplateNFTV2: must have setter role to set nft")
        })
    })

    describe("MintSetNFT", async() => {
        beforeEach(async() => {
            let minter = await templateNFTV2.MINTER_ROLE()
            await templateNFTV2.grantRole(minter, alice.address)
            await nftFactoryV2.grantRole(minter, templateNFT.address)
        })

        it("should mint nft", async() => {
            await templateNFTV2.connect(alice).mintSetNFT(owner.address, 1)
            expect(await nftFactory.balanceOf(owner.address, 0))
                .to.eq(1)
        })

        it("should mint multiple nfts", async() => {
            await templateNFTV2.connect(alice).mintSetNFT(owner.address, 25)
            expect(await nftFactory.balanceOf(owner.address, 0))
                .to.eq(25)
        })
    })
})