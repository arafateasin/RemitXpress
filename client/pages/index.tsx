import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useBlockchain } from "../src/context/BlockchainContext";
import { useState, useEffect } from "react";

export default function Index() {
  const { data: session } = useSession();
  const { account, connectWallet, disconnectWallet, isConnected } =
    useBlockchain();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
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
                  <h1
                    className={`text-2xl font-bold ${
                      isScrolled ? "text-gray-900" : "text-white"
                    }`}
                  >
                    RemitXpress
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`${
                      isScrolled
                        ? "text-gray-700 hover:text-blue-600"
                        : "text-white/90 hover:text-white"
                    } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/send-money"
                    className={`${
                      isScrolled
                        ? "text-gray-700 hover:text-blue-600"
                        : "text-white/90 hover:text-white"
                    } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                  >
                    Send Money
                  </Link>
                  <Link
                    href="/wallet"
                    className={`${
                      isScrolled
                        ? "text-gray-700 hover:text-blue-600"
                        : "text-white/90 hover:text-white"
                    } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                  >
                    Wallet
                  </Link>

                  {/* Wallet Connection */}
                  {isConnected ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-white/70">
                        {account?.slice(0, 6)}...{account?.slice(-4)}
                      </span>
                      <button
                        onClick={disconnectWallet}
                        className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={connectWallet}
                      className="px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                      Connect Wallet
                    </button>
                  )}

                  <button
                    onClick={() => signOut()}
                    className={`${
                      isScrolled
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-white/20 hover:bg-white/30"
                    } text-white px-4 py-2 rounded-lg text-sm font-medium transition-all`}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`${
                      isScrolled
                        ? "text-gray-700 hover:text-blue-600"
                        : "text-white/90 hover:text-white"
                    } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-600 hover:to-purple-700 text-sm font-medium transition-all shadow-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20 overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute rounded-full top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 blur-3xl animate-pulse"></div>
          <div className="absolute delay-1000 rounded-full bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 blur-3xl animate-pulse"></div>
        </div>

        <div className="relative px-4 py-32 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 mb-6 space-x-2 text-sm text-white rounded-full bg-white/10 backdrop-blur-md">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>
                  Only 1% Fee • Instant Transfers • Blockchain Secured
                </span>
              </div>
            </div>

            <h1 className="mb-6 text-6xl font-extrabold leading-tight text-white">
              Send Money
              <span className="block text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                Anywhere, Instantly
              </span>
            </h1>

            <p className="max-w-3xl mx-auto mb-12 text-xl leading-relaxed text-white/80">
              Revolutionary blockchain-powered money transfers to 200+
              countries. Pay only 1% fee with real-time tracking and bank-level
              security.
            </p>

            {session ? (
              <div className="max-w-lg p-8 mx-auto border bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">
                  Welcome back, {session.user?.name || "User"}!
                </h3>
                <p className="mb-8 text-white/70">
                  Ready to send money worldwide?
                </p>
                <div className="space-y-4">
                  <Link
                    href="/send-money"
                    className="block w-full px-8 py-4 text-lg font-semibold text-white transition-all shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700"
                  >
                    Send Money Now
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block w-full px-8 py-4 font-medium text-white transition-all border bg-white/10 border-white/30 rounded-xl hover:bg-white/20"
                  >
                    View Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="max-w-lg p-8 mx-auto border bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <svg
                      className="w-8 h-8 text-white"
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
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">
                  Start Your Journey
                </h3>
                <p className="mb-8 text-white/70">
                  Join thousands sending money globally
                </p>
                <div className="space-y-4">
                  <Link
                    href="/register"
                    className="block w-full px-8 py-4 text-lg font-semibold text-white transition-all shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full px-8 py-4 font-medium text-white transition-all border bg-white/10 border-white/30 rounded-xl hover:bg-white/20"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* World Money Transfer Illustration Section */}
      <div className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
                Welcome to <span className="text-blue-600">RemitXpress</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                Secure, fast, and affordable international money transfers
                powered by blockchain technology. Send money to over 150
                countries with transparent fees and real-time tracking.
              </p>

              {/* Professional Features Highlight */}
              <div className="flex flex-wrap justify-center gap-4 mt-8 lg:justify-start">
                <div className="inline-flex items-center px-4 py-2 text-sm font-semibold text-green-700 bg-green-100 rounded-full">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Only 1% Fee
                </div>
                <div className="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                  <svg
                    className="w-4 h-4 mr-2"
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
                  Instant Transfers
                </div>
                <div className="inline-flex items-center px-4 py-2 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full">
                  <svg
                    className="w-4 h-4 mr-2"
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
                  Blockchain Secured
                </div>
              </div>

              {session ? (
                <div className="p-6 mt-8 border border-green-200 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <div className="flex items-center justify-center mb-4 lg:justify-start">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-lg font-medium text-green-800">
                    Welcome back, {session.user?.name || session.user?.email}!
                  </p>
                  <p className="mt-2 text-green-600">
                    Ready to send money worldwide?
                  </p>
                  <div className="mt-6 space-y-3">
                    <Link
                      href="/dashboard"
                      className="inline-block w-full px-6 py-3 text-center text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      Go to Dashboard
                    </Link>
                    <Link
                      href="/send-money"
                      className="inline-block w-full px-6 py-3 text-center text-green-600 transition-colors bg-white border border-green-600 rounded-lg hover:bg-green-50"
                    >
                      Send Money Now
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right Column - Simple Professional Illustration */}
            <div className="relative">
              <div className="relative p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl">
                {/* Simple Professional Graphics */}
                <div className="text-center">
                  <div className="flex items-center justify-center w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <svg
                      className="w-16 h-16 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <h3 className="mb-4 text-2xl font-bold text-gray-800">
                    Global Money Transfers
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Send money to 150+ countries with blockchain security
                  </p>

                  {/* Simple Features List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">Only 1% Fee</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">Instant Transfers</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-purple-600">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">Blockchain Secured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Why Choose RemitXpress?
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Experience the future of international money transfers
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="p-8 text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-2xl">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Bank-Level Security
              </h3>
              <p className="leading-relaxed text-gray-600">
                Your transfers are protected by military-grade encryption and
                blockchain technology, ensuring maximum security for every
                transaction.
              </p>
            </div>

            <div className="p-8 text-center bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-green-600 rounded-2xl">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Lightning Fast
              </h3>
              <p className="leading-relaxed text-gray-600">
                Send money in minutes, not days. Our blockchain infrastructure
                enables near-instant transfers to over 150 countries worldwide.
              </p>
            </div>

            <div className="p-8 text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-purple-600 rounded-2xl">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Transparent Pricing
              </h3>
              <p className="leading-relaxed text-gray-600">
                No hidden fees, no surprises. Our competitive rates and
                transparent pricing help you save money on every transfer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-gray-900">
              Trusted by Thousands Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-blue-600">150+</div>
              <div className="text-gray-600">Countries Supported</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-green-600">
                $50M+
              </div>
              <div className="text-gray-600">Total Transferred</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-purple-600">
                99.9%
              </div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600">
                24/7
              </div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-extrabold text-white">
            Ready to Send Money?
          </h2>
          <p className="mb-8 text-xl text-blue-100">
            Join thousands of users who trust RemitXpress for their
            international transfers
          </p>
          {!session && (
            <div className="space-x-4">
              <Link
                href="/register"
                className="inline-block px-8 py-4 font-medium text-blue-600 transition-colors bg-white rounded-lg hover:bg-gray-50"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="inline-block px-8 py-4 font-medium text-white transition-colors border-2 border-white rounded-lg hover:bg-white hover:text-blue-600"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 text-white bg-gray-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold">RemitXpress</h3>
              <p className="text-gray-400">
                The future of international money transfers, powered by
                blockchain technology.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-medium">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/send-money" className="hover:text-white">
                    Send Money
                  </Link>
                </li>
                <li>
                  <Link href="/wallet" className="hover:text-white">
                    Wallet
                  </Link>
                </li>
                <li>
                  <Link href="/transactions" className="hover:text-white">
                    Transactions
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-medium">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button className="text-left hover:text-white">
                    About Us
                  </button>
                </li>
                <li>
                  <button className="text-left hover:text-white">
                    Careers
                  </button>
                </li>
                <li>
                  <button className="text-left hover:text-white">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-medium">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button className="text-left hover:text-white">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="text-left hover:text-white">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="text-left hover:text-white">
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-8 text-center text-gray-400 border-t border-gray-800">
            <p>&copy; 2024 RemitXpress. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
