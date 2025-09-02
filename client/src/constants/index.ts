// Re-export all constants for easy importing
export {
  COUNTRIES,
  getCountryName,
  getCountryCode,
  ASIAN_COUNTRIES,
  MIDDLE_EAST_COUNTRIES,
  EUROPEAN_COUNTRIES,
} from "./countries";
export {
  CURRENCIES,
  getCurrencyName,
  getCurrencySymbol,
  formatAmount,
} from "./currencies";

// Common transfer purposes
export const TRANSFER_PURPOSES = [
  { value: "family_support", label: "Family Support" },
  { value: "education", label: "Education" },
  { value: "medical", label: "Medical" },
  { value: "business", label: "Business" },
  { value: "investment", label: "Investment" },
  { value: "gift", label: "Gift" },
  { value: "salary", label: "Salary Payment" },
  { value: "rent", label: "Rent Payment" },
  { value: "loan_repayment", label: "Loan Repayment" },
  { value: "charity", label: "Charity/Donation" },
  { value: "other", label: "Other" },
];

// Payment methods
export const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "debit_card", label: "Debit Card" },
  { value: "credit_card", label: "Credit Card" },
  { value: "digital_wallet", label: "Digital Wallet" },
  { value: "cryptocurrency", label: "Cryptocurrency" },
];

// Delivery methods
export const DELIVERY_METHODS = [
  { value: "bank_deposit", label: "Bank Deposit" },
  { value: "cash_pickup", label: "Cash Pickup" },
  { value: "mobile_wallet", label: "Mobile Wallet" },
  { value: "home_delivery", label: "Home Delivery" },
];
