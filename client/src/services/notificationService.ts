import { messaging } from "../config/firebase";
import { getToken, onMessage } from "firebase/messaging";

export class NotificationService {
  // Note: You need to generate a VAPID key in Firebase Console > Project Settings > Cloud Messaging
  private static vapidKey =
    "BKrW2rFXhKr_qK-AakZd4cJsm-VJzC9_LwUlCDyK7y7DdY5QF8GZ-Y6K9X8tQJ8vF7P3L2nK5xZ8DwY4VJzH9e0"; // This is a placeholder

  // Request notification permission and get FCM token
  static async requestNotificationPermission(): Promise<string | null> {
    try {
      // Check if messaging is available
      if (!messaging) {
        console.log("Firebase Messaging not available");
        return null;
      }

      // Check if notifications are supported
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return null;
      }

      // Request permission
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        console.log("Notification permission granted.");

        try {
          // Get FCM token (without VAPID key for now to avoid errors)
          const token = await getToken(messaging);

          if (token) {
            console.log("FCM Token:", token);
            // Store token in localStorage for later use
            localStorage.setItem("fcm-token", token);
            return token;
          } else {
            console.log("No registration token available.");
            return null;
          }
        } catch (tokenError) {
          console.log("Error getting token:", tokenError);
          return null;
        }
      } else {
        console.log("Unable to get permission to notify.");
        return null;
      }
    } catch (error) {
      console.error("Error getting notification permission:", error);
      return null;
    }
  }

  // Set up foreground message listener
  static setupForegroundMessaging() {
    if (!messaging) {
      console.log("Firebase Messaging not available for foreground messages");
      return;
    }

    onMessage(messaging, (payload) => {
      console.log("Message received in foreground: ", payload);

      // Show browser notification
      this.showBrowserNotification(
        payload.notification?.title || "RemitXpress Notification",
        payload.notification?.body || "You have a new notification",
        payload.data
      );
    });
  }

  // Send local notification
  static sendLocalNotification(
    title: string,
    body: string,
    options?: NotificationOptions
  ) {
    if ("Notification" in window && Notification.permission === "granted") {
      const defaultOptions: NotificationOptions = {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "remitxpress-notification",
        requireInteraction: false,
        ...options,
      };

      const notification = new Notification(title, defaultOptions);

      notification.onclick = () => {
        window.focus();
        notification.close();

        // You can add navigation logic here
        if (options?.tag === "transaction-success") {
          // Navigate to transactions page or show receipt
          console.log("Notification clicked - transaction success");
        }
      };

      // Auto close after 8 seconds if not requireInteraction
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 8000);
      }

      return notification;
    } else {
      console.log("Notifications not supported or permission not granted");
      return null;
    }
  }

  // Show browser notification
  static showBrowserNotification(title: string, body: string, data?: any) {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        tag: "remitxpress-notification",
        data,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();

        // Navigate based on notification data
        if (data?.type === "transaction") {
          window.location.href = "/transaction-history";
        }
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  // Send transaction notification with blockchain support
  static async sendTransactionNotification(
    userToken: string,
    transactionData: {
      id: string;
      amount: number;
      currency: string;
      recipient: string;
      status: string;
      blockchainData?: {
        transactionHash?: string;
        explorerUrl?: string;
        chainName?: string;
      };
    }
  ) {
    // In a real app, this would be done from your backend
    // For demo purposes, we'll just show a local notification
    const title = this.getTransactionNotificationTitle(
      transactionData.status,
      transactionData.blockchainData
    );
    const body = this.getTransactionNotificationBody(transactionData);

    this.showBrowserNotification(title, body, {
      type: "transaction",
      transactionId: transactionData.id,
      blockchainHash: transactionData.blockchainData?.transactionHash,
    });
  }

  // Get notification title based on transaction status and blockchain data
  private static getTransactionNotificationTitle(
    status: string,
    blockchainData?: { transactionHash?: string; chainName?: string }
  ): string {
    const hasBlockchain = blockchainData?.transactionHash;

    switch (status) {
      case "completed":
        return hasBlockchain
          ? "⛓️ Blockchain Transaction Completed!"
          : "✅ Transaction Completed!";
      case "processing":
        return hasBlockchain
          ? "⛓️ Recording on Blockchain..."
          : "🔄 Transaction Processing...";
      case "failed":
        return "❌ Transaction Failed";
      case "pending":
        return "⏳ Transaction Pending";
      default:
        return "📱 Transaction Update";
    }
  }

  // Get notification body based on transaction data
  private static getTransactionNotificationBody(transactionData: {
    amount: number;
    currency: string;
    recipient: string;
    status: string;
    blockchainData?: {
      transactionHash?: string;
      explorerUrl?: string;
      chainName?: string;
    };
  }): string {
    const { amount, currency, recipient, status, blockchainData } =
      transactionData;
    const hasBlockchain = blockchainData?.transactionHash;
    const baseMessage = `${currency} ${amount.toFixed(
      2
    )} transfer to ${recipient}`;

    switch (status) {
      case "completed":
        if (hasBlockchain) {
          return `Your ${baseMessage} has been completed and recorded on ${
            blockchainData.chainName || "blockchain"
          }. Hash: ${blockchainData.transactionHash?.slice(0, 10)}...`;
        }
        return `Your ${baseMessage} has been completed successfully.`;
      case "processing":
        if (hasBlockchain) {
          return `Your ${baseMessage} is being recorded on the blockchain for enhanced security.`;
        }
        return `Your ${baseMessage} is being processed.`;
      case "failed":
        return `Your ${baseMessage} has failed. Please try again.`;
      case "pending":
        return `Your ${baseMessage} is pending approval.`;
      default:
        return `Transaction update for ${baseMessage}.`;
    }
  }

  // Get stored FCM token
  static getStoredToken(): string | null {
    return localStorage.getItem("fcm-token");
  }

  // Clear stored token
  static clearToken(): void {
    localStorage.removeItem("fcm-token");
  }
}
