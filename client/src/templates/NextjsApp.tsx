import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import Layout from "../components/Layout";
import "../styles/globals.css";

// This is the Next.js way - no Redux needed!
function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  // Create React Query client (for data fetching instead of Redux)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
        },
      })
  );

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster position="top-right" />
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
