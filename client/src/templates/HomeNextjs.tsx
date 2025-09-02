import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const HomeNextjs = () => {
  // Use NextAuth.js instead of Redux for auth
  const { data: session, status } = useSession();
  const isAuthenticated = !!session;
  const isLoading = status === "loading";

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="pt-20 pb-16 md:pt-40 md:pb-20 lg:pt-48 lg:pb-28">
            <div className="text-center">
              <h1 className="mb-6 text-4xl font-extrabold text-white md:text-6xl">
                Send Money Globally with
                <span className="block text-yellow-400">RemitXpress</span>
              </h1>
              <p className="max-w-3xl mx-auto mb-8 text-xl text-blue-100">
                Secure, fast, and affordable international money transfers
                powered by blockchain technology. Send money to over 200
                countries with the lowest fees in the industry.
              </p>
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/register"
                      className="w-full px-8 py-3 text-lg font-bold text-blue-900 transition duration-200 bg-yellow-400 rounded-lg sm:w-auto hover:bg-yellow-300"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/login"
                      className="w-full px-8 py-3 text-lg font-bold text-white transition duration-200 border-2 border-white rounded-lg sm:w-auto hover:bg-white hover:text-blue-900"
                    >
                      Sign In
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/send-money"
                    className="w-full px-8 py-3 text-lg font-bold text-blue-900 transition duration-200 bg-yellow-400 rounded-lg sm:w-auto hover:bg-yellow-300"
                  >
                    Send Money Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Why Choose RemitXpress?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Experience the future of international money transfers
            </p>
          </div>

          <div className="grid gap-8 mt-12 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Low Fees
              </h3>
              <p className="mt-2 text-gray-600">
                Save up to 90% on transfer fees compared to traditional banks
              </p>
            </div>

            <div className="text-center">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Fast Transfers
              </h3>
              <p className="mt-2 text-gray-600">
                Most transfers complete within minutes, not days
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-purple-100 rounded-full">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Secure
              </h3>
              <p className="mt-2 text-gray-600">
                Bank-level security with blockchain transparency
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeNextjs;
