const hre = require("hardhat");

async function main() {
  const TuneChain = await hre.ethers.getContractFactory("TuneChain");
  const tunechain = await TuneChain.deploy();

  console.log(`TuneChain deployed to: ${await tunechain.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
