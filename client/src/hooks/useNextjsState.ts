import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { authAPI, remitAPI } from "../services/api";

/**
 * Custom hook for authentication using NextAuth.js
 * This replaces Redux auth slice with Next.js built-in auth
 */
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user || null,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    session,
  };
}

/**
 * Custom hook for transaction management using React Query
 * This replaces Redux transaction slice with proper data fetching
 */
export function useTransactions() {
  const queryClient = useQueryClient();

  // Fetch transaction history
  const {
    data: transactions,
    isLoading,
    error,
  } = useQuery("transactions", () => remitAPI.getTransactionHistory({}));

  // Send money mutation
  const sendMoneyMutation = useMutation(
    (transactionData: any) => remitAPI.sendMoney(transactionData),
    {
      onSuccess: () => {
        // Invalidate and refetch transactions
        queryClient.invalidateQueries("transactions");
      },
    }
  );

  return {
    transactions: transactions?.data || [],
    isLoading,
    error,
    sendMoney: sendMoneyMutation.mutate,
    isSending: sendMoneyMutation.isLoading,
    sendError: sendMoneyMutation.error,
  };
}

/**
 * Simple wallet state using React Context (no Redux needed)
 */
export function useWallet() {
  // This can be implemented with React Context or local state
  // No need for Redux for simple wallet state
  return {
    balance: 0,
    isConnected: false,
    // ... other wallet state
  };
}
