import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {LotteryToken} from '../typechain-types/contracts'


const INITIAL_SUPPLY = 0;
describe("Basic LotteryToken", () => {
  let contract: LotteryToken;
  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    const factory = await ethers.getContractFactory("LotteryToken");
    contract = await factory.deploy('LotteryToken', 'LTT');
    await contract.deployed();
  });

  it('should have zero total supply at deployment', async () => {
    const totalSupply = await contract.totalSupply();
    const decimals = await contract.decimals();
    expect(Number(ethers.utils.formatUnits(totalSupply, decimals))).to.eq(INITIAL_SUPPLY);
  })

  it('should able to mint token', async () => {
    const decimals = await contract.decimals();
    const MINT_AMOUNT = ethers.utils.parseUnits('10000', decimals);
    await (await contract.mint(deployer.address, MINT_AMOUNT)).wait();
    const totalSupply = await contract.totalSupply();
    expect(totalSupply).to.eq(MINT_AMOUNT);
    expect(await contract.balanceOf(deployer.address)).to.be.eq(MINT_AMOUNT);
  })
});