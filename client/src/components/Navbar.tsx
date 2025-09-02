import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { useBlockchain } from "../context/BlockchainContext";
import WalletConnectionModal from "./WalletConnectionModal";
import { BlockchainContextType } from "../types";

const Navbar: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const user = session?.user;
  const { account, connectWallet, disconnectWallet, isConnected } =
    useBlockchain() as BlockchainContextType;
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  // Check if user is authenticated via either Redux or NextAuth
  const isUserAuthenticated = isAuthenticated || !!session;

  const handleLogout = async (): Promise<void> => {
    await signOut({ redirect: false });
    disconnectWallet();
    router.push("/");
    setIsMenuOpen(false);
  };

  const handleWalletConnect = async (account: string, walletName: string) => {
    try {
      // Store the wallet connection info
      console.log(`Connected to ${walletName} with account:`, account);
      // The WalletConnectionModal already handled the connection
      // Just update the blockchain context state by calling connectWallet
      // which will sync the state properly
      await connectWallet();
      setShowWalletModal(false); // Close the modal after successful connection
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-white text-2xl font-bold">RemitXpress</h1>
            </Link>

            {isUserAuthenticated && (
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link
                  href="/dashboard"
                  className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/send-money"
                  className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Send Money
                </Link>
                <Link
                  href="/transactions"
                  className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Transactions
                </Link>
                <Link
                  href="/wallet"
                  className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Wallet
                </Link>
                {/* Admin link removed - implement role-based access if needed */}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          {isUserAuthenticated && (
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-blue-100 hover:text-white p-2"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {!isUserAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {/* Wallet Connection - Hidden on mobile */}
                <div className="hidden md:block">
                  {isConnected ? (
                    <div className="text-blue-100 text-sm">
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowWalletModal(true)}
                      className="bg-green-500 hover:bg-green-400 text-white px-3 py-1 rounded text-sm"
                    >
                      Connect Wallet
                    </button>
                  )}
                </div>

                {/* User Menu - Hidden on mobile */}
                <div className="hidden md:block relative">
                  <button
                    onClick={toggleMenu}
                    className="flex items-center text-blue-100 hover:text-white"
                  >
                    <span className="mr-2">{user?.name || "User"}</span>
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isUserAuthenticated && isMenuOpen && (
        <div className="md:hidden bg-blue-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* User Profile Section */}
            <div className="px-3 py-3 border-b border-blue-600">
              <div className="flex items-center">
                <div className="text-white font-medium">
                  {user?.name || "User"}
                </div>
              </div>
              <div className="text-blue-200 text-sm">{user?.email}</div>
            </div>

            {/* Navigation Links */}
            <Link
              href="/dashboard"
              className="block px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-600 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/send-money"
              className="block px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-600 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Send Money
            </Link>
            <Link
              href="/transactions"
              className="block px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-600 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Transactions
            </Link>
            <Link
              href="/wallet"
              className="block px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-600 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Wallet
            </Link>
            {/* Admin link removed - implement role-based access if needed */}

            {/* Wallet Connection in Mobile */}
            <div className="px-3 py-2">
              {isConnected ? (
                <div className="text-blue-100 text-sm">
                  Wallet: {account?.slice(0, 6)}...{account?.slice(-4)}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowWalletModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded text-sm w-full"
                >
                  Connect Wallet
                </button>
              )}
            </div>

            {/* User Actions */}
            <div className="border-t border-blue-600 pt-2">
              <Link
                href="/settings"
                className="block px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-600 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-600 rounded-md text-base font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection Modal */}
      <WalletConnectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleWalletConnect}
      />
    </nav>
  );
};

export default Navbar;
