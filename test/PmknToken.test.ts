import { ethers, upgrades } from "hardhat";
import { expect} from "chai";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";



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

        //pmknToken = await PmknToken.deploy()
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

        it("should grant minter role", async() => {
            let minter = await pmknTokenV2.MINTER_ROLE()
            await pmknToken.grantRole(minter, alice.address)
            expect(await pmknToken.hasRole(minter, alice.address))
                .to.eq(true)
        })
    })

})