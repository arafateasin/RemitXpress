// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RemittanceLibrary
 * @dev Library containing utility functions for remittance operations
 */
library RemittanceLibrary {
    struct FeeStructure {
        uint256 baseFee; // Base fee in basis points (100 = 1%)
        uint256 minimumFee; // Minimum fee amount
        uint256 maximumFee; // Maximum fee amount
        uint256 percentageFee; // Percentage fee in basis points
    }

    /**
     * @dev Calculate transaction fee based on amount and fee structure
     */
    function calculateFee(
        uint256 amount,
        FeeStructure memory feeStructure
    ) internal pure returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");

        // Calculate percentage fee
        uint256 percentageFee = (amount * feeStructure.percentageFee) / 10000;

        // Add base fee
        uint256 totalFee = feeStructure.baseFee + percentageFee;

        // Apply minimum and maximum limits
        if (totalFee < feeStructure.minimumFee) {
            totalFee = feeStructure.minimumFee;
        }

        if (feeStructure.maximumFee > 0 && totalFee > feeStructure.maximumFee) {
            totalFee = feeStructure.maximumFee;
        }

        return totalFee;
    }

    /**
     * @dev Validate transaction amount
     */
    function validateAmount(
        uint256 amount,
        uint256 minAmount,
        uint256 maxAmount
    ) internal pure returns (bool) {
        return amount >= minAmount && (maxAmount == 0 || amount <= maxAmount);
    }

    /**
     * @dev Generate unique transaction ID
     */
    function generateTransactionId(
        address sender,
        address recipient,
        uint256 amount,
        uint256 timestamp,
        uint256 nonce
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(sender, recipient, amount, timestamp, nonce)
            );
    }

    /**
     * @dev Validate wallet address
     */
    function isValidAddress(address addr) internal pure returns (bool) {
        return addr != address(0);
    }

    /**
     * @dev Calculate time-based rate limit
     */
    function checkRateLimit(
        uint256 lastTransactionTime,
        uint256 currentTime,
        uint256 rateLimitPeriod
    ) internal pure returns (bool) {
        return currentTime >= lastTransactionTime + rateLimitPeriod;
    }
}

/**
 * @title SecurityLibrary
 * @dev Library containing security-related utility functions
 */
library SecurityLibrary {
    /**
     * @dev Verify signature for transaction authorization
     */
    function verifySignature(
        bytes32 messageHash,
        bytes memory signature,
        address expectedSigner
    ) internal pure returns (bool) {
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        address recoveredSigner = recoverSigner(
            ethSignedMessageHash,
            signature
        );
        return recoveredSigner == expectedSigner;
    }

    /**
     * @dev Recover signer from signature
     */
    function recoverSigner(
        bytes32 ethSignedMessageHash,
        bytes memory signature
    ) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    /**
     * @dev Get Ethereum signed message hash
     */
    function getEthSignedMessageHash(
        bytes32 messageHash
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    messageHash
                )
            );
    }

    /**
     * @dev Generate secure random number (pseudo-random)
     */
    function generateSecureRandom(
        uint256 seed,
        address user,
        uint256 timestamp
    ) internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        seed,
                        user,
                        timestamp,
                        blockhash(block.number - 1)
                    )
                )
            );
    }

    /**
     * @dev Check if transaction amount is suspicious
     */
    function isSuspiciousAmount(
        uint256 amount,
        uint256 userDailyLimit,
        uint256 userDailySpent,
        uint256 maxSingleTransaction
    ) internal pure returns (bool) {
        // Check if single transaction exceeds limit
        if (amount > maxSingleTransaction) {
            return true;
        }

        // Check if would exceed daily limit
        if (userDailySpent + amount > userDailyLimit) {
            return true;
        }

        return false;
    }
}

/**
 * @title CurrencyLibrary
 * @dev Library for currency conversion and validation
 */
library CurrencyLibrary {
    struct Currency {
        string code; // ISO currency code (USD, EUR, etc.)
        string name; // Full currency name
        uint8 decimals; // Number of decimal places
        bool isActive; // Whether currency is active
    }

    /**
     * @dev Validate currency code format
     */
    function isValidCurrencyCode(
        string memory code
    ) internal pure returns (bool) {
        bytes memory codeBytes = bytes(code);

        // Check length (should be 3 characters)
        if (codeBytes.length != 3) {
            return false;
        }

        // Check if all characters are uppercase letters
        for (uint i = 0; i < 3; i++) {
            if (codeBytes[i] < 0x41 || codeBytes[i] > 0x5A) {
                return false;
            }
        }

        return true;
    }

    /**
     * @dev Convert amount between different decimal precisions
     */
    function convertDecimals(
        uint256 amount,
        uint8 fromDecimals,
        uint8 toDecimals
    ) internal pure returns (uint256) {
        if (fromDecimals == toDecimals) {
            return amount;
        }

        if (fromDecimals > toDecimals) {
            return amount / (10 ** (fromDecimals - toDecimals));
        } else {
            return amount * (10 ** (toDecimals - fromDecimals));
        }
    }

    /**
     * @dev Format amount with proper decimal places
     */
    function formatAmount(
        uint256 amount,
        uint8 decimals
    ) internal pure returns (uint256 wholePart, uint256 fractionalPart) {
        uint256 divisor = 10 ** decimals;
        wholePart = amount / divisor;
        fractionalPart = amount % divisor;
    }
}

/**
 * @title ComplianceLibrary
 * @dev Library for compliance and KYC/AML checks
 */
library ComplianceLibrary {
    enum RiskLevel {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
    enum ComplianceStatus {
        PENDING,
        APPROVED,
        REJECTED,
        UNDER_REVIEW
    }

    struct ComplianceData {
        RiskLevel riskLevel;
        ComplianceStatus status;
        uint256 lastVerified;
        bool isBlacklisted;
        string jurisdiction;
    }

    /**
     * @dev Calculate risk score based on transaction parameters
     */
    function calculateRiskScore(
        uint256 amount,
        string memory fromCountry,
        string memory toCountry,
        uint256 userTransactionCount,
        uint256 userTotalVolume
    ) internal pure returns (RiskLevel) {
        uint256 score = 0;

        // Amount-based risk
        if (amount > 10000 * 1e18) {
            // > $10,000
            score += 30;
        } else if (amount > 3000 * 1e18) {
            // > $3,000
            score += 15;
        }

        // Country risk (simplified - in reality this would be more complex)
        if (isHighRiskCountry(fromCountry) || isHighRiskCountry(toCountry)) {
            score += 25;
        }

        // User behavior risk
        if (userTransactionCount < 5) {
            score += 20; // New user
        }

        if (userTotalVolume > 50000 * 1e18) {
            // High volume user
            score += 10;
        }

        // Return risk level based on score
        if (score >= 60) return RiskLevel.CRITICAL;
        if (score >= 40) return RiskLevel.HIGH;
        if (score >= 20) return RiskLevel.MEDIUM;
        return RiskLevel.LOW;
    }

    /**
     * @dev Check if country is considered high risk (simplified)
     */
    function isHighRiskCountry(
        string memory country
    ) internal pure returns (bool) {
        // This is a simplified implementation
        // In reality, this would check against official sanctions lists
        bytes32 countryHash = keccak256(bytes(country));

        // Example high-risk countries (this is for demonstration only)
        return (countryHash == keccak256(bytes("UNKNOWN")) ||
            countryHash == keccak256(bytes("RESTRICTED")));
    }

    /**
     * @dev Validate KYC documentation hash
     */
    function validateKYCHash(
        bytes32 documentHash
    ) internal pure returns (bool) {
        return documentHash != bytes32(0);
    }
}
