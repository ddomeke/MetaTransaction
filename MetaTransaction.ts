import { ethers } from 'ethers'; // Ethers.js v6
import * as dotenv from "dotenv";

dotenv.config();

// Çevre değişkenlerini yükleyin
const PRIVATE_KEY = process.env.PRIVATE_KEY!; // Kullanıcı A'nın özel anahtarı
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY!; // Relayer'ın özel anahtarı
const METATRANSACTION_CONTRACT = process.env.METATRANSACTION_CONTRACT!;
const USDC_CONTRACT = process.env.USDC_CONTRACT!;
const RPC_URL = process.env.POLYGON_RPC_URL!;
const USER_A = process.env.USER_A!;
const USER_B = process.env.USER_B!;

async function main() {
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const userWallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

    // MetaTransaction kontratı ve USDC kontratı ABI'si
    const metaTransactionABI = [
        "function executeMetaTransaction(address from, address to, uint256 amount, uint8 v, bytes32 r, bytes32 s) public",
        "function nonces(address user) public view returns (uint256)"
    ];

    const metaTransactionContract = new ethers.Contract(
        METATRANSACTION_CONTRACT,
        metaTransactionABI,
        relayerWallet
    );

    const usdcABI = [
        "function balanceOf(address account) external view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)"
    ];

    const usdcContract = new ethers.Contract(USDC_CONTRACT, usdcABI, userWallet);

    // Kullanıcının nonce değerini alın
    const nonce = await metaTransactionContract.nonces(USER_A);
    console.log("nonce:", nonce);

    // Gönderilecek miktar (5 USDC = 5 * 10^6 micro USDC)
    const amount = ethers.parseUnits("5", 6);

    // USDC için onay verin (approve)
    const approveTx = await usdcContract.approve(METATRANSACTION_CONTRACT, amount);
    console.log("Approve transaction sent:", approveTx.hash);
    await approveTx.wait();



    const META_TRANSACTION_TYPEHASH = ethers.id(
        "MetaTransaction(uint256 nonce,address from,address to,uint256 amount)"
      );
      
      const abiCoder = new ethers.AbiCoder();

      // Solidity `abi.encode` ile uyumlu hash
        const innerHash = ethers.keccak256(
        abiCoder.encode(
            ["bytes32", "uint256", "address", "address", "uint256"],
            [META_TRANSACTION_TYPEHASH, nonce, USER_A, USER_B, amount]
        )
        );
      
      // Ethereum Signed Message Hash (Digest)
      const digest = ethers.keccak256(
        ethers.concat([
          ethers.toUtf8Bytes("\x19Ethereum Signed Message:\n32"),
          ethers.getBytes(innerHash),
        ])
      );
      
      console.log("Inner Hash:", innerHash);
      console.log("Digest:", digest);
 
    // SigningKey kullanarak imzala
    const signature = userWallet.signingKey.sign(digest);

    // İmza bileşenlerini al
    const { r, s, v } = signature;

    console.log("Signature:", signature);
    
    const recoveredAddress = ethers.recoverAddress(digest, signature);
    console.log("Recovered Address:", recoveredAddress);

    console.log(USER_A);
    console.log(USER_B); 
    console.log(amount); 
    console.log(v); // V değerini alır
    console.log(r); // R değerini alır
    console.log(s); // S değerini alır

    // Relayer işlemi blockchain'e gönderir
    const tx = await metaTransactionContract
        .executeMetaTransaction(USER_A, USER_B, amount, v, r, s);

    console.log("Relayed transaction sent:", tx.hash);
    await tx.wait();
    console.log("Relayed transaction confirmed!");
}

main().catch(console.error);
