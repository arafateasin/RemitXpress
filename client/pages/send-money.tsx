import { useState, useEffect } from "react";
import { NextPage } from "next";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../src/config/firebase";
import { BlockchainService } from "../src/services/blockchainService";
import { NotificationService } from "../src/services/notificationService";
import TransactionReceipt from "../src/components/TransactionReceipt";
import NotificationPermissionBanner from "../src/components/NotificationPermissionBanner";
import CountrySelect from "../src/components/CountrySelect";
import CurrencySelect from "../src/components/CurrencySelect";

const SendMoneyPage: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    recipientCountry: "",
    sendCountry: "",
    sendAmount: "",
    sendCurrency: "",
    receiveAmount: "",
    receiveCurrency: "",
    deliveryMethod: "",
    paymentMethod: "",
    recipientName: "",
    recipientEmail: "",
    purpose: "",
    promoCode: "",
    mobileNumber: "",
    bankName: "",
    accountNumber: "",
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [exchangeRateLoading, setExchangeRateLoading] = useState(false);

  const FEE_RATE = 0.0;

  // Fetch exchange rate from API
  const fetchExchangeRate = async (
    fromCurrency: string,
    toCurrency: string
  ) => {
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) {
      setExchangeRate(1);
      return;
    }

    setExchangeRateLoading(true);
    try {
      // Using a free exchange rate API (you can replace with your preferred provider)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );
      const data = await response.json();

      if (data.rates && data.rates[toCurrency]) {
        setExchangeRate(data.rates[toCurrency]);
      } else {
        // Fallback to 1:1 if rate not found
        setExchangeRate(1);
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      // Fallback to 1:1 on error
      setExchangeRate(1);
    } finally {
      setExchangeRateLoading(false);
    }
  };

  // Update exchange rate when currencies change
  useEffect(() => {
    if (formData.sendCurrency && formData.receiveCurrency) {
      fetchExchangeRate(formData.sendCurrency, formData.receiveCurrency);
    }
  }, [formData.sendCurrency, formData.receiveCurrency]);

  // Update receive amount when send amount or exchange rate changes
  useEffect(() => {
    if (formData.sendAmount && exchangeRate) {
      const sendAmount = parseFloat(formData.sendAmount);
      if (!isNaN(sendAmount)) {
        const receiveAmount = (sendAmount * exchangeRate).toFixed(2);
        setFormData((prev) => ({ ...prev, receiveAmount }));
      }
    }
  }, [formData.sendAmount, exchangeRate]);

  // Handle sign out with proper redirection
  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Request notification permission on component mount
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const token = await NotificationService.requestNotificationPermission();
        if (token) {
          console.log("Notification permission granted, token:", token);
          // Set up foreground message listener
          NotificationService.setupForegroundMessaging();
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    setupNotifications();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "sendAmount") {
      const sendAmount = parseFloat(value) || 0;
      const receiveAmount = (sendAmount * exchangeRate).toFixed(2);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        receiveAmount: receiveAmount,
        amount: value, // Keep compatibility with existing code
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleTestNotification = () => {
    NotificationService.sendLocalNotification(
      "Test Notification",
      "This is a test notification from RemitXpress!",
      {
        icon: "/favicon.ico",
        tag: "test-notification",
        requireInteraction: false,
      }
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Generate transaction ID
      const transactionId = `TXN${Date.now()}`;
      const timestamp = new Date().toISOString();

      console.log("Starting transaction submission...", {
        transactionId,
        formData,
      });

      // Prepare transaction data
      const sendAmount = parseFloat(formData.sendAmount);
      const fee = sendAmount * FEE_RATE;
      const totalAmount = sendAmount + fee;
      const receiveAmount = parseFloat(formData.receiveAmount);

      const transactionData: any = {
        id: transactionId,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        sendAmount: sendAmount,
        sendCurrency: formData.sendCurrency,
        receiveAmount: receiveAmount,
        receiveCurrency: formData.receiveCurrency,
        recipientCountry: formData.recipientCountry,
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        exchangeRate: exchangeRate,
        fee: fee,
        totalAmount: totalAmount,
        status: "pending",
        timestamp: timestamp,
        type: "sent",
        userId: "current-user-id", // Replace with actual user ID
        // Keep backward compatibility
        amount: sendAmount,
        currency: formData.sendCurrency,
        receivedAmount: receiveAmount,
        receivedCurrency: formData.receiveCurrency,
      };

      // Save to Firestore
      console.log("Saving transaction to Firestore:", transactionData);
      const docRef = await addDoc(
        collection(db, "transactions"),
        transactionData
      );
      console.log("✅ Transaction saved to Firestore with ID: ", docRef.id);

      // Record on blockchain
      let blockchainResult;
      try {
        blockchainResult = await BlockchainService.recordTransactionOnChain({
          ...transactionData,
          senderId: "current-user-id",
          senderName: "Current User",
          receiver: {
            email: formData.recipientEmail,
            name: formData.recipientName,
            phone: formData.mobileNumber || "",
            country: formData.recipientCountry,
          },
          deliveryMethod: formData.deliveryMethod,
          paymentMethod: formData.paymentMethod,
          fees: {
            serviceFee: fee,
            exchangeFee: 0,
            processingFee: 0,
            totalFees: fee,
          },
          transactionId: transactionId,
        });
        console.log("Blockchain transaction result:", blockchainResult);
      } catch (blockchainError) {
        console.error("Blockchain transaction failed:", blockchainError);
        // Continue without blockchain - transaction still saved to Firestore
        blockchainResult = { transactionHash: null };
      }

      // Update transaction with blockchain hash
      if (blockchainResult.transactionHash) {
        await updateDoc(doc(db, "transactions", docRef.id), {
          txHash: blockchainResult.transactionHash,
          status: "completed",
        });
        transactionData.txHash = blockchainResult.transactionHash;
        transactionData.status = "completed";
      }

      // Prepare receipt data
      const receipt = {
        transactionId: transactionId,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        amount: sendAmount,
        currency: formData.sendCurrency,
        receiveAmount: receiveAmount,
        receiveCurrency: formData.receiveCurrency,
        fee: fee,
        totalAmount: totalAmount,
        exchangeRate: exchangeRate,
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        recipientCountry: formData.recipientCountry,
        txHash: blockchainResult.transactionHash,
        timestamp: timestamp,
        status: blockchainResult.transactionHash ? "success" : "pending",
      };

      console.log("Setting receipt data and showing modal:", receipt);
      setReceiptData(receipt);
      setShowReceipt(true);

      // Send local notification
      NotificationService.sendLocalNotification(
        "Transfer Successful!",
        `MYR ${formData.sendAmount} sent to ${
          formData.recipientName
        } successfully. They will receive BDT ${
          formData.receiveAmount
        }. Transaction ID: ${transactionId.slice(0, 8)}...`,
        {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "transaction-success",
          requireInteraction: true,
        }
      );

      console.log("Transaction completed successfully:", {
        transactionId,
        receiptData: receipt,
        showReceipt: true,
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    RemitXpress
                  </h1>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-6">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors rounded-md hover:text-blue-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/send-money"
                    className="px-3 py-2 text-sm font-medium text-blue-600 rounded-md"
                  >
                    Send Money
                  </Link>
                  <Link
                    href="/transactions"
                    className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors rounded-md hover:text-blue-600"
                  >
                    Transactions
                  </Link>
                  <Link
                    href="/wallet"
                    className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors rounded-md hover:text-blue-600"
                  >
                    Wallet
                  </Link>
                  <Link
                    href="/settings"
                    className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors rounded-md hover:text-blue-600"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-medium text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors rounded-md hover:text-blue-600"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-600 hover:to-purple-700 text-sm font-medium transition-all shadow-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Notification Permission Banner */}
      <NotificationPermissionBanner />

      <div className="py-12">
        <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((number) => (
                  <div key={number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= number
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {number}
                    </div>
                    {number < 3 && (
                      <div
                        className={`w-16 h-1 mx-2 ${
                          step > number ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mt-2">
              <div className="flex space-x-16 text-sm text-gray-600">
                <span className={step >= 1 ? "text-blue-600 font-medium" : ""}>
                  Details
                </span>
                <span className={step >= 2 ? "text-blue-600 font-medium" : ""}>
                  Review
                </span>
                <span className={step >= 3 ? "text-blue-600 font-medium" : ""}>
                  Confirm
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Send Money
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Send money internationally with blockchain technology - Get
                    instant receipts!
                  </p>
                </div>
                <button
                  onClick={handleTestNotification}
                  className="flex items-center px-3 py-2 ml-4 space-x-1 text-xs text-blue-700 transition-colors duration-200 bg-blue-100 rounded-lg hover:bg-blue-200"
                  title="Test notifications"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5-5-5h5v-12a1 1 0 011-1h4a1 1 0 011 1v12z"
                    />
                  </svg>
                  <span>Test Notification</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {step === 1 && (
                <div className="space-y-8">
                  {/* Country and Amount Section */}
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Send From Section */}
                    <div className="p-6 rounded-lg bg-gray-50">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Send from
                      </h3>
                      <div className="space-y-4">
                        <CountrySelect
                          id="sendCountry"
                          name="sendCountry"
                          value={formData.sendCountry}
                          onChange={handleInputChange}
                          label="Send from Country"
                          placeholder="Select country"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />

                        <CurrencySelect
                          id="sendCurrency"
                          name="sendCurrency"
                          value={formData.sendCurrency}
                          onChange={handleInputChange}
                          label="Send Currency"
                          placeholder="Select currency"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            You send
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="sendAmount"
                              value={formData.sendAmount}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 pr-20 text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter amount"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                              <span className="text-sm font-medium text-gray-600">
                                {formData.sendCurrency || "Currency"}
                              </span>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Fee: {formData.sendCurrency || "Currency"}{" "}
                            {formData.sendAmount
                              ? (
                                  parseFloat(formData.sendAmount) * FEE_RATE
                                ).toFixed(2)
                              : "0.00"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Receive In Section */}
                    <div className="p-6 rounded-lg bg-gray-50">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Send to
                      </h3>
                      <div className="space-y-4">
                        <CountrySelect
                          id="recipientCountry"
                          name="recipientCountry"
                          value={formData.recipientCountry}
                          onChange={handleInputChange}
                          label="Country"
                          placeholder="Select recipient country"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />

                        <CurrencySelect
                          id="receiveCurrency"
                          name="receiveCurrency"
                          value={formData.receiveCurrency}
                          onChange={handleInputChange}
                          label="Receive Currency"
                          placeholder="Select receive currency"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            They receive
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="receiveAmount"
                              value={formData.receiveAmount}
                              readOnly
                              className="w-full px-4 py-3 pr-16 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg"
                              placeholder="Amount calculated automatically"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                              <span className="text-sm font-medium text-gray-600">
                                {formData.receiveCurrency || "Currency"}
                              </span>
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {exchangeRateLoading ? (
                              <span>Loading exchange rate...</span>
                            ) : (
                              <span>
                                Exchange rate: 1{" "}
                                {formData.sendCurrency || "Currency"} ={" "}
                                {exchangeRate.toFixed(4)}{" "}
                                {formData.receiveCurrency || "Currency"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Method Section */}
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      How would they like to receive the money?
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {[
                        {
                          id: "cash_pickup",
                          title: "Cash pickup",
                          description: "Ready in minutes",
                          icon: (
                            <svg
                              className="w-6 h-6 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          ),
                          recommended: true,
                        },
                        {
                          id: "bank_transfer",
                          title: "Bank transfer",
                          description: "Ready in 1-2 business days",
                          icon: (
                            <svg
                              className="w-6 h-6 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          ),
                          recommended: false,
                        },
                        {
                          id: "ewallet",
                          title: "eWallet",
                          description: "Ready in minutes",
                          icon: (
                            <svg
                              className="w-6 h-6 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          ),
                          recommended: false,
                        },
                      ].map((method) => (
                        <div
                          key={method.id}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              deliveryMethod: method.id,
                            }))
                          }
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.deliveryMethod === method.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {method.recommended && (
                            <span className="absolute px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded top-2 right-2">
                              Recommended
                            </span>
                          )}
                          <div className="flex items-start space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                              {method.icon}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {method.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {method.description}
                              </p>
                            </div>
                          </div>
                          {formData.deliveryMethod === method.id && (
                            <div className="absolute top-2 left-2">
                              <div className="flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method Section */}
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      How would you like to pay?
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {[
                        {
                          id: "fpx",
                          title: "FPX Online Banking",
                          description: "Pay directly from your bank account",
                          icon: (
                            <svg
                              className="w-6 h-6 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          ),
                          fee: "No additional fee",
                        },
                        {
                          id: "debit_card",
                          title: "Debit Card",
                          description: "Pay with your debit card",
                          icon: (
                            <svg
                              className="w-6 h-6 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                          ),
                          fee: "Additional fee may apply",
                        },
                        {
                          id: "crypto_wallet",
                          title: "Crypto Wallet",
                          description: "Pay with cryptocurrency",
                          icon: (
                            <svg
                              className="w-6 h-6 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          ),
                          fee: "Blockchain network fee",
                        },
                      ].map((method) => (
                        <div
                          key={method.id}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              paymentMethod: method.id,
                            }))
                          }
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.paymentMethod === method.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                              {method.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {method.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {method.description}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {method.fee}
                              </p>
                            </div>
                            {formData.paymentMethod === method.id && (
                              <div className="flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recipient Information Section */}
                  <div className="p-6 rounded-lg bg-gray-50">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Recipient Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Recipient Name *
                        </label>
                        <input
                          type="text"
                          name="recipientName"
                          value={formData.recipientName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter recipient's full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Recipient Email *
                        </label>
                        <input
                          type="email"
                          name="recipientEmail"
                          value={formData.recipientEmail}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="recipient@example.com"
                          required
                        />
                      </div>

                      {formData.deliveryMethod === "bank_transfer" && (
                        <>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Bank Name *
                            </label>
                            <select
                              name="bankName"
                              value={formData.bankName || ""}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Select bank</option>
                              <option value="Sonali Bank">Sonali Bank</option>
                              <option value="Dutch Bangla Bank">
                                Dutch Bangla Bank
                              </option>
                              <option value="BRAC Bank">BRAC Bank</option>
                              <option value="Eastern Bank">Eastern Bank</option>
                              <option value="City Bank">City Bank</option>
                            </select>
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Account Number *
                            </label>
                            <input
                              type="text"
                              name="accountNumber"
                              value={formData.accountNumber || ""}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter account number"
                              required
                            />
                          </div>
                        </>
                      )}

                      {formData.deliveryMethod === "ewallet" && (
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Mobile Number *
                          </label>
                          <input
                            type="tel"
                            name="mobileNumber"
                            value={formData.mobileNumber || ""}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+880 1X XXXX XXXX"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="p-6 rounded-lg bg-blue-50">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Transaction Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Send amount:</span>
                        <span className="font-medium">
                          MYR {formData.sendAmount || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fee:</span>
                        <span className="font-medium">
                          MYR{" "}
                          {formData.sendAmount
                            ? (
                                parseFloat(formData.sendAmount) * FEE_RATE
                              ).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total to pay:</span>
                        <span className="font-medium">
                          MYR{" "}
                          {formData.sendAmount
                            ? (
                                parseFloat(formData.sendAmount) *
                                (1 + FEE_RATE)
                              ).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recipient gets:</span>
                        <span className="text-lg font-bold text-blue-600">
                          BDT {formData.receiveAmount || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNext}
                      disabled={
                        !formData.recipientName ||
                        !formData.recipientEmail ||
                        !formData.sendAmount ||
                        !formData.deliveryMethod ||
                        !formData.paymentMethod ||
                        parseFloat(formData.sendAmount) <= 0
                      }
                      className="px-8 py-3 text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-gray-50">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Review Your Transfer
                    </h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 font-medium text-gray-900">
                          Recipient Details
                        </h4>
                        <p className="text-sm text-gray-600">
                          Name: {formData.recipientName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Email: {formData.recipientEmail}
                        </p>
                        <p className="text-sm text-gray-600">
                          Country: Bangladesh
                        </p>
                        <p className="text-sm text-gray-600">
                          Delivery: {formData.deliveryMethod?.replace("_", " ")}
                        </p>
                      </div>

                      <div>
                        <h4 className="mb-2 font-medium text-gray-900">
                          Transfer Details
                        </h4>
                        <p className="text-sm text-gray-600">
                          Send amount: {formData.sendAmount} MYR
                        </p>
                        <p className="text-sm text-gray-600">
                          Receive amount: {formData.receiveAmount} BDT
                        </p>
                        <p className="text-sm text-gray-600">
                          Exchange rate: 1 MYR = {exchangeRate} BDT
                        </p>
                        <p className="text-sm text-gray-600">
                          Payment method:{" "}
                          {formData.paymentMethod?.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-6 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Send amount:
                        </span>
                        <span className="text-sm font-medium">
                          {formData.sendAmount || "0.00"} MYR
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Transfer fee:
                        </span>
                        <span className="text-sm font-medium">
                          {formData.sendAmount
                            ? (
                                parseFloat(formData.sendAmount) * FEE_RATE
                              ).toFixed(2)
                            : "0.00"}{" "}
                          MYR
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Total to pay:
                        </span>
                        <span className="text-lg font-bold">
                          {formData.sendAmount
                            ? (
                                parseFloat(formData.sendAmount) *
                                (1 + FEE_RATE)
                              ).toFixed(2)
                            : "0.00"}{" "}
                          MYR
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Recipient receives:
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {formData.receiveAmount || "0.00"} BDT
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={handleBack}
                      className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Confirm Transfer
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">
                      Ready to Send
                    </h3>
                    <p className="mt-2 text-gray-600">
                      Please review your transfer details one more time before
                      confirming.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <p className="text-sm text-blue-800">
                        Your transfer is secured by blockchain technology and
                        will be processed within 24 hours.
                      </p>
                    </div>
                  </div>{" "}
                  <div className="flex justify-between">
                    <button
                      onClick={handleBack}
                      className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        "Send Money"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Receipt Modal */}
        {receiptData && (
          <TransactionReceipt
            isOpen={showReceipt}
            onClose={() => {
              setShowReceipt(false);
              setReceiptData(null);
              // Reset form for new transaction
              setFormData({
                recipientCountry: "",
                sendCountry: "",
                sendAmount: "",
                sendCurrency: "",
                receiveAmount: "",
                receiveCurrency: "",
                deliveryMethod: "",
                paymentMethod: "",
                recipientName: "",
                recipientEmail: "",
                purpose: "",
                promoCode: "",
                mobileNumber: "",
                bankName: "",
                accountNumber: "",
              });
              setStep(1);
            }}
            receiptData={receiptData}
          />
        )}
      </div>
    </div>
  );
};

export default SendMoneyPage;
