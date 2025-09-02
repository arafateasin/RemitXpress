import React from "react";
import { NotificationService } from "../services/notificationService";

const NotificationTestPanel: React.FC = () => {
  const testTransactionNotification = () => {
    NotificationService.sendTransactionNotification("test-token", {
      id: "TEST123",
      amount: 500,
      currency: "MYR",
      recipient: "John Doe",
      status: "completed",
    });
  };

  const testProcessingNotification = () => {
    NotificationService.sendTransactionNotification("test-token", {
      id: "TEST456",
      amount: 1200,
      currency: "MYR",
      recipient: "Sarah Lee",
      status: "processing",
    });
  };

  const testFailedNotification = () => {
    NotificationService.sendTransactionNotification("test-token", {
      id: "TEST789",
      amount: 300,
      currency: "MYR",
      recipient: "Mike Johnson",
      status: "failed",
    });
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🧪 Test Notifications
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Click the buttons below to test different notification types:
      </p>

      <div className="space-y-3">
        <button
          onClick={testTransactionNotification}
          className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          ✅ Test Completed Transaction
        </button>

        <button
          onClick={testProcessingNotification}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          🔄 Test Processing Transaction
        </button>

        <button
          onClick={testFailedNotification}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          ❌ Test Failed Transaction
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>💡 Make sure you&apos;ve enabled notifications first!</p>
        <p>These are browser notifications for testing purposes.</p>
      </div>
    </div>
  );
};

export default NotificationTestPanel;
