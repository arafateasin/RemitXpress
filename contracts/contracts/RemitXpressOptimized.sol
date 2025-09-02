// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RemitXpress - Gas Optimized Remittance Contract
 * @dev Highly optimized for gas efficiency while maintaining security
 */
contract RemitXpress is ReentrancyGuard, Ownable {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Transaction {
        address sender;
        address recipient;
        uint96 amount; // Using uint96 to pack with address (32 bytes total)
        uint32 timestamp; // Using uint32 for timestamp (sufficient until 2106)
        uint16 fee; // Using uint16 for fee in basis points
        uint8 status; // 0: pending, 1: completed, 2: cancelled
    }

    struct UserData {
        uint128 totalSent;
        uint128 totalReceived;
        uint32 transactionCount;
        bool isVerified;
        bool exists; // Track if user exists to save gas on first interaction
    }

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    mapping(bytes32 => Transaction) public transactions;
    mapping(address => UserData) public users;
    mapping(address => bool) public authorizedOperators;

    address public feeCollector;
    uint16 public baseFeeRate = 100; // 1% = 100 basis points
    uint16 public constant MAX_FEE_RATE = 1000; // 10% max fee
    bool public paused;

    // Gas optimization: Use array for transaction IDs only when needed
    bytes32[] private _transactionIds;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event TransactionCreated(
        bytes32 indexed transactionId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 fee
    );

    event TransactionCompleted(bytes32 indexed transactionId);
    event TransactionCancelled(bytes32 indexed transactionId);
    event UserVerified(address indexed user);
    event FeeRateUpdated(uint256 newRate);
    event ContractPaused(bool isPaused);

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyVerified() {
        if (!users[msg.sender].isVerified) revert UserNotVerified();
        _;
    }

    modifier onlyAuthorized() {
        if (!authorizedOperators[msg.sender] && msg.sender != owner()) {
            revert NotAuthorized();
        }
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractIsPaused();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                               ERRORS
    //////////////////////////////////////////////////////////////*/

    error UserNotVerified();
    error NotAuthorized();
    error ContractIsPaused();
    error InvalidRecipient();
    error InvalidAmount();
    error InsufficientPayment();
    error TransactionNotFound();
    error TransactionAlreadyCompleted();
    error TransactionIsCancelled();
    error TransactionAlreadyCancelled();
    error FeeRateTooHigh();
    error InvalidFeeCollector();
    error NoFeesToWithdraw();
    error TransferFailed();

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _feeCollector) Ownable(msg.sender) {
        if (_feeCollector == address(0)) revert InvalidFeeCollector();
        feeCollector = _feeCollector;
        authorizedOperators[msg.sender] = true;
    }

    /*//////////////////////////////////////////////////////////////
                           MAIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Create a new remittance transaction
     * @param _recipient The address to receive the funds
     * @param _amount The amount to transfer (in wei)
     */
    function createTransaction(
        address _recipient,
        uint96 _amount
    ) external payable onlyVerified whenNotPaused nonReentrant {
        if (_recipient == address(0)) revert InvalidRecipient();
        if (_amount == 0) revert InvalidAmount();

        uint256 fee = calculateFee(_amount);
        uint256 totalRequired = uint256(_amount) + fee;

        if (msg.value < totalRequired) revert InsufficientPayment();

        // Generate transaction ID using less gas
        bytes32 transactionId = keccak256(
            abi.encode(
                msg.sender,
                _recipient,
                _amount,
                block.timestamp,
                _transactionIds.length
            )
        );

        // Store transaction with packed struct
        transactions[transactionId] = Transaction({
            sender: msg.sender,
            recipient: _recipient,
            amount: _amount,
            timestamp: uint32(block.timestamp),
            fee: uint16(fee),
            status: 0 // pending
        });

        _transactionIds.push(transactionId);

        // Update user data efficiently
        UserData storage userData = users[msg.sender];
        unchecked {
            userData.transactionCount++;
        }

        // Transfer fee immediately to avoid holding funds
        if (fee > 0) {
            (bool success, ) = feeCollector.call{value: fee}("");
            if (!success) revert TransferFailed();
        }

        // Refund excess payment
        uint256 excess = msg.value - totalRequired;
        if (excess > 0) {
            (bool success, ) = msg.sender.call{value: excess}("");
            if (!success) revert TransferFailed();
        }

        emit TransactionCreated(
            transactionId,
            msg.sender,
            _recipient,
            _amount,
            fee
        );
    }

    /**
     * @dev Complete a transaction and transfer funds to recipient
     * @param _transactionId The ID of the transaction to complete
     */
    function completeTransaction(
        bytes32 _transactionId
    ) external onlyAuthorized whenNotPaused nonReentrant {
        Transaction storage txn = transactions[_transactionId];

        if (txn.sender == address(0)) revert TransactionNotFound();
        if (txn.status == 1) revert TransactionAlreadyCompleted();
        if (txn.status == 2) revert TransactionIsCancelled();

        txn.status = 1; // completed

        // Update user statistics
        UserData storage senderData = users[txn.sender];
        UserData storage recipientData = users[txn.recipient];

        unchecked {
            senderData.totalSent += txn.amount;
            recipientData.totalReceived += txn.amount;
        }

        // Ensure recipient exists in our system
        if (!recipientData.exists) {
            recipientData.exists = true;
        }

        // Transfer funds to recipient
        (bool success, ) = txn.recipient.call{value: txn.amount}("");
        if (!success) revert TransferFailed();

        emit TransactionCompleted(_transactionId);
    }

    /**
     * @dev Cancel a transaction and refund the sender
     * @param _transactionId The ID of the transaction to cancel
     */
    function cancelTransaction(
        bytes32 _transactionId
    ) external whenNotPaused nonReentrant {
        Transaction storage txn = transactions[_transactionId];

        if (txn.sender != msg.sender && !authorizedOperators[msg.sender]) {
            revert NotAuthorized();
        }
        if (txn.sender == address(0)) revert TransactionNotFound();
        if (txn.status == 1) revert TransactionAlreadyCompleted();
        if (txn.status == 2) revert TransactionAlreadyCancelled();

        txn.status = 2; // cancelled

        // Refund amount to sender (fees are non-refundable)
        (bool success, ) = txn.sender.call{value: txn.amount}("");
        if (!success) revert TransferFailed();

        emit TransactionCancelled(_transactionId);
    }

    /*//////////////////////////////////////////////////////////////
                           ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Verify a user for the platform
     * @param _user The address to verify
     */
    function verifyUser(address _user) external onlyAuthorized {
        UserData storage userData = users[_user];
        userData.isVerified = true;
        if (!userData.exists) {
            userData.exists = true;
        }
        emit UserVerified(_user);
    }

    /**
     * @dev Batch verify multiple users (gas efficient)
     * @param _users Array of addresses to verify
     */
    function batchVerifyUsers(
        address[] calldata _users
    ) external onlyAuthorized {
        uint256 length = _users.length;
        for (uint256 i; i < length; ) {
            UserData storage userData = users[_users[i]];
            userData.isVerified = true;
            if (!userData.exists) {
                userData.exists = true;
            }
            emit UserVerified(_users[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Set the fee rate for transactions
     * @param _newRate New fee rate in basis points
     */
    function setFeeRate(uint16 _newRate) external onlyOwner {
        if (_newRate > MAX_FEE_RATE) revert FeeRateTooHigh();
        baseFeeRate = _newRate;
        emit FeeRateUpdated(_newRate);
    }

    /**
     * @dev Set authorized operator status
     * @param _operator Address to set authorization for
     * @param _authorized Whether the address is authorized
     */
    function setAuthorizedOperator(
        address _operator,
        bool _authorized
    ) external onlyOwner {
        authorizedOperators[_operator] = _authorized;
    }

    /**
     * @dev Set the fee collector address
     * @param _feeCollector New fee collector address
     */
    function setFeeCollector(address _feeCollector) external onlyOwner {
        if (_feeCollector == address(0)) revert InvalidFeeCollector();
        feeCollector = _feeCollector;
    }

    /**
     * @dev Pause/unpause the contract
     * @param _paused Whether to pause the contract
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit ContractPaused(_paused);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Calculate fee for a given amount
     * @param _amount Amount to calculate fee for
     * @return fee The calculated fee
     */
    function calculateFee(uint256 _amount) public view returns (uint256 fee) {
        unchecked {
            fee = (_amount * baseFeeRate) / 10000;
        }
    }

    /**
     * @dev Get transaction details
     * @param _transactionId The transaction ID
     * @return txn The transaction struct
     */
    function getTransaction(
        bytes32 _transactionId
    ) external view returns (Transaction memory txn) {
        txn = transactions[_transactionId];
    }

    /**
     * @dev Get user information
     * @param _user The user address
     * @return userData The user data struct
     */
    function getUserInfo(
        address _user
    ) external view returns (UserData memory userData) {
        userData = users[_user];
    }

    /**
     * @dev Get total number of transactions
     * @return count The transaction count
     */
    function getTransactionCount() external view returns (uint256 count) {
        count = _transactionIds.length;
    }

    /**
     * @dev Get transaction ID by index
     * @param _index The index
     * @return transactionId The transaction ID
     */
    function getTransactionId(
        uint256 _index
    ) external view returns (bytes32 transactionId) {
        transactionId = _transactionIds[_index];
    }

    /*//////////////////////////////////////////////////////////////
                           EMERGENCY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Emergency withdraw function for stuck funds
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoFeesToWithdraw();

        (bool success, ) = owner().call{value: balance}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Contract can receive ETH
    }
}
