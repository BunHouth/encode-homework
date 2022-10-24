import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Lottery, LotteryToken} from '../typechain-types/contracts'


function randomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("Lottery Contract", () => {
  let contract: Lottery;
  let lotteryTokenContract: LotteryToken;
  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;
  let ratio: any;
  let fee: any;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    ratio = 500;
    fee = ethers.utils.parseUnits('10', 18);
    const tokenFactory = await ethers.getContractFactory("LotteryToken");
    lotteryTokenContract = await tokenFactory.deploy('LotteryToken', 'LTT');
    await lotteryTokenContract.deployed();
    const factory = await ethers.getContractFactory("Lottery");
    contract = await factory.deploy(lotteryTokenContract.address, ratio, fee);
    await contract.deployed();
    const MINTER_ROLE = await lotteryTokenContract.MINTER_ROLE();
    await lotteryTokenContract.grantRole(MINTER_ROLE, contract.address)
  });

  it('should able to buyToken', async () => {
    const buyer = accounts[1];
    await (await contract.connect(buyer).buyTokens({value: ethers.utils.parseEther('1')})).wait();
    expect(await lotteryTokenContract.balanceOf(buyer.address)).to.be.eq(ethers.utils.parseUnits(String(1 * ratio), 18));
  })

  it('should able to place bet', async () => {
    const buyer = accounts[1];
    const closeAt = Math.floor(Date.now() / 1000) + 60 * 1440;
    await (await contract.openBets(closeAt)).wait();
    await (await contract.connect(buyer).buyTokens({value: ethers.utils.parseEther('1')})).wait();
    const totalBalance = await lotteryTokenContract.balanceOf(buyer.address);
    await (await lotteryTokenContract.connect(buyer).approve(contract.address, totalBalance)).wait();
    const betAmount = totalBalance.sub(fee);
    const recipe = await (await contract.connect(buyer).bet(betAmount)).wait()
    expect(recipe.status).to.be.eq(1);
    expect(await lotteryTokenContract.balanceOf(buyer.address)).to.be.eq(0);
  });

  it('should able to bet and close bet for random winner', async () => {
    const closeAt = Math.floor(Date.now() / 1000) + 60 * 0.5;
    await (await contract.openBets(closeAt)).wait();
    let totalBet = ethers.BigNumber.from(0);
    for await (const index of Array.from(Array(20).keys())) {
      let buyer = accounts[index];
      await (await contract.connect(buyer).buyTokens({value: ethers.utils.parseEther(String(randomNumber(0.1, 2)))})).wait();
      const totalBalance = await lotteryTokenContract.balanceOf(buyer.address);
      await (await lotteryTokenContract.connect(buyer).approve(contract.address, totalBalance)).wait();
      const betAmount = totalBalance.sub(fee);
      totalBet = totalBet.add(betAmount);
      await (await contract.connect(buyer).bet(betAmount)).wait()
    }
    await timeout(3000);
    const recipe = await (await contract.closeLottery()).wait();
    const winner = await contract.currentWinner();
    expect(recipe.status).to.be.eq(1);
    expect(winner._amount).to.be.eq(totalBet);
  });
});