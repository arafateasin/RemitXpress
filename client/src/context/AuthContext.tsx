import React, { createContext, useContext } from "react";
import { useSession } from "next-auth/react";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();

  const value: AuthContextType = {
    user: session?.user || null,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    isInitialized: status !== "loading",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
