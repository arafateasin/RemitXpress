import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { BlockchainProvider } from "../src/context/BlockchainContext";
import "../src/styles/globals.css";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  // Register service worker for Firebase messaging (only in browser)
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <BlockchainProvider>
          <div className="min-h-screen bg-gray-50">
            <Component {...pageProps} />
          </div>
          <Toaster position="top-right" />
        </BlockchainProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
