const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deploymentPath = path.join(__dirname, "..", "deployments", "mantleSepolia.json");
  if (!fs.existsSync(deploymentPath)) {
    throw new Error("No deployment found. Run npm run deploy:contract first.");
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  console.log("Verifying", deployment.address, "on Mantle Sepolia...");

  await run("verify:verify", {
    address: deployment.address,
    constructorArguments: [],
  });

  console.log("Verified:", `https://sepolia.mantlescan.xyz/address/${deployment.address}#code`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
