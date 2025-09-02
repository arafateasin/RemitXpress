import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useBlockchain } from "../context/BlockchainContext";
import WalletConnectionModal from "./WalletConnectionModal";

const WalletManagement = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const { account, isConnected, disconnectWallet } = useBlockchain();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Sample wallet data for demonstration
  const walletData = {
    crypto: {
      ETH: { balance: 0.25, usdValue: 465.75 },
      BTC: { balance: 0.005, usdValue: 215.5 },
      USDT: { balance: 150.0, usdValue: 150.0 },
      BNB: { balance: 2.3, usdValue: 525.2 },
    },
    fiat: {
      MYR: { balance: 2500.0 },
      USD: { balance: 580.0 },
      SGD: { balance: 320.0 },
    },
    transactions: [
      {
        id: 1,
        type: "deposit",
        amount: 100,
        currency: "USDT",
        date: "2025-08-27",
        status: "completed",
      },
      {
        id: 2,
        type: "withdrawal",
        amount: 0.1,
        currency: "ETH",
        date: "2025-08-26",
        status: "pending",
      },
      {
        id: 3,
        type: "send",
        amount: 50,
        currency: "USDT",
        date: "2025-08-25",
        status: "completed",
      },
    ],
  };

  const totalCryptoValue = Object.values(walletData.crypto).reduce(
    (total, coin) => total + coin.usdValue,
    0
  );
  const totalFiatValue = Object.values(walletData.fiat).reduce(
    (total, currency) => total + currency.balance,
    0
  );

  const handleWalletConnect = async (account, walletName) => {
    console.log(`Connected to ${walletName} with account:`, account);
    setShowWalletModal(false);
  };

  const WalletOverview = () => (
    <div className="space-y-6">
      {/* Connected Wallet Status */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Wallet Connection
        </h3>
        {isConnected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                <span className="font-semibold text-green-600">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Wallet Connected</p>
                <p className="text-sm text-gray-600">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </p>
              </div>
            </div>
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
              <span className="text-2xl text-gray-400">🔗</span>
            </div>
            <h4 className="mb-2 text-lg font-medium text-gray-900">
              No Wallet Connected
            </h4>
            <p className="mb-4 text-gray-600">
              Connect your crypto wallet to start managing your digital assets
            </p>
            <button
              onClick={() => setShowWalletModal(true)}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <span className="text-blue-600">₿</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Crypto Balance</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${totalCryptoValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
              <span className="text-green-600">💵</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Fiat Balance</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${totalFiatValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
              <span className="text-purple-600">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${(totalCryptoValue + totalFiatValue).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="mb-2 text-2xl">💸</div>
            <span className="text-sm font-medium text-gray-900">
              Send Money
            </span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="mb-2 text-2xl">💳</div>
            <span className="text-sm font-medium text-gray-900">Add Funds</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="mb-2 text-2xl">🔄</div>
            <span className="text-sm font-medium text-gray-900">Exchange</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="mb-2 text-2xl">📊</div>
            <span className="text-sm font-medium text-gray-900">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );

  const CryptoBalances = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Cryptocurrency Balances
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {Object.entries(walletData.crypto).map(([symbol, data]) => (
            <div
              key={symbol}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                  <span className="font-semibold text-gray-700">{symbol}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{symbol}</p>
                  <p className="text-sm text-gray-600">
                    {data.balance} {symbol}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${data.usdValue.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">USD Value</p>
              </div>
            </div>
          ))}
        </div>

        {!isConnected && (
          <div className="p-4 mt-6 border border-yellow-200 rounded-lg bg-yellow-50">
            <p className="text-sm text-yellow-800">
              Connect your wallet to see live cryptocurrency balances and
              perform transactions.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const FiatBalances = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Fiat Currency Balances
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {Object.entries(walletData.fiat).map(([currency, data]) => (
            <div
              key={currency}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <span className="font-semibold text-blue-700">
                    {currency}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currency}</p>
                  <p className="text-sm text-gray-600">Fiat Currency</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {currency} {data.balance.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Available Balance</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col mt-6 space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
          <button className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Add Funds
          </button>
          <button className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );

  const WalletSettings = () => (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Security Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your wallet
              </p>
            </div>
            <button className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">
              Enable
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">
                Biometric Authentication
              </h4>
              <p className="text-sm text-gray-600">
                Use fingerprint or face recognition
              </p>
            </div>
            <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
              Setup
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">
                Transaction Notifications
              </h4>
              <p className="text-sm text-gray-600">
                Get notified for all wallet transactions
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Wallet Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Default Currency
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="MYR">Malaysian Ringgit (MYR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="SGD">Singapore Dollar (SGD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Transaction Limit
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="1000">RM 1,000 per day</option>
              <option value="5000">RM 5,000 per day</option>
              <option value="10000">RM 10,000 per day</option>
              <option value="custom">Custom limit</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <WalletOverview />;
      case "crypto":
        return <CryptoBalances />;
      case "fiat":
        return <FiatBalances />;
      case "settings":
        return <WalletSettings />;
      default:
        return <WalletOverview />;
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Wallet Management
          </h1>
          <p className="mt-2 text-gray-600">
            Connect and manage your crypto wallets and fiat balances
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex px-6 space-x-8">
              {[
                { id: "overview", name: "Overview", icon: "📊" },
                { id: "crypto", name: "Crypto", icon: "₿" },
                { id: "fiat", name: "Fiat", icon: "💵" },
                { id: "settings", name: "Settings", icon: "⚙️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Wallet Connection Modal */}
        <WalletConnectionModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onConnect={handleWalletConnect}
        />
      </div>
    </div>
  );
};

export default WalletManagement;
