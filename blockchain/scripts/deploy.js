const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying EvaluationAnchor to network:", hre.network.name);

  const EvaluationAnchor = await hre.ethers.getContractFactory("EvaluationAnchor");
  const anchor = await EvaluationAnchor.deploy();
  await anchor.waitForDeployment();

  const address = await anchor.getAddress();
  console.log("EvaluationAnchor deployed at:", address);

  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    deployedAt: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info written to deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
