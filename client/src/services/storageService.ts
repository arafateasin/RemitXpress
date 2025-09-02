import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { TransactionData } from "../types";
import { BlockchainService } from "./blockchainService";
import { NotificationService } from "./notificationService";
import { PerformanceService } from "./performanceService";

export class FirebaseService {
  // User transactions collection
  static async saveTransaction(userId: string, transaction: TransactionData) {
    try {
      // Check if Firebase is available
      if (!db) {
        console.warn("Firebase not available, cannot save transaction");
        return null;
      }

      const docRef = await addDoc(collection(db, "transactions"), {
        ...transaction,
        userId,
        createdAt: new Date(),
        source: "oauth", // Mark as OAuth transaction
      });

      console.log("Transaction saved to Firebase with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error saving transaction to Firebase: ", error);
      return null;
    }
  }

  // Get user transactions
  static async getUserTransactions(userId: string) {
    try {
      // Check if Firebase is available
      if (!db) {
        console.warn("Firebase not available, returning empty array");
        return [];
      }

      // Temporary: Simple query without orderBy (until index is created)
      // After creating the index, we can add back: orderBy("createdAt", "desc")
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const transactions: any[] = [];

      querySnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Sort in JavaScript temporarily (slower but works without index)
      transactions.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      return transactions;
    } catch (error) {
      console.error("Error getting transactions from Firebase: ", error);
      return [];
    }
  }

  // Save user profile data
  static async saveUserProfile(userId: string, profileData: any) {
    try {
      // Check if Firebase is available
      if (!db) {
        console.warn("Firebase not available, cannot save profile");
        return null;
      }

      const docRef = await addDoc(collection(db, "users"), {
        userId,
        ...profileData,
        updatedAt: new Date(),
      });

      console.log("User profile saved to Firebase with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error saving user profile to Firebase: ", error);
      return null;
    }
  }
}

// Local storage fallback
export class LocalStorageService {
  static saveTransaction(userId: string, transaction: TransactionData) {
    try {
      const transactions = JSON.parse(
        localStorage.getItem("transactions") || "[]"
      );
      const newTransaction = {
        id: Date.now().toString(),
        ...transaction,
        userId,
        createdAt: new Date().toISOString(),
        source: "local",
      };
      transactions.push(newTransaction);
      localStorage.setItem("transactions", JSON.stringify(transactions));
      console.log("Transaction saved to localStorage as fallback");
      return newTransaction.id;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return null;
    }
  }

  static getUserTransactions(userId: string) {
    try {
      const transactions = JSON.parse(
        localStorage.getItem("transactions") || "[]"
      );
      return transactions
        .filter((t: any) => t.userId === userId)
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 50);
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  }
}

// Helper function to safely get receiver name
function getReceiverName(receiver: any): string {
  if (!receiver) return "Unknown";

  // If receiver is a string, return it
  if (typeof receiver === "string") return receiver;

  // If receiver has a name property (Receiver or SavedReceiver)
  if (receiver.name) return receiver.name;

  // If receiver is NewReceiverData with firstName and lastName
  if (receiver.firstName && receiver.lastName) {
    return `${receiver.firstName} ${receiver.lastName}`;
  }

  // If receiver has only firstName
  if (receiver.firstName) return receiver.firstName;

  // If receiver has only lastName
  if (receiver.lastName) return receiver.lastName;

  return "Unknown";
}

// Hybrid storage service
export class HybridStorageService {
  static async saveTransaction(userId: string, transaction: TransactionData) {
    // Start performance tracking for transaction save
    const transactionTrace = PerformanceService.trackTransactionFlow();
    const startTime = Date.now();

    try {
      // Try to save to Firebase first
      const firebaseTrace =
        PerformanceService.trackFirebaseOperation("save_transaction");

      const firebaseId = await FirebaseService.saveTransaction(
        userId,
        transaction
      );

      PerformanceService.stopTrace(firebaseTrace, {
        operation: "save_transaction",
        status: firebaseId ? "success" : "failed",
      });

      // For high-value transactions, also save to blockchain
      let blockchainData = null;
      if (transaction.amount > 1000) {
        const blockchainTrace =
          PerformanceService.trackApiCall("blockchain_save");

        // Threshold for blockchain storage
        blockchainData = await BlockchainService.recordTransactionOnChain(
          transaction
        );

        PerformanceService.stopTrace(blockchainTrace, {
          operation: "blockchain_save",
          amount: transaction.amount.toString(),
          status: blockchainData ? "success" : "failed",
        });
      }

      // Send notification after successful save
      const result = {
        firebaseId,
        localId: undefined as string | undefined,
        blockchainData,
        success: true,
        fallback: false,
      };

      // If Firebase failed, use localStorage as fallback
      if (!firebaseId) {
        const localId = LocalStorageService.saveTransaction(
          userId,
          transaction
        );
        result.firebaseId = null;
        result.localId = localId;
        result.fallback = true;
      }

      // Send notification for transaction confirmation
      if (result.success) {
        try {
          await NotificationService.sendTransactionNotification(
            NotificationService.getStoredToken() || "",
            {
              id: transaction.transactionId || "unknown",
              amount: transaction.amount,
              currency: transaction.currency,
              recipient: getReceiverName(transaction.receiver),
              status: transaction.status || "processing",
              blockchainData: blockchainData
                ? {
                    transactionHash: blockchainData.transactionHash,
                    explorerUrl: blockchainData.explorerUrl,
                    chainName: blockchainData.chainName,
                  }
                : undefined,
            }
          );
        } catch (notificationError) {
          console.warn("Failed to send notification:", notificationError);
          // Don't fail the transaction if notification fails
        }
      }

      // Track transaction success
      const totalTime = Date.now() - startTime;

      if (result.success && !result.fallback) {
        PerformanceService.trackTransactionSuccess(
          transaction.transactionId || "unknown",
          transaction.amount,
          transaction.currency
        );
      }

      PerformanceService.stopTrace(transactionTrace, {
        total_time: totalTime.toString(),
        status: result.success ? "success" : "failed",
        fallback_used: result.fallback ? "true" : "false",
        blockchain_used: blockchainData ? "true" : "false",
      });

      return result;
    } catch (error) {
      console.error("Error in hybrid storage: ", error);

      // Track transaction failure
      const totalTime = Date.now() - startTime;

      PerformanceService.trackTransactionFailure(
        transaction.transactionId || "unknown",
        error instanceof Error ? error.message : "Unknown error"
      );

      PerformanceService.stopTrace(transactionTrace, {
        total_time: totalTime.toString(),
        status: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
      });

      // Final fallback to localStorage
      const localId = LocalStorageService.saveTransaction(userId, transaction);

      return {
        firebaseId: null,
        localId,
        blockchainData: null,
        success: !!localId,
        fallback: true,
        error: error,
      };
    }
  }

  static async getUserTransactions(userId: string) {
    try {
      // Try Firebase first
      const firebaseTransactions = await FirebaseService.getUserTransactions(
        userId
      );

      if (firebaseTransactions.length > 0) {
        return firebaseTransactions;
      }

      // Fallback to localStorage
      console.log("No Firebase transactions found, checking localStorage...");
      return LocalStorageService.getUserTransactions(userId);
    } catch (error) {
      console.error("Error getting transactions from hybrid storage:", error);
      // Fallback to localStorage
      return LocalStorageService.getUserTransactions(userId);
    }
  }
}
