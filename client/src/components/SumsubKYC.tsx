import React, { useEffect, useRef } from "react";

// Sumsub WebSDK Integration
interface SumsubKYCProps {
  accessToken: string;
  onComplete?: (result: any) => void;
  onError?: (error: any) => void;
}

const SumsubKYC: React.FC<SumsubKYCProps> = ({
  accessToken,
  onComplete,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accessToken || !containerRef.current) return;

    // Dynamically import Sumsub WebSDK
    const loadSumsubSDK = async () => {
      try {
        // Load Sumsub WebSDK from CDN
        const script = document.createElement("script");
        script.src = "https://cdn.sumsub.com/websdk/websdk.js";
        script.async = true;

        script.onload = () => {
          initializeSumsub();
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error("Failed to load Sumsub SDK:", error);
        onError?.(error);
      }
    };

    const initializeSumsub = () => {
      // @ts-ignore - Sumsub SDK is loaded dynamically
      if (typeof window.snsWebSdk === "undefined") {
        console.error("Sumsub SDK not loaded");
        return;
      }

      // @ts-ignore
      let snsWebSdkInstance = window.snsWebSdk
        .init(
          accessToken,
          // Token update callback
          () => getNewAccessToken()
        )
        .withConf({
          lang: "en", // Language
          theme: "light", // Theme
        })
        .on("onError", (error: any) => {
          console.error("Sumsub KYC Error:", error);
          onError?.(error);
        })
        .onMessage((type: string, payload: any) => {
          console.log("Sumsub Message:", type, payload);

          // Handle different message types
          switch (type) {
            case "idCheck.onStepCompleted":
              console.log("Step completed:", payload);
              break;
            case "idCheck.onApplicationSubmitted":
              console.log("Application submitted:", payload);
              onComplete?.(payload);
              break;
            case "idCheck.onApplicantLoaded":
              console.log("Applicant loaded:", payload);
              break;
            default:
              console.log("Unknown message type:", type, payload);
          }
        })
        .build();

      // Launch the WebSDK
      if (containerRef.current) {
        snsWebSdkInstance.launch(containerRef.current);
      }
    };

    const getNewAccessToken = async (): Promise<string> => {
      try {
        // Call your backend to get a new access token
        const response = await fetch("/api/sumsub/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        return data.accessToken;
      } catch (error) {
        console.error("Failed to get new access token:", error);
        throw error;
      }
    };

    loadSumsubSDK();

    return () => {
      // Cleanup if needed
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [accessToken, onComplete, onError]);

  return (
    <div className="sumsub-kyc-container">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          📋 Identity Verification
        </h3>
        <p className="text-sm text-gray-600">
          Complete your identity verification to unlock all features
        </p>
      </div>

      <div
        ref={containerRef}
        id="sumsub-websdk-container"
        className="min-h-[600px] w-full rounded-lg border border-gray-200 bg-white"
        style={{ minHeight: "600px" }}
      />

      <div className="mt-4 text-xs text-gray-500">
        <p>🔒 Your information is secured with bank-level encryption</p>
        <p>✅ Powered by Sumsub - trusted by 1000+ companies worldwide</p>
      </div>
    </div>
  );
};

export default SumsubKYC;
