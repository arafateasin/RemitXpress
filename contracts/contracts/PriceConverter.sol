// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PriceConverter
 * @dev Contract for managing exchange rates and price conversions for remittances
 */
contract PriceConverter is Ownable, Pausable {
    struct ExchangeRate {
        uint256 rate; // Exchange rate with 18 decimals (1 USD = rate * 10^18 target currency)
        uint256 lastUpdated; // Timestamp of last update
        bool isActive; // Whether this rate is active
    }

    struct CurrencyPair {
        string fromCurrency;
        string toCurrency;
        uint256 rate;
        uint256 lastUpdated;
    }

    // Mapping from currency pair hash to exchange rate
    mapping(bytes32 => ExchangeRate) public exchangeRates;

    // Array to track all currency pairs
    bytes32[] public currencyPairs;

    // Mapping to check if currency pair exists
    mapping(bytes32 => bool) public pairExists;

    // Supported currencies
    mapping(string => bool) public supportedCurrencies;
    string[] public currencyList;

    // Price feed update threshold (1 hour)
    uint256 public constant PRICE_VALIDITY_PERIOD = 3600;

    // Maximum allowed price deviation (10%)
    uint256 public constant MAX_PRICE_DEVIATION = 1000; // 10% in basis points

    event ExchangeRateUpdated(
        string indexed fromCurrency,
        string indexed toCurrency,
        uint256 newRate,
        uint256 timestamp
    );

    event CurrencyAdded(string indexed currency);
    event CurrencyRemoved(string indexed currency);

    modifier validCurrency(string memory currency) {
        require(supportedCurrencies[currency], "Currency not supported");
        _;
    }

    modifier rateFreshness(bytes32 pairHash) {
        require(
            block.timestamp - exchangeRates[pairHash].lastUpdated <=
                PRICE_VALIDITY_PERIOD,
            "Exchange rate too old"
        );
        _;
    }

    constructor() Ownable(msg.sender) {
        // Add default supported currencies
        _addCurrency("USD");
        _addCurrency("EUR");
        _addCurrency("GBP");
        _addCurrency("JPY");
        _addCurrency("CAD");
        _addCurrency("AUD");
        _addCurrency("CHF");
        _addCurrency("CNY");
        _addCurrency("INR");
        _addCurrency("MXN");

        // Set initial rates (these should be updated with real data)
        _setInitialRates();
    }

    /**
     * @dev Add a new supported currency
     */
    function addCurrency(string memory currency) external onlyOwner {
        _addCurrency(currency);
    }

    /**
     * @dev Remove a supported currency
     */
    function removeCurrency(string memory currency) external onlyOwner {
        require(supportedCurrencies[currency], "Currency not found");
        supportedCurrencies[currency] = false;

        // Remove from currency list
        for (uint i = 0; i < currencyList.length; i++) {
            if (
                keccak256(bytes(currencyList[i])) == keccak256(bytes(currency))
            ) {
                currencyList[i] = currencyList[currencyList.length - 1];
                currencyList.pop();
                break;
            }
        }

        emit CurrencyRemoved(currency);
    }

    /**
     * @dev Update exchange rate for a currency pair
     */
    function updateExchangeRate(
        string memory fromCurrency,
        string memory toCurrency,
        uint256 newRate
    ) external onlyOwner validCurrency(fromCurrency) validCurrency(toCurrency) {
        require(newRate > 0, "Rate must be greater than 0");

        bytes32 pairHash = _getCurrencyPairHash(fromCurrency, toCurrency);

        // Check for excessive price deviation if rate already exists
        if (pairExists[pairHash]) {
            uint256 oldRate = exchangeRates[pairHash].rate;
            uint256 deviation = oldRate > newRate
                ? ((oldRate - newRate) * 10000) / oldRate
                : ((newRate - oldRate) * 10000) / oldRate;

            require(
                deviation <= MAX_PRICE_DEVIATION,
                "Price deviation too large"
            );
        }

        exchangeRates[pairHash] = ExchangeRate({
            rate: newRate,
            lastUpdated: block.timestamp,
            isActive: true
        });

        if (!pairExists[pairHash]) {
            currencyPairs.push(pairHash);
            pairExists[pairHash] = true;
        }

        emit ExchangeRateUpdated(
            fromCurrency,
            toCurrency,
            newRate,
            block.timestamp
        );
    }

    /**
     * @dev Batch update multiple exchange rates
     */
    function batchUpdateRates(
        string[] memory fromCurrencies,
        string[] memory toCurrencies,
        uint256[] memory rates
    ) external onlyOwner {
        require(
            fromCurrencies.length == toCurrencies.length &&
                toCurrencies.length == rates.length,
            "Array lengths must match"
        );

        for (uint i = 0; i < fromCurrencies.length; i++) {
            this.updateExchangeRate(
                fromCurrencies[i],
                toCurrencies[i],
                rates[i]
            );
        }
    }

    /**
     * @dev Convert amount from one currency to another
     */
    function convertCurrency(
        string memory fromCurrency,
        string memory toCurrency,
        uint256 amount
    )
        external
        view
        validCurrency(fromCurrency)
        validCurrency(toCurrency)
        returns (uint256)
    {
        if (keccak256(bytes(fromCurrency)) == keccak256(bytes(toCurrency))) {
            return amount; // Same currency
        }

        bytes32 pairHash = _getCurrencyPairHash(fromCurrency, toCurrency);
        require(pairExists[pairHash], "Currency pair not found");
        require(exchangeRates[pairHash].isActive, "Exchange rate not active");

        ExchangeRate memory rate = exchangeRates[pairHash];
        require(
            block.timestamp - rate.lastUpdated <= PRICE_VALIDITY_PERIOD,
            "Exchange rate expired"
        );

        return (amount * rate.rate) / 1e18;
    }

    /**
     * @dev Get exchange rate for a currency pair
     */
    function getExchangeRate(
        string memory fromCurrency,
        string memory toCurrency
    ) external view returns (uint256 rate, uint256 lastUpdated, bool isActive) {
        bytes32 pairHash = _getCurrencyPairHash(fromCurrency, toCurrency);
        ExchangeRate memory exchangeRate = exchangeRates[pairHash];
        return (
            exchangeRate.rate,
            exchangeRate.lastUpdated,
            exchangeRate.isActive
        );
    }

    /**
     * @dev Get all supported currencies
     */
    function getSupportedCurrencies() external view returns (string[] memory) {
        return currencyList;
    }

    /**
     * @dev Get all currency pairs
     */
    function getAllCurrencyPairs()
        external
        view
        returns (CurrencyPair[] memory)
    {
        CurrencyPair[] memory pairs = new CurrencyPair[](currencyPairs.length);

        for (uint i = 0; i < currencyPairs.length; i++) {
            bytes32 pairHash = currencyPairs[i];
            ExchangeRate memory rate = exchangeRates[pairHash];

            // Note: In a real implementation, you'd need to store currency names
            // This is simplified for demonstration
            pairs[i] = CurrencyPair({
                fromCurrency: "UNKNOWN", // Would need to be stored separately
                toCurrency: "UNKNOWN", // Would need to be stored separately
                rate: rate.rate,
                lastUpdated: rate.lastUpdated
            });
        }

        return pairs;
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // Internal functions

    function _addCurrency(string memory currency) internal {
        require(!supportedCurrencies[currency], "Currency already supported");
        supportedCurrencies[currency] = true;
        currencyList.push(currency);
        emit CurrencyAdded(currency);
    }

    function _getCurrencyPairHash(
        string memory fromCurrency,
        string memory toCurrency
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(fromCurrency, "_", toCurrency));
    }

    function _setInitialRates() internal {
        // Set some initial rates (1 USD to other currencies)
        // These are example rates and should be updated with real data

        // USD to EUR (1 USD = 0.85 EUR)
        bytes32 usdEurHash = _getCurrencyPairHash("USD", "EUR");
        exchangeRates[usdEurHash] = ExchangeRate({
            rate: 0.85e18,
            lastUpdated: block.timestamp,
            isActive: true
        });
        currencyPairs.push(usdEurHash);
        pairExists[usdEurHash] = true;

        // USD to GBP (1 USD = 0.73 GBP)
        bytes32 usdGbpHash = _getCurrencyPairHash("USD", "GBP");
        exchangeRates[usdGbpHash] = ExchangeRate({
            rate: 0.73e18,
            lastUpdated: block.timestamp,
            isActive: true
        });
        currencyPairs.push(usdGbpHash);
        pairExists[usdGbpHash] = true;

        // USD to JPY (1 USD = 110 JPY)
        bytes32 usdJpyHash = _getCurrencyPairHash("USD", "JPY");
        exchangeRates[usdJpyHash] = ExchangeRate({
            rate: 110e18,
            lastUpdated: block.timestamp,
            isActive: true
        });
        currencyPairs.push(usdJpyHash);
        pairExists[usdJpyHash] = true;
    }
}
