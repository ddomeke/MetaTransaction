// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MetaTransaction {
    address public usdcToken; // USDC token kontrat adresi
    mapping(address => uint256) public nonces;

    event MetaTransactionExecuted(
        address indexed user,
        address indexed relayer,
        address indexed to,
        uint256 amount
    );

    bytes32 private constant META_TRANSACTION_TYPEHASH = keccak256(
        "MetaTransaction(uint256 nonce,address from,address to,uint256 amount)"
    );

    constructor(address _usdcToken) {
        usdcToken = _usdcToken; // USDC kontrat adresi
    }

    function executeMetaTransaction(
        address from,
        address to,
        uint256 amount,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        // Kullanıcının nonce değerini alın
        uint256 nonce = nonces[from];

                // İmzanın doğruluğunu kontrol edin
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(
                    abi.encode(META_TRANSACTION_TYPEHASH, nonce, from, to, amount)
                )
            )
        );
        address signer = ecrecover(digest, v, r, s);
        require(signer == from, "Invalid signature");

        // Nonce değerini artırın
        nonces[from]++;

        // USDC transferini gerçekleştirin
        require(
            IERC20(usdcToken).transferFrom(from, to, amount),
            "USDC transfer failed"
        );

        emit MetaTransactionExecuted(from, msg.sender, to, amount);
    }

    function getMessageHash(
        uint256 nonce,
        address from,
        address to,
        uint256 amount
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                META_TRANSACTION_TYPEHASH,
                nonce,
                from,
                to,
                amount
            )
        );
    }

    function getDigest(
        uint256 nonce,
        address from,
        address to,
        uint256 amount
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(
                    abi.encode(META_TRANSACTION_TYPEHASH, nonce, from, to, amount)
                )
            )
        );
    }
}
