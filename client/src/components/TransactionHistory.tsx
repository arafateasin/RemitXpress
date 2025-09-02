import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useSession } from "next-auth/react";
import { remitAPI } from "../services/api";
import { HybridStorageService } from "../services/storageService";

const TransactionHistory = () => {
  const { data: session } = useSession();
  const {
    data: transactionsData,
    isLoading,
    error,
  } = useQuery(
    ["transactions", session?.user?.email],
    () => remitAPI.getTransactionHistory({}),
    {
      enabled: !session, // Only fetch for non-OAuth users
    }
  );
  const transactions = transactionsData?.data || [];
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [oauthTransactions, setOauthTransactions] = useState([]);
  const transactionsPerPage = 10;

  useEffect(() => {
    // Load OAuth transactions from Firebase for authenticated users
    if (session) {
      const loadFirebaseTransactions = async () => {
        try {
          const firebaseTransactions =
            await HybridStorageService.getUserTransactions(
              session.user?.email || "oauth-user"
            );
          setOauthTransactions(firebaseTransactions);
        } catch (error) {
          console.error("Failed to load Firebase transactions:", error);
          // Fallback to localStorage
          const stored = localStorage.getItem("oauthTransactions");
          if (stored) {
            setOauthTransactions(JSON.parse(stored));
          }
        }
      };

      loadFirebaseTransactions();
    }
  }, [session]);

  // Sample transaction data for demonstration
  const sampleTransactions = [
    {
      id: "TXN001",
      type: "send",
      amount: 500.0,
      currency: "MYR",
      recipient: "John Doe",
      recipientCountry: "Bangladesh",
      status: "completed",
      fee: 15.0,
      exchangeRate: 20.5,
      createdAt: "2025-08-27T10:30:00Z",
      estimatedDelivery: "2025-08-27T11:00:00Z",
    },
    {
      id: "TXN002",
      type: "send",
      amount: 1000.0,
      currency: "MYR",
      recipient: "Sarah Khan",
      recipientCountry: "India",
      status: "processing",
      fee: 25.0,
      exchangeRate: 18.2,
      createdAt: "2025-08-26T15:45:00Z",
      estimatedDelivery: "2025-08-26T16:30:00Z",
    },
    {
      id: "TXN003",
      type: "receive",
      amount: 750.0,
      currency: "MYR",
      sender: "Ahmad Ali",
      senderCountry: "Singapore",
      status: "completed",
      fee: 0.0,
      createdAt: "2025-08-25T09:20:00Z",
    },
    {
      id: "TXN004",
      type: "send",
      amount: 300.0,
      currency: "MYR",
      recipient: "Priya Sharma",
      recipientCountry: "Pakistan",
      status: "failed",
      fee: 10.0,
      exchangeRate: 15.8,
      createdAt: "2025-08-24T14:15:00Z",
      failureReason: "Insufficient funds",
    },
    {
      id: "TXN005",
      type: "send",
      amount: 2000.0,
      currency: "MYR",
      recipient: "Michael Wong",
      recipientCountry: "Philippines",
      status: "pending",
      fee: 45.0,
      exchangeRate: 12.3,
      createdAt: "2025-08-23T11:30:00Z",
      estimatedDelivery: "2025-08-23T13:00:00Z",
    },
  ];

  // Normalize transaction data to handle different formats
  const normalizeTransaction = (transaction) => {
    return {
      ...transaction,
      // Handle different field names
      recipient:
        transaction.recipient ||
        transaction.receiver?.name ||
        transaction.receiver ||
        "Unknown",
      sender: transaction.sender || transaction.from || "You",
      // Handle different date formats
      createdAt: transaction.createdAt || transaction.timestamp || new Date(),
      // Ensure amount is a number
      amount:
        typeof transaction.amount === "string"
          ? parseFloat(transaction.amount)
          : transaction.amount || 0,
      // Default currency if missing
      currency: transaction.currency || "MYR",
      // Default status
      status: transaction.status || "processing",
      // Default type
      type: transaction.type || "send",
      // Handle fee
      fee: transaction.fees?.total || transaction.fee || 0,
    };
  };

  // Use OAuth transactions if logged in, otherwise use local/sample transactions
  const displayTransactions = session
    ? oauthTransactions.map(normalizeTransaction)
    : [...transactions, ...sampleTransactions].map(normalizeTransaction);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✓";
      case "pending":
        return "⏳";
      case "processing":
        return "🔄";
      case "failed":
        return "✗";
      case "cancelled":
        return "⊘";
      default:
        return "?";
    }
  };

  const getTypeIcon = (type) => {
    return type === "send" ? "↗️" : "↙️";
  };

  const formatDate = (dateString) => {
    try {
      let date;

      // Handle Firebase Timestamp objects
      if (dateString && typeof dateString === "object" && dateString.toDate) {
        date = dateString.toDate();
      }
      // Handle Firebase Timestamp that was converted to Date
      else if (
        dateString &&
        typeof dateString === "object" &&
        dateString.seconds
      ) {
        date = new Date(dateString.seconds * 1000);
      }
      // Handle regular date strings
      else if (dateString) {
        date = new Date(dateString);
      }
      // Fallback to current date
      else {
        date = new Date();
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error, "Input:", dateString);
      return "Invalid Date";
    }
  };

  // Helper function to safely get string value for search
  const getSearchableString = (value: any): string => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
      // Handle receiver object case
      if (value.name) return value.name;
      if (value.firstName && value.lastName)
        return `${value.firstName} ${value.lastName}`;
      if (value.firstName) return value.firstName;
      if (value.lastName) return value.lastName;
    }
    return String(value || "");
  };

  const filteredTransactions = displayTransactions.filter((transaction) => {
    const matchesFilter =
      filter === "all" ||
      transaction.status === filter ||
      transaction.type === filter;
    const matchesSearch =
      getSearchableString(transaction.recipient)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getSearchableString(transaction.sender)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + transactionsPerPage
  );

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Transaction History
          </h1>
          <p className="mt-2 text-gray-600">
            View all your past transactions and their status
          </p>
        </div>

        {/* Filters and Search */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Filter by:
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Transactions</option>
                  <option value="send">Sent Money</option>
                  <option value="receive">Received Money</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Search:
                </label>
                <input
                  type="text"
                  placeholder="Search by recipient, sender, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {currentTransactions.length} of{" "}
              {filteredTransactions.length} transactions
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          ) : currentTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4 text-6xl text-gray-400">📝</div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No transactions found
              </h3>
              <p className="text-gray-600">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You haven't made any transactions yet"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Recipient/Sender
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2 text-lg">
                              {getTypeIcon(transaction.type)}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {transaction.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transaction.type === "send"
                                  ? "Money Sent"
                                  : "Money Received"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.currency}{" "}
                            {typeof transaction.amount === "number"
                              ? transaction.amount.toFixed(2)
                              : parseFloat(transaction.amount || 0).toFixed(2)}
                          </div>
                          {transaction.fee > 0 && (
                            <div className="text-sm text-gray-500">
                              Fee: {transaction.currency}{" "}
                              {typeof transaction.fee === "number"
                                ? transaction.fee.toFixed(2)
                                : parseFloat(transaction.fee || 0).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getSearchableString(
                              transaction.recipient || transaction.sender
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.recipientCountry ||
                              transaction.senderCountry}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {getStatusIcon(transaction.status)}{" "}
                            {transaction.status.charAt(0).toUpperCase() +
                              transaction.status.slice(1)}
                          </span>
                          {transaction.failureReason && (
                            <div className="mt-1 text-xs text-red-600">
                              {transaction.failureReason}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                {currentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 border-b border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">
                          {getTypeIcon(transaction.type)}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">
                            {transaction.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.type === "send"
                              ? "Money Sent"
                              : "Money Received"}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {getStatusIcon(transaction.status)}{" "}
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Amount:</span>
                        <span className="text-sm font-medium">
                          {transaction.currency} {transaction.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          {transaction.type === "send" ? "To:" : "From:"}
                        </span>
                        <span className="text-sm">
                          {getSearchableString(
                            transaction.recipient || transaction.sender
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Date:</span>
                        <span className="text-sm">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </div>
                      {transaction.fee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Fee:</span>
                          <span className="text-sm">
                            {transaction.currency} {transaction.fee.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <button className="text-sm text-blue-600 hover:text-blue-900">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 mt-0 bg-white border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      startIndex + transactionsPerPage,
                      filteredTransactions.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredTransactions.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
