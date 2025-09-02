import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ethers } from "ethers";
import { BlockchainContextType } from "../types";

const BlockchainContext = createContext<BlockchainContextType>({
  account: null,
  isConnected: false,
  balance: null,
  provider: null,
  signer: null,
  chainId: null,
  connectWallet: async () => "",
  disconnectWallet: () => {},
  switchNetwork: async () => {},
  signMessage: async () => "",
});

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
};

export const BlockchainProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);

  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
    }
  }, []);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (provider && account) {
      try {
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    }
  }, [provider, account]);

  // Fetch balance when account changes
  useEffect(() => {
    if (account && provider) {
      fetchBalance();
    }
  }, [account, provider, fetchBalance]);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      setIsLoading(true);
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const address = await web3Signer.getAddress();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      // Fetch balance after connecting
      const balance = await web3Provider.getBalance(address);
      setBalance(ethers.formatEther(balance));

      return address;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setBalance(null);
  };

  // Switch network
  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error) {
      console.error("Failed to switch network:", error);
      throw error;
    }
  };

  // Sign message
  const signMessage = async (message: string) => {
    if (!signer) {
      throw new Error("Wallet not connected");
    }

    try {
      return await signer.signMessage(message);
    } catch (error) {
      console.error("Failed to sign message:", error);
      throw error;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [account]);

  const value = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isLoading,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    signMessage,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};
