import { useState } from "react";
import { NextPage } from "next";
import Link from "next/link";

const WalletPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  // MetaMask connection functions
  const connectMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setWalletAddress(account);
        setIsConnected(true);

        // Get balance
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [account, "latest"],
        });

        // Convert from wei to ETH
        const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
        setBalance(ethBalance.toFixed(4));

        alert("MetaMask connected successfully!");
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        alert("Failed to connect MetaMask");
      }
    } else {
      alert("Please install MetaMask to use this feature");
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress("");
    setBalance("0");
  };

  const handleAddFundsFromMetaMask = async () => {
    if (!isConnected) {
      alert("Please connect MetaMask first");
      return;
    }

    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);

    try {
      // Convert amount to wei
      const amountInWei = (
        parseFloat(addFundsAmount) * Math.pow(10, 18)
      ).toString(16);

      // Send transaction
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: walletAddress,
            to: "0x742d35Cc6634C0532925a3b8D6Bf9B85F40D6B0C", // Your contract address
            value: "0x" + amountInWei,
          },
        ],
      });

      alert(`Funds added successfully! Transaction: ${txHash}`);
      setShowAddFunds(false);
      setAddFundsAmount("");

      // Refresh balance after transaction
      setTimeout(() => {
        connectMetaMask();
      }, 2000);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdrawToMetaMask = async () => {
    if (!isConnected) {
      alert("Please connect MetaMask first");
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);

    try {
      // In a real app, this would call your backend API to process the withdrawal
      // For demo purposes, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(
        `Withdrawal of ${withdrawAmount} USD to MetaMask wallet initiated!`
      );
      setShowWithdraw(false);
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("Withdrawal failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock wallet data
  const [walletData] = useState({
    balance: 2150.75,
    currency: "USD",
    cryptoBalances: [
      {
        symbol: "ETH",
        name: "Ethereum",
        balance: 1.25,
        usdValue: 2485.5,
        change: "+5.2%",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        balance: 1000,
        usdValue: 1000.0,
        change: "0.0%",
      },
      {
        symbol: "USDT",
        name: "Tether",
        balance: 500,
        usdValue: 500.25,
        change: "+0.1%",
      },
    ],
    recentActivity: [
      {
        type: "deposit",
        amount: 500,
        currency: "USD",
        date: "2024-12-15",
        status: "completed",
      },
      {
        type: "transfer",
        amount: 250,
        currency: "USD",
        date: "2024-12-14",
        status: "completed",
      },
      {
        type: "deposit",
        amount: 1000,
        currency: "USDC",
        date: "2024-12-13",
        status: "completed",
      },
      {
        type: "withdrawal",
        amount: 100,
        currency: "USD",
        date: "2024-12-12",
        status: "pending",
      },
    ],
    cards: [
      {
        id: 1,
        type: "Visa",
        last4: "4532",
        expiry: "12/26",
        isDefault: true,
        cardholderName: "John Doe",
      },
      {
        id: 2,
        type: "Mastercard",
        last4: "8901",
        expiry: "09/25",
        isDefault: false,
        cardholderName: "John Doe",
      },
    ],
  });

  const connectWallet = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        setIsConnected(true);

        // Get balance
        const balanceWei = await window.ethereum.request({
          method: "eth_getBalance",
          params: [accounts[0], "latest"],
        });
        const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18);
        setBalance(balanceEth.toFixed(4));
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    }
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        );
      case "withdrawal":
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </div>
        );
      case "transfer":
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">RemitXpress</h1>
              </Link>
            </div>

            <div className="flex items-center space-x-6">
              <nav className="flex space-x-6">
                <Link
                  href="/dashboard"
                  className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/send-money"
                  className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Send Money
                </Link>
                <Link
                  href="/transactions"
                  className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Transactions
                </Link>
                <Link
                  href="/wallet"
                  className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium bg-white/10"
                >
                  Wallet
                </Link>
                <Link
                  href="/settings"
                  className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Settings
                </Link>
              </nav>

              {/* Wallet Connection */}
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors border border-white/20"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Wallet</h2>
          <p className="text-gray-600">
            Manage your funds, cards, and crypto assets
          </p>
        </div>

        {/* Balance Overview */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/80 text-sm mb-2">Total Balance</p>
              <p className="text-4xl font-bold">
                ${walletData.balance.toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddFunds(true)}
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition-colors"
              >
                Add Funds
              </button>
              <button
                onClick={() => setShowWithdraw(true)}
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white/70 text-sm mb-1">Available to Send</p>
              <p className="text-2xl font-bold">
                ${(walletData.balance * 0.9).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white/70 text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold">$100.00</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white/70 text-sm mb-1">This Month</p>
              <p className="text-2xl font-bold">$1,250</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", name: "Overview", icon: "📊" },
                { id: "crypto", name: "Crypto Assets", icon: "₿" },
                { id: "cards", name: "Payment Methods", icon: "💳" },
                { id: "activity", name: "Recent Activity", icon: "📋" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/send-money"
                    className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">
                      Send Money
                    </span>
                  </Link>

                  <button
                    onClick={() => setShowAddFunds(true)}
                    className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">Add Funds</span>
                  </button>

                  <button className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">Withdraw</span>
                  </button>

                  <Link
                    href="/transactions"
                    className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                      <svg
                        className="w-6 h-6 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">History</span>
                  </Link>
                </div>
              </div>

              {/* Connected Blockchain Wallet */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Blockchain Wallet
                </h3>
                {isConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Wallet Connected
                          </p>
                          <p className="text-sm text-gray-600">
                            {walletAddress.slice(0, 6)}...
                            {walletAddress.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {balance} ETH
                        </p>
                        <p className="text-sm text-gray-600">Ethereum</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Connect Your Wallet
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Connect your MetaMask or other Web3 wallet to access
                      blockchain features
                    </p>
                    <button
                      onClick={connectWallet}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Connect Wallet
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Crypto Assets Tab */}
          {activeTab === "crypto" && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Crypto Assets
                  </h3>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Buy Crypto
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {walletData.cryptoBalances.map((crypto, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {crypto.symbol}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {crypto.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {crypto.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {crypto.balance.toLocaleString()} {crypto.symbol}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-600">
                            ${crypto.usdValue.toLocaleString()}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              crypto.change.startsWith("+")
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {crypto.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === "cards" && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Payment Methods
                  </h3>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Add Card
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {walletData.cards.map((card) => (
                    <div key={card.id} className="relative">
                      <div
                        className={`p-6 rounded-2xl ${
                          card.type === "Visa"
                            ? "bg-gradient-to-r from-blue-600 to-blue-800"
                            : "bg-gradient-to-r from-red-600 to-red-800"
                        } text-white`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold">{card.type}</span>
                          {card.isDefault && (
                            <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-mono tracking-wider">
                            •••• •••• •••• {card.last4}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-white/70">
                                CARDHOLDER NAME
                              </p>
                              <p className="text-sm font-medium">
                                {card.cardholderName}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-white/70">EXPIRES</p>
                              <p className="text-sm font-medium">
                                {card.expiry}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity Tab */}
          {activeTab === "activity" && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {walletData.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                    >
                      <div className="flex items-center space-x-4">
                        {getActivityIcon(activity.type)}
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {activity.type}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            activity.type === "deposit"
                              ? "text-green-600"
                              : activity.type === "withdrawal"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {activity.type === "deposit"
                            ? "+"
                            : activity.type === "withdrawal"
                            ? "-"
                            : ""}
                          {formatAmount(activity.amount, activity.currency)}
                        </p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            activity.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Funds</h3>
              <button
                onClick={() => setShowAddFunds(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-3">
                  {/* Traditional Payment Methods */}
                  <div
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "card"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M2 12v8a2 2 0 002 2h16a2 2 0 002-2v-8M2 12V6a2 2 0 012-2h16a2 2 0 012 2v6M2 12h20" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Credit/Debit Card
                        </div>
                        <div className="text-sm text-gray-500">
                          Visa, Mastercard
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MetaMask Option */}
                  <div
                    onClick={() => setPaymentMethod("metamask")}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "metamask"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">🦊</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          MetaMask Wallet
                        </div>
                        <div className="text-sm text-gray-500">
                          {isConnected
                            ? `Connected: ${walletAddress.slice(
                                0,
                                6
                              )}...${walletAddress.slice(-4)}`
                            : "Connect wallet"}
                        </div>
                      </div>
                      {!isConnected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            connectMetaMask();
                          }}
                          className="ml-auto px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-sm hover:bg-orange-200 transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bank Transfer */}
                  <div
                    onClick={() => setPaymentMethod("bank")}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "bank"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2L2 7v10c0 5.55 3.84 9.739 8.689 9.739 4.849 0 8.689-4.189 8.689-9.739V7L12 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Bank Transfer
                        </div>
                        <div className="text-sm text-gray-500">
                          Direct transfer
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddFunds(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (paymentMethod === "metamask") {
                      handleAddFundsFromMetaMask();
                    } else {
                      // Handle traditional payment methods
                      alert(
                        "Traditional payment processing would be implemented here"
                      );
                      setShowAddFunds(false);
                    }
                  }}
                  disabled={isProcessing || !addFundsAmount}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Add Funds"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Withdraw Funds
              </h3>
              <button
                onClick={() => setShowWithdraw(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Withdraw
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Available balance: ${walletData.balance.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Method
                </label>
                <div className="space-y-3">
                  {/* MetaMask Withdrawal */}
                  <div className="p-4 border border-orange-300 rounded-lg bg-orange-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">🦊</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          MetaMask Wallet
                        </div>
                        <div className="text-sm text-gray-500">
                          {isConnected
                            ? `${walletAddress.slice(
                                0,
                                6
                              )}...${walletAddress.slice(-4)}`
                            : "Connect wallet first"}
                        </div>
                      </div>
                      {!isConnected && (
                        <button
                          onClick={connectMetaMask}
                          className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-sm hover:bg-orange-200 transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bank Account */}
                  <div className="p-4 border border-gray-300 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2L2 7v10c0 5.55 3.84 9.739 8.689 9.739 4.849 0 8.689-4.189 8.689-9.739V7L12 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Bank Account
                        </div>
                        <div className="text-sm text-gray-500">
                          •••• •••• •••• 1234
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowWithdraw(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdrawToMetaMask}
                  disabled={isProcessing || !withdrawAmount || !isConnected}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Withdraw"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
