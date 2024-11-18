"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Ethereum RPC bağlantısı (Infura, Alchemy veya yerel node kullanılabilir)
        const provider = new ethers_1.ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/Lhnw5WCaKjKqX6SradvTTQKDQ4EEBGXE");
        // Relayer veya admin cüzdanı için private key kullanılarak Wallet oluşturulur
        const privateKey = "0xa3c259fade3b9fc8e522ccb902ada292f56a3b47f89f42df247aea4d99a20cb7"; // Cüzdanınızın private key'i
        const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
        // Akıllı sözleşme adresi ve ABI tanımı
        const contractAddress = "0xC3c7a654749FD237BB500ef7F98FAa9CdA6B73bc";
        const abi = [
            "function _executeMetaTransaction(address userAddress, address targetContract, address recipient, uint256 amount, uint256 nonce, bytes signature) public",
            "function getFixedNumber() public view returns (uint256)"
        ];
        // Sözleşme örneği oluşturuluyor
        const contract = new ethers_1.ethers.Contract(contractAddress, abi, wallet);
        // Örnek parametreler
        const userAddress = "0xUserAddressHere"; // Kullanıcı adresi
        const targetContract = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Hedef kontrat adresi
        const recipient = "0xa431c3d7d6E334C53cEE76AA069F027F63FAddE8"; // Token alıcısının adresi
        const amount = ethers_1.ethers.parseEther("0.02"); // Gönderilecek miktar (1 token)
        const nonce = 0; // Kullanıcının nonce değeri
        // Imza oluşturma (kullanıcıdan alınan signature)
        const functionSignature = ethers_1.ethers.defaultAbiCoder.encode(["address", "uint256"], [recipient, amount]);
        const messageHash = ethers_1.ethers.solidityKeccak256(["address", "address", "bytes", "uint256"], [userAddress, targetContract, functionSignature, nonce]);
        const ethSignedMessageHash = ethers_1.ethers.hashMessage(ethers_1.ethers.arrayify(messageHash));
        const signature = yield wallet.signMessage(ethers_1.ethers.arrayify(ethSignedMessageHash)); // Bu kullanıcıdan alınmalıdır
        // `_executeMetaTransaction` çağrısı
        try {
            const tx = yield contract._executeMetaTransaction(userAddress, targetContract, recipient, amount, nonce, signature);
            console.log("Transaction sent:", tx.hash);
            // İşlemin tamamlanmasını bekle
            const receipt = yield tx.wait();
            console.log("Transaction confirmed:", receipt);
        }
        catch (error) {
            console.error("Error executing meta transaction:", error);
        }
        // `getFixedNumber` çağrısı
        try {
            const fixedNumber = yield contract.getFixedNumber();
            console.log("Fixed Number:", fixedNumber.toString());
        }
        catch (error) {
            console.error("Error calling getFixedNumber:", error);
        }
    });
}
main().catch(console.error);
