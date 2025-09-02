import React, { useState } from "react";

const WalletConnectionModal = ({ isOpen, onClose, onConnect }) => {
  const [connecting, setConnecting] = useState(null);

  const wallets = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: "🦊",
      description: "Connect to your MetaMask wallet",
      installed: typeof window !== "undefined" && window.ethereum?.isMetaMask,
      downloadUrl: "https://metamask.io/download/",
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "🔷",
      description: "Connect to your Coinbase wallet",
      installed:
        typeof window !== "undefined" && window.ethereum?.isCoinbaseWallet,
      downloadUrl: "https://wallet.coinbase.com/",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: "🔗",
      description: "Scan with WalletConnect to connect",
      installed: true, // WalletConnect doesn't need installation
      downloadUrl: null,
    },
    {
      id: "trustwallet",
      name: "Trust Wallet",
      icon: "🛡️",
      description: "Connect to your Trust wallet",
      installed: typeof window !== "undefined" && window.ethereum?.isTrust,
      downloadUrl: "https://trustwallet.com/download",
    },
  ];

  const handleWalletConnect = async (wallet) => {
    setConnecting(wallet.id);

    try {
      let account = null;

      switch (wallet.id) {
        case "metamask":
          if (window.ethereum?.isMetaMask) {
            const accounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            });
            account = accounts[0];
          } else {
            alert("MetaMask is not installed. Please install it first.");
            window.open(wallet.downloadUrl, "_blank");
            return;
          }
          break;

        case "coinbase":
          if (window.ethereum?.isCoinbaseWallet) {
            const accounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            });
            account = accounts[0];
          } else {
            alert("Coinbase Wallet is not installed. Please install it first.");
            window.open(wallet.downloadUrl, "_blank");
            return;
          }
          break;

        case "walletconnect":
          // For WalletConnect, you would typically use the WalletConnect library
          alert(
            "WalletConnect integration coming soon! For now, please use MetaMask."
          );
          return;

        case "trustwallet":
          if (window.ethereum?.isTrust) {
            const accounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            });
            account = accounts[0];
          } else {
            alert("Trust Wallet is not installed. Please install it first.");
            window.open(wallet.downloadUrl, "_blank");
            return;
          }
          break;

        default:
          alert("Wallet not supported yet.");
          return;
      }

      if (account) {
        onConnect(account, wallet.name);
        onClose();
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      if (error.code === 4001) {
        alert("Connection rejected by user.");
      } else {
        alert("Failed to connect wallet. Please try again.");
      }
    } finally {
      setConnecting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Connect Wallet</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
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
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p className="mb-6 text-sm text-gray-600">
            Choose a wallet to connect to RemitXpress. Make sure you have the
            wallet installed.
          </p>

          <div className="space-y-3">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleWalletConnect(wallet)}
                disabled={connecting === wallet.id}
                className={`w-full p-4 border rounded-lg text-left transition-all duration-200 ${
                  wallet.installed
                    ? "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                    : "border-gray-100 bg-gray-50 cursor-not-allowed"
                } ${connecting === wallet.id ? "opacity-50 cursor-wait" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {wallet.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {wallet.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!wallet.installed && wallet.downloadUrl && (
                      <span className="px-2 py-1 text-xs text-orange-600 bg-orange-100 rounded">
                        Install
                      </span>
                    )}
                    {wallet.installed && (
                      <span className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded">
                        Ready
                      </span>
                    )}
                    {connecting === wallet.id && (
                      <div className="w-4 h-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 mt-6 rounded-lg bg-gray-50">
            <h4 className="mb-2 font-medium text-gray-800">
              New to crypto wallets?
            </h4>
            <p className="mb-3 text-sm text-gray-600">
              Crypto wallets allow you to store, send, and receive digital
              currencies securely.
            </p>
            <button
              onClick={() =>
                window.open("https://ethereum.org/en/wallets/", "_blank")
              }
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Learn more about wallets →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectionModal;
