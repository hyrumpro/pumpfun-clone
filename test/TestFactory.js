const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenFactory", function () {
    // Keep original working tests
    it("Should Create The memecoin Properly", async function() {
        const tokenFactoryct = await hre.ethers.deployContract("TokenFactory");
        const tx = await tokenFactoryct.createMemeToken("DogeCoin", "DOGE", "This its a doge Token", "image.png", {
            value: hre.ethers.parseEther("0.0001")
        });
    });

    it("Should let the user purchase memetoken", async function() {
        const tokenFactoryct = await hre.ethers.deployContract("TokenFactory");
        const tx = await tokenFactoryct.createMemeToken("DogeCoin", "DOGE", "This its a doge Token", "image.png", {
            value: hre.ethers.parseEther("0.0001")
        });
        const memetoken = await tokenFactoryct.memeTokenAddresses(0);

        const tx2 = await tokenFactoryct.buyMemeToken(memetoken, 800000, {
            value: hre.ethers.parseEther("24")
        });
    });

    // Fixed tests
    it("Should fail if creation fee is insufficient", async function() {
        const tokenFactoryct = await hre.ethers.deployContract("TokenFactory");
        await expect(
            tokenFactoryct.createMemeToken("DogeCoin", "DOGE", "Test", "image.png", {
                value: hre.ethers.parseEther("0.00001")
            })
        ).to.be.revertedWith("Invalid fee");
    });

    it("Should fail when buying non-existent token", async function() {
        const tokenFactoryct = await hre.ethers.deployContract("TokenFactory");
        const zeroAddress = "0x0000000000000000000000000000000000000000";
        await expect(
            tokenFactoryct.buyMemeToken(zeroAddress, 1000, {
                value: hre.ethers.parseEther("1")
            })
        ).to.be.revertedWith("Token not listed");
    });

    it("Should fail when non-owner tries to withdraw fees", async function() {
        const [owner, nonOwner] = await hre.ethers.getSigners();
        const tokenFactoryct = await hre.ethers.deployContract("TokenFactory");
        
        await expect(
            tokenFactoryct.connect(nonOwner).withdrawFees()
        ).to.be.revertedWith("Not owner");
    });

    it("Should allow owner to withdraw fees", async function() {
        const [owner] = await hre.ethers.getSigners();
        const tokenFactoryct = await hre.ethers.deployContract("TokenFactory");
        
        // Create token and pay fee
        await tokenFactoryct.createMemeToken("Test", "TST", "Test Token", "test.png", {
            value: hre.ethers.parseEther("0.0001")
        });
    
        // Get contract balance before withdrawal
        const contractBalance = await hre.ethers.provider.getBalance(tokenFactoryct.target);
        expect(contractBalance).to.equal(hre.ethers.parseEther("0.0001"));
    
        // Get owner balance before withdrawal
        const balanceBefore = await hre.ethers.provider.getBalance(owner.address);
        
        // Withdraw fees and get transaction receipt for gas calculation
        const tx = await tokenFactoryct.withdrawFees();
        const receipt = await tx.wait();
        
        // Calculate gas cost
        const gasCost = receipt.gasUsed * receipt.gasPrice;
        
        // Get final balance
        const balanceAfter = await hre.ethers.provider.getBalance(owner.address);
        
        // Final balance should equal: initial balance + fees - gas costs
        expect(balanceAfter).to.equal(
            balanceBefore + contractBalance - gasCost
        );
    });
    

    it("Should create liquidity pool after reaching funding goal", async function() {
        const tokenFactoryct = await hre.ethers.deployContract("TokenFactory");
        
        await tokenFactoryct.createMemeToken("Test", "TST", "Test", "test.png", {
            value: hre.ethers.parseEther("0.0001")
        });
        
        const memetoken = await tokenFactoryct.memeTokenAddresses(0);
        
        await tokenFactoryct.buyMemeToken(memetoken, 800000, {
            value: hre.ethers.parseEther("24")
        });
        
        const tokenData = await tokenFactoryct.addressToMemeTokenMapping(memetoken);
        expect(tokenData.fundingRaised).to.equal(hre.ethers.parseEther("24"));
    });
});

