// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RemitXpress is ReentrancyGuard, Pausable, Ownable {
    struct Transaction {
        address sender;
        address recipient;
        uint256 amount;
        uint256 fee;
        uint256 timestamp;
        string currency;
        string purpose;
        bool completed;
        bool cancelled;
    }

    struct User {
        bool isVerified;
        uint256 totalSent;
        uint256 totalReceived;
        uint256 transactionCount;
        mapping(string => uint256) balances;
    }

    mapping(address => User) public users;
    mapping(bytes32 => Transaction) public transactions;
    mapping(address => bool) public authorizedOperators;

    bytes32[] public transactionIds;
    address public feeCollector;
    uint256 public baseFeeRate = 100; // 1% = 100 basis points
    uint256 public constant MAX_FEE_RATE = 1000; // 10% max fee

    event TransactionCreated(
        bytes32 indexed transactionId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 fee,
        string currency
    );

    event TransactionCompleted(bytes32 indexed transactionId);
    event TransactionCancelled(bytes32 indexed transactionId);
    event UserVerified(address indexed user);
    event FeeRateUpdated(uint256 newRate);
    event FundsWithdrawn(address indexed to, uint256 amount);

    modifier onlyVerified() {
        require(users[msg.sender].isVerified, "User not verified");
        _;
    }

    modifier onlyAuthorized() {
        require(
            authorizedOperators[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    constructor(address _feeCollector) Ownable(msg.sender) {
        feeCollector = _feeCollector;
        authorizedOperators[msg.sender] = true;
    }

    function createTransaction(
        address _recipient,
        uint256 _amount,
        string memory _currency,
        string memory _purpose
    ) external payable onlyVerified whenNotPaused nonReentrant {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be greater than zero");
        require(msg.value >= _amount, "Insufficient payment");

        uint256 fee = calculateFee(_amount);
        require(msg.value >= _amount + fee, "Insufficient payment for fees");

        bytes32 transactionId = keccak256(
            abi.encodePacked(
                msg.sender,
                _recipient,
                _amount,
                block.timestamp,
                transactionIds.length
            )
        );

        transactions[transactionId] = Transaction({
            sender: msg.sender,
            recipient: _recipient,
            amount: _amount,
            fee: fee,
            timestamp: block.timestamp,
            currency: _currency,
            purpose: _purpose,
            completed: false,
            cancelled: false
        });

        transactionIds.push(transactionId);
        users[msg.sender].transactionCount++;

        // Transfer fee to fee collector
        if (fee > 0) {
            payable(feeCollector).transfer(fee);
        }

        emit TransactionCreated(
            transactionId,
            msg.sender,
            _recipient,
            _amount,
            fee,
            _currency
        );
    }

    function completeTransaction(
        bytes32 _transactionId
    ) external onlyAuthorized whenNotPaused nonReentrant {
        Transaction storage txn = transactions[_transactionId];
        require(txn.sender != address(0), "Transaction does not exist");
        require(!txn.completed, "Transaction already completed");
        require(!txn.cancelled, "Transaction cancelled");

        txn.completed = true;

        // Transfer funds to recipient
        payable(txn.recipient).transfer(txn.amount);

        // Update user statistics
        users[txn.sender].totalSent = users[txn.sender].totalSent + txn.amount;
        users[txn.recipient].totalReceived =
            users[txn.recipient].totalReceived +
            txn.amount;

        emit TransactionCompleted(_transactionId);
    }

    function cancelTransaction(
        bytes32 _transactionId
    ) external whenNotPaused nonReentrant {
        Transaction storage txn = transactions[_transactionId];
        require(
            txn.sender == msg.sender || authorizedOperators[msg.sender],
            "Not authorized"
        );
        require(!txn.completed, "Transaction already completed");
        require(!txn.cancelled, "Transaction already cancelled");

        txn.cancelled = true;

        // Refund to sender (amount only, fees are non-refundable)
        payable(txn.sender).transfer(txn.amount);

        emit TransactionCancelled(_transactionId);
    }

    function verifyUser(address _user) external onlyAuthorized {
        users[_user].isVerified = true;
        emit UserVerified(_user);
    }

    function setFeeRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= MAX_FEE_RATE, "Fee rate too high");
        baseFeeRate = _newRate;
        emit FeeRateUpdated(_newRate);
    }

    function setAuthorizedOperator(
        address _operator,
        bool _authorized
    ) external onlyOwner {
        authorizedOperators[_operator] = _authorized;
    }

    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector");
        feeCollector = _feeCollector;
    }

    function calculateFee(uint256 _amount) public view returns (uint256) {
        return (_amount * baseFeeRate) / 10000;
    }

    function getTransaction(
        bytes32 _transactionId
    )
        external
        view
        returns (
            address sender,
            address recipient,
            uint256 amount,
            uint256 fee,
            uint256 timestamp,
            string memory currency,
            string memory purpose,
            bool completed,
            bool cancelled
        )
    {
        Transaction storage txn = transactions[_transactionId];
        return (
            txn.sender,
            txn.recipient,
            txn.amount,
            txn.fee,
            txn.timestamp,
            txn.currency,
            txn.purpose,
            txn.completed,
            txn.cancelled
        );
    }

    function getUserInfo(
        address _user
    )
        external
        view
        returns (
            bool isVerified,
            uint256 totalSent,
            uint256 totalReceived,
            uint256 transactionCount
        )
    {
        User storage user = users[_user];
        return (
            user.isVerified,
            user.totalSent,
            user.totalReceived,
            user.transactionCount
        );
    }

    function getTransactionCount() external view returns (uint256) {
        return transactionIds.length;
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");

        payable(feeCollector).transfer(balance);
        emit FundsWithdrawn(feeCollector, balance);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Emergency function to recover stuck tokens (if any ERC20 tokens are sent by mistake)
    function emergencyWithdraw(
        address _token,
        uint256 _amount
    ) external onlyOwner {
        if (_token == address(0)) {
            payable(owner()).transfer(_amount);
        } else {
            // For ERC20 tokens - would need IERC20 interface
            // IERC20(_token).transfer(owner(), _amount);
        }
    }

    receive() external payable {
        // Allow contract to receive ETH
    }
}
