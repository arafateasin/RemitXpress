import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useBlockchain } from "../src/context/BlockchainContext";
import { useState, useEffect } from "react";

const DashboardPage: NextPage = () => {
  const { data: session } = useSession();
  const { account, connectWallet, disconnectWallet, isConnected, balance } = useBlockchain();
  const [recentTransactions] = useState([
    {
      id: "TX001",
      recipient: "John Doe",
      amount: 500,
      currency: "USD",
      status: "completed",
      date: "2024-12-15",
      fee: 5,
      type: "sent"
    },
    {
      id: "TX002",
      recipient: "Maria Garcia",
      amount: 250,
      currency: "EUR",
      status: "pending",
      date: "2024-12-14",
      fee: 2.5,
      type: "sent"
    },
    {
      id: "TX003",
      recipient: "James Wilson",
      amount: 750,
      currency: "GBP",
      status: "completed",
      date: "2024-12-13",
      fee: 7.5,
      type: "received"
    }
  ]);

  const [stats] = useState({
    totalSent: 15750,
    totalReceived: 8420,
    totalFees: 157.5,
    successRate: 99.8
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white">RemitXpress</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <nav className="flex space-x-6">
                <Link href="/dashboard" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium bg-white/10">
                  Dashboard
                </Link>
                <Link href="/send-money" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors">
                  Send Money
                </Link>
                <Link href="/transactions" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors">
                  Transactions
                </Link>
                <Link href="/wallet" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors">
                  Wallet
                </Link>
                <Link href="/settings" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors">
                  Settings
                </Link>
              </nav>

              {/* Wallet Connection */}
              {isConnected ? (
                <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="text-xs text-red-300 hover:text-red-200"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Connect Wallet
                </button>
              )}

              <div className="text-right">
                <p className="text-white/80 text-sm">Welcome back,</p>
                <p className="text-white font-semibold">{session?.user?.name || session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to your Dashboard
          </h2>
          <p className="text-gray-600">
            Track your transfers, manage your wallet, and send money worldwide with just a few clicks.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/send-money" className="group bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white hover:from-blue-600 hover:to-blue-700 transition-all transform hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Send Money</h3>
            <p className="text-blue-100 text-sm">Send money globally with 1% fee</p>
          </Link>

          <Link href="/wallet" className="group bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white hover:from-green-600 hover:to-green-700 transition-all transform hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">My Wallet</h3>
            <p className="text-green-100 text-sm">Manage your digital assets</p>
          </Link>

          <Link href="/transactions" className="group bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white hover:from-purple-600 hover:to-purple-700 transition-all transform hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Transactions</h3>
            <p className="text-purple-100 text-sm">View transfer history</p>
          </Link>

          <button className="group bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white hover:from-orange-600 hover:to-orange-700 transition-all transform hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Support</h3>
            <p className="text-orange-100 text-sm">Get help 24/7</p>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-green-500 text-sm font-medium">↗ +12%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${stats.totalSent.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Total Sent</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-green-500 text-sm font-medium">↗ +8%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${stats.totalReceived.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Total Received</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-red-500 text-sm font-medium">↓ -15%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${stats.totalFees.toFixed(2)}</h3>
            <p className="text-gray-600 text-sm">Total Fees Paid</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-green-500 text-sm font-medium">↗ +0.1%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.successRate}%</h3>
            <p className="text-gray-600 text-sm">Success Rate</p>
          </div>
        </div>

        {/* Recent Transactions & Wallet Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                <Link href="/transactions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        transaction.type === 'sent' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {transaction.type === 'sent' ? (
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{transaction.recipient}</p>
                        <p className="text-sm text-gray-600">{transaction.date}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'sent' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'sent' ? '-' : '+'}${transaction.amount} {transaction.currency}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-400' : 
                          transaction.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></span>
                        <span className="text-sm text-gray-600 capitalize">{transaction.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Wallet Status */}
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-2xl text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Wallet Balance</h3>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-3xl font-bold mb-1">$12,450.00</p>
                <p className="text-blue-100 text-sm">Available Balance</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-100">USD</p>
                  <p className="font-semibold">$8,450</p>
                </div>
                <div>
                  <p className="text-blue-100">EUR</p>
                  <p className="font-semibold">€3,200</p>
                </div>
              </div>
            </div>

            {/* Blockchain Status */}
            {isConnected ? (
              <div className="bg-green-50 border border-green-200 p-6 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-800">Wallet Connected</h3>
                </div>
                <p className="text-green-700 text-sm mb-3">
                  {account?.slice(0, 8)}...{account?.slice(-8)}
                </p>
                {balance && (
                  <p className="text-green-600 text-sm">
                    Balance: {parseFloat(balance).toFixed(4)} ETH
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-yellow-800">Connect Wallet</h3>
                </div>
                <p className="text-yellow-700 text-sm mb-4">
                  Connect your MetaMask wallet for blockchain features
                </p>
                <button
                  onClick={connectWallet}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Connect Now
                </button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl">
              <h3 className="font-semibold text-gray-900 mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Transfers Sent</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Average Fee</span>
                  <span className="font-semibold">1.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Fastest Transfer</span>
                  <span className="font-semibold">2.3 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
