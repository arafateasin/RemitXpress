import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const newToken = response.data.token;
        if (typeof window !== "undefined") {
          localStorage.setItem("token", newToken);
        }
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          // Don't redirect to login if user is on dashboard (likely OAuth user)
          const currentPath = window.location.pathname;
          if (currentPath !== "/dashboard") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  verifyTwoFactor: (data) => api.post("/auth/verify-2fa", data),
  setupTwoFactor: () => api.get("/auth/setup-2fa"),
  enableTwoFactor: (data) => api.post("/auth/enable-2fa", data),
  refreshToken: () => api.post("/auth/refresh"),
};

// User API
export const userAPI = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (data) => api.patch("/user/profile", data),
  submitKYC: (formData) =>
    api.post("/user/kyc", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getKYCStatus: () => api.get("/user/kyc/status"),
  updateSecurity: (data) => api.patch("/user/security", data),
  getBalances: () => api.get("/user/balances"),
  connectWallet: (data) => api.post("/user/wallet/connect", data),
  disconnectWallet: () => api.delete("/user/wallet/disconnect"),
};

// Remittance API
export const remitAPI = {
  getExchangeRates: () => api.get("/remit/rates"),
  calculateFees: (data) => api.post("/remit/calculate-fees", data),
  sendMoney: (data) => api.post("/remit/send", data),
  getTransactionHistory: (params) => api.get("/remit/history", { params }),
  getTransactionDetails: (transactionId) =>
    api.get(`/remit/transaction/${transactionId}`),
  cancelTransaction: (transactionId) =>
    api.patch(`/remit/transaction/${transactionId}/cancel`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  updateUserStatus: (userId, data) =>
    api.patch(`/admin/users/${userId}/status`, data),
  reviewKYC: (userId, data) => api.patch(`/admin/users/${userId}/kyc`, data),
  getTransactions: (params) => api.get("/admin/transactions", { params }),
  getSuspiciousTransactions: () => api.get("/admin/transactions/suspicious"),
  flagTransaction: (transactionId, data) =>
    api.patch(`/admin/transactions/${transactionId}/flag`, data),
  getComplianceReport: (params) =>
    api.get("/admin/reports/compliance", { params }),
};

export default api;
