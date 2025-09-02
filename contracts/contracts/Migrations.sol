// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Migrations
 * @dev Contract for managing smart contract deployments and migrations
 */
contract Migrations is Ownable {
    uint256 public lastCompletedMigration;

    struct Migration {
        uint256 migrationId;
        address contractAddress;
        string contractName;
        uint256 deployedAt;
        bytes32 migrationHash;
        bool isCompleted;
    }

    mapping(uint256 => Migration) public migrations;
    mapping(address => bool) public deployedContracts;
    uint256 public migrationCount;

    event MigrationCompleted(
        uint256 indexed migrationId,
        address indexed contractAddress,
        string contractName
    );
    event MigrationReverted(uint256 indexed migrationId);

    constructor() Ownable(msg.sender) {
        lastCompletedMigration = 0;
        migrationCount = 0;
    }

    /**
     * @dev Set the completed migration number
     */
    function setCompleted(uint256 completed) public onlyOwner {
        lastCompletedMigration = completed;
    }

    /**
     * @dev Record a new migration
     */
    function recordMigration(
        address contractAddress,
        string memory contractName,
        bytes32 migrationHash
    ) public onlyOwner {
        require(contractAddress != address(0), "Invalid contract address");
        require(
            !deployedContracts[contractAddress],
            "Contract already recorded"
        );

        migrationCount++;

        migrations[migrationCount] = Migration({
            migrationId: migrationCount,
            contractAddress: contractAddress,
            contractName: contractName,
            deployedAt: block.timestamp,
            migrationHash: migrationHash,
            isCompleted: true
        });

        deployedContracts[contractAddress] = true;
        lastCompletedMigration = migrationCount;

        emit MigrationCompleted(migrationCount, contractAddress, contractName);
    }

    /**
     * @dev Upgrade function for controlled contract migrations
     */
    function upgrade(address newAddress) public onlyOwner {
        Migrations upgraded = Migrations(newAddress);
        upgraded.setCompleted(lastCompletedMigration);
    }

    /**
     * @dev Get migration details
     */
    function getMigration(
        uint256 migrationId
    )
        public
        view
        returns (
            address contractAddress,
            string memory contractName,
            uint256 deployedAt,
            bytes32 migrationHash,
            bool isCompleted
        )
    {
        Migration memory migration = migrations[migrationId];
        return (
            migration.contractAddress,
            migration.contractName,
            migration.deployedAt,
            migration.migrationHash,
            migration.isCompleted
        );
    }

    /**
     * @dev Check if a contract is deployed and recorded
     */
    function isContractDeployed(
        address contractAddress
    ) public view returns (bool) {
        return deployedContracts[contractAddress];
    }

    /**
     * @dev Get all migrations
     */
    function getAllMigrations() public view returns (Migration[] memory) {
        Migration[] memory allMigrations = new Migration[](migrationCount);

        for (uint256 i = 1; i <= migrationCount; i++) {
            allMigrations[i - 1] = migrations[i];
        }

        return allMigrations;
    }
}
