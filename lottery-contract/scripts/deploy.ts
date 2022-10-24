import { ethers } from "hardhat";

const {utils} = ethers;

const deployToken = async () => {
  const [deployer] = await ethers.getSigners();
  const TOKEN_NAME = 'EncodeLottery';
  const SYMBOL_NAME = 'ETT';
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log(`Preparing to deploy token contract`);
  const tokenFactory = await ethers.getContractFactory("LotteryToken");
  const token = await tokenFactory.deploy(TOKEN_NAME, SYMBOL_NAME);
  await token.deployed();
  console.log(`Deploy smart contract success.`)
  console.log(`============================================`);
  console.log(`Contract Address : ${token.address}`);
  console.log(`============================================`);
  return token;
}

const deployLotterySystem = async (tokenAddress: string) => {
  console.log(`Preparing to deploy Lottery smart contract`);
  const tokenFactory = await ethers.getContractFactory("Lottery");
  const token = await tokenFactory.deploy(tokenAddress, 500, utils.parseUnits('10', 18));
  await token.deployed();
  console.log(`Deploy NFT smart contract success.`)
  console.log(`============================================`);
  console.log(`Contract NFT Address : ${token.address}`);
  console.log(`============================================`);
  return token;
}

async function main() {
  const token = await deployToken();
  const lottery = await deployLotterySystem(token.address);
  const MINTER_ROLE = await token.MINTER_ROLE();
  const OPERATOR_ROLE = await lottery.OPERATOR_ROLE();
  await token.grantRole(MINTER_ROLE, lottery.address)
  await lottery.grantRole(OPERATOR_ROLE, '0x17E1EbC1d6BCFDa760Af68e1eE7ab0dD7f577cF4');
  await lottery.grantRole(OPERATOR_ROLE, '0xd6e9b48D59D780F28a6BEEbe8098f3b095c003d7');
  await lottery.grantRole(OPERATOR_ROLE, '0xd6e9b48D59D780F28a6BEEbe8098f3b095c003d7');
  await lottery.grantRole(OPERATOR_ROLE, '0x3027952928cfE46b8d46BaF094Bf9dfD2E3f127a');
  await lottery.grantRole(OPERATOR_ROLE, '0xAe18A61043c34bD938Ce4927d0AF7c67016a6DAf');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});