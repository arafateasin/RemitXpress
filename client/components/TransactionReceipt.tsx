import { useState } from "react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ReceiptData {
  transactionId: string;
  recipientName: string;
  recipientEmail: string;
  amount: number;
  currency: string;
  fee: number;
  totalAmount: number;
  exchangeRate: number;
  receivedAmount: number;
  receivedCurrency: string;
  purpose: string;
  message?: string;
  txHash?: string;
  timestamp: string;
  status: "success" | "pending" | "failed";
}

interface TransactionReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData;
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({
  isOpen,
  onClose,
  receiptData,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  console.log("TransactionReceipt component:", { isOpen, receiptData });

  if (!isOpen) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setIsPrinting(false);
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    alert("PDF download functionality would be implemented here");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {receiptData.status === "success" ? (
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              ) : receiptData.status === "pending" ? (
                <div className="h-8 w-8 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
              ) : (
                <XMarkIcon className="h-8 w-8 text-red-500" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Transaction Receipt
              </h2>
              <p className="text-gray-600">
                {receiptData.status === "success"
                  ? "Your money transfer has been processed successfully"
                  : receiptData.status === "pending"
                  ? "Your money transfer is being processed"
                  : "There was an issue with your transfer"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Status */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Transaction ID</span>
              <span className="text-blue-600 font-mono text-sm">
                {receiptData.transactionId}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-700 font-medium">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  receiptData.status === "success"
                    ? "bg-green-100 text-green-800"
                    : receiptData.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {receiptData.status.charAt(0).toUpperCase() +
                  receiptData.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-700 font-medium">Date & Time</span>
              <span className="text-gray-600">
                {new Date(receiptData.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Transfer Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              Transfer Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient</span>
                <span className="font-medium text-gray-900">
                  {receiptData.recipientName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-medium text-gray-900">
                  {receiptData.recipientEmail}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Purpose</span>
                <span className="font-medium text-gray-900">
                  {receiptData.purpose}
                </span>
              </div>
              {receiptData.message && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Message</span>
                  <span className="font-medium text-gray-900 max-w-xs text-right">
                    {receiptData.message}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              Amount Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Send Amount</span>
                <span className="font-medium text-gray-900">
                  {receiptData.amount} {receiptData.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transfer Fee (1%)</span>
                <span className="font-medium text-gray-900">
                  {receiptData.fee.toFixed(2)} {receiptData.currency}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-gray-600 font-medium">Total Paid</span>
                <span className="font-bold text-gray-900">
                  {receiptData.totalAmount.toFixed(2)} {receiptData.currency}
                </span>
              </div>
              <div className="flex justify-between bg-white p-3 rounded-lg">
                <span className="text-gray-600">Recipient Receives</span>
                <span className="font-bold text-green-600 text-lg">
                  {receiptData.receivedAmount
                    ? receiptData.receivedAmount.toFixed
                      ? receiptData.receivedAmount.toFixed(2)
                      : receiptData.receivedAmount
                    : "0.00"}{" "}
                  {receiptData.receivedCurrency}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Exchange Rate</span>
                <span className="text-gray-500">
                  1 {receiptData.currency} = {receiptData.exchangeRate}{" "}
                  {receiptData.receivedCurrency}
                </span>
              </div>
            </div>
          </div>

          {/* Blockchain Information */}
          {receiptData.txHash && (
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Blockchain Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transaction Hash</span>
                  <span className="font-mono text-sm text-purple-600 max-w-xs truncate">
                    {receiptData.txHash}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network</span>
                  <span className="font-medium text-gray-900">
                    Ethereum Sepolia
                  </span>
                </div>
                <div className="text-center">
                  <button
                    onClick={() =>
                      window.open(
                        `https://sepolia.etherscan.io/tx/${receiptData.txHash}`,
                        "_blank"
                      )
                    }
                    className="text-purple-600 hover:text-purple-800 font-medium text-sm underline"
                  >
                    View on Etherscan ↗
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              Important Information
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Keep this receipt for your records</li>
              <li>• Transaction is secured by blockchain technology</li>
              <li>• Funds typically arrive within 1-3 business days</li>
              <li>• Contact support if you have any questions</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
          <div className="flex space-x-4">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              {isPrinting ? "Printing..." : "Print Receipt"}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;
