import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config();

async function main() {
    console.log("Deploying the MetaTransaction contract...");

    // RPC URL ve özel anahtar
    const RPC_URL = process.env.POLYGON_RPC_URL;
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const USDC_CONTRACT = process.env.USDC_CONTRACT;

    if (!RPC_URL || !PRIVATE_KEY || !USDC_CONTRACT) {
        throw new Error("Missing environment variables: Ensure RPC_URL, PRIVATE_KEY, and USDC_CONTRACT are set in your .env file");
    }

    // Sağlayıcı ve cüzdan oluşturma
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Derlenmiş kontrat bytecode ve ABI
    const contractJson = JSON.parse(
        readFileSync("./artifacts/contracts/MetaTransaction.sol/MetaTransaction.json", "utf-8")
    );
    const bytecode = contractJson.bytecode;
    const abi = contractJson.abi;

    // Kontrat Factory'sini oluşturun
    const ContractFactory = new ethers.ContractFactory(abi, bytecode, wallet);

    // Kontratı deploy edin
    console.log("Deploying the contract...");
    const contract = await ContractFactory.deploy(USDC_CONTRACT);

    console.log("Transaction hash:", contract.deploymentTransaction()?.hash);

    await contract.deploymentTransaction()?.wait();

    console.log("MetaTransaction contract deployed to:", contract.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error deploying contract:", error);
        process.exit(1);
    });
