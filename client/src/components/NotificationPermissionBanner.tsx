import React, { useState, useEffect } from "react";
import { NotificationService } from "../services/notificationService";

const NotificationPermissionBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if we should show the notification permission banner
    const checkNotificationPermission = () => {
      if ("Notification" in window) {
        const permission = Notification.permission;
        const hasToken = NotificationService.getStoredToken();

        // Show banner if permission is default (not granted/denied) and no token stored
        if (permission === "default" && !hasToken) {
          setShowBanner(true);
        }
      }
    };

    checkNotificationPermission();

    // Set up foreground messaging
    NotificationService.setupForegroundMessaging();
  }, []);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);

    try {
      const token = await NotificationService.requestNotificationPermission();

      if (token) {
        console.log("Notifications enabled successfully");
        setShowBanner(false);

        // Show a welcome notification
        NotificationService.showBrowserNotification(
          "🎉 Notifications Enabled!",
          "You'll now receive updates about your transactions.",
          { type: "welcome" }
        );
      } else {
        console.log("Failed to enable notifications");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember that user dismissed (you might want to show again later)
    localStorage.setItem("notification-banner-dismissed", "true");
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <div className="text-2xl">🔔</div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Enable Transaction Notifications
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            Get instant updates when your money transfers are completed,
            pending, or require attention.
          </p>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={handleEnableNotifications}
              disabled={isRequesting}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isRequesting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enabling...
                </>
              ) : (
                "Enable Notifications"
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Maybe Later
            </button>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="text-blue-400 hover:text-blue-600"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;
