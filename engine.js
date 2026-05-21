import { createHardhatRuntimeEnvironment } from "hardhat/hre";
import hardhatConfig from "./hardhat.config.ts";
import fs from "fs";

async function main() {
    const hre = await createHardhatRuntimeEnvironment(hardhatConfig);

    // In Hardhat 3, ethers lives on the network connection, not hre directly
    const connection = await hre.network.connect();
    const ethers = connection.ethers;

    console.log("===========================================");
    console.log("Privacy-Aware Access Policy Engine (PAAPE)");
    console.log("===========================================\n");

    const [appOwner, user] = await ethers.getSigners();
    console.log(`>> App Owner: ${appOwner.address}`);
    console.log(`>> User:      ${user.address}\n`);

    // Deploy Verifier
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    const verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
    const verifierAddress = await verifier.getAddress();
    console.log(`>> Verifier deployed to: ${verifierAddress}\n`);

    // Deploy AccessPolicy
    const AccessPolicy = await ethers.getContractFactory("AccessPolicy");
    const policy = await AccessPolicy.deploy(verifierAddress, 18);
    //const policy = await AccessPolicy.deploy(verifierAddress, 21);
    await policy.waitForDeployment();
    const policyAddress = await policy.getAddress();
    console.log(`>> Policy deployed to: ${policyAddress}\n`);

    // Load & submit ZK proof
    const proofData = JSON.parse(fs.readFileSync('./verifierCalldata.json', 'utf-8'));
    const [a, b, c, input] = proofData;

    const userPseudonym = "0x1234567890123456789012345678901234567890123456789012345678901234";

    console.log(`>> Proof loaded successfully.`);
    console.log(`>>> Submitting Proof for Pseudonym: ${userPseudonym}\n`);
    console.log(`>>>> Verifying Proof On-Chain ....`);

    // Performance Timer
    const startTime = performance.now();

    const tx = await policy.connect(user).requestAccess(userPseudonym, a, b, c, input);
    const receipt = await tx.wait();

    // End Performance Timer
    const endTime = performance.now();
    const verificationTime = (endTime - startTime).toFixed(2);

    const eventTopic = ethers.id("AccessGranted(bytes32)");
    const granted = receipt.logs.some(log => log.topics[0] === eventTopic);

    console.log("=========================================");
    if (granted) {
        console.log("Success: Zero Knowledge << Access Granted! >>");
        console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
        console.log(`   Verification Time:: ${verificationTime} ms`);
    } else {
        console.log("[ Error ] Failed: >> Access Denied <<.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
