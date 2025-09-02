import React, { useState, useEffect } from "react";
import { BlockchainService } from "../services/blockchainService";

interface NetworkStatus {
  connected: boolean;
  chainId?: number;
  chainName?: string;
  latestBlock?: number;
  gasPrice?: number;
  explorerUrl?: string;
  error?: string;
}

export const BlockchainStatusBanner: React.FC = () => {
  const [status, setStatus] = useState<NetworkStatus>({ connected: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkNetworkStatus();

    // Check network status every 30 seconds
    const interval = setInterval(checkNetworkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkNetworkStatus = async () => {
    try {
      const networkStatus = await BlockchainService.getNetworkStatus();
      setStatus(networkStatus);
    } catch (error) {
      setStatus({
        connected: false,
        error: "Failed to check network status",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatGasPrice = (gasPrice?: number) => {
    if (!gasPrice) return "Unknown";
    return `${(gasPrice / 1e9).toFixed(2)} gwei`;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 border-l-4 border-gray-400 p-3 mb-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-3"></div>
          <span className="text-sm text-gray-600">
            Checking blockchain status...
          </span>
        </div>
      </div>
    );
  }

  if (!status.connected) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-red-500">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <strong>Blockchain Offline:</strong>{" "}
              {status.error || "Unable to connect to Ethereum Sepolia"}
              <br />
              <span className="text-xs">
                High-value transactions will use Firebase fallback
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-green-500">⛓️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <strong>Blockchain Connected:</strong> {status.chainName}
              <br />
              <span className="text-xs">
                Block #{status.latestBlock?.toLocaleString()} • Gas:{" "}
                {formatGasPrice(status.gasPrice)}
              </span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <button
            onClick={checkNetworkStatus}
            className="text-xs text-green-600 hover:text-green-800 underline"
          >
            Refresh
          </button>
          {status.explorerUrl && (
            <div>
              <a
                href={status.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:text-green-800 underline"
              >
                View Explorer
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockchainStatusBanner;
