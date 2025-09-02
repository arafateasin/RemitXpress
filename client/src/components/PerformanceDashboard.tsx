import React, { useState, useEffect } from "react";
import { PerformanceService } from "../services/performanceService";
import { BlockchainService } from "../services/blockchainService";

const PerformanceDashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    transactionCount: 0,
    averageTransactionTime: 0,
    successRate: 0,
    blockchainUsage: 0,
  });

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === "development") {
      setIsVisible(true);
    }
  }, []);

  const runPerformanceTest = () => {
    // Test page load
    const pageTrace = PerformanceService.trackPageLoad("performance_test");
    setTimeout(() => {
      PerformanceService.stopTrace(pageTrace);
    }, Math.random() * 1000 + 500);

    // Test transaction
    PerformanceService.trackTransactionSuccess("TEST123", 1000, "MYR");

    // Test API call
    const apiTrace = PerformanceService.trackApiCall("test_api");
    setTimeout(() => {
      PerformanceService.stopTrace(apiTrace, { test: "true" });
    }, Math.random() * 500 + 200);

    // Update mock metrics
    setMetrics({
      pageLoadTime: Math.random() * 2000 + 500,
      transactionCount: Math.floor(Math.random() * 100) + 50,
      averageTransactionTime: Math.random() * 3000 + 1000,
      successRate: Math.random() * 20 + 80,
      blockchainUsage: Math.random() * 30 + 10,
    });
  };

  const testTransactionFlow = async () => {
    const flowTrace = PerformanceService.trackTransactionFlow();

    // Simulate transaction steps
    await new Promise((resolve) => setTimeout(resolve, 1000));

    PerformanceService.stopTrace(flowTrace, {
      flow_type: "test",
      steps_completed: "5",
      total_time: "1000ms",
    });

    console.log("✅ Transaction flow test completed");
  };

  const testComponentLoad = async () => {
    await PerformanceService.trackComponentLoad("test_component", async () => {
      // Simulate component loading
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 1000 + 200)
      );
      return "Component loaded successfully";
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg border border-gray-200 p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          📊 Performance Monitor
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-blue-600 font-medium">Page Load</div>
            <div className="text-blue-800">
              {metrics.pageLoadTime.toFixed(0)}ms
            </div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="text-green-600 font-medium">Success Rate</div>
            <div className="text-green-800">
              {metrics.successRate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <div className="text-purple-600 font-medium">Avg Time</div>
            <div className="text-purple-800">
              {metrics.averageTransactionTime.toFixed(0)}ms
            </div>
          </div>
          <div className="bg-orange-50 p-2 rounded">
            <div className="text-orange-600 font-medium">Blockchain</div>
            <div className="text-orange-800">
              {metrics.blockchainUsage.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="border-t pt-2 space-y-1">
          <button
            onClick={runPerformanceTest}
            className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
          >
            🚀 Run Performance Test
          </button>
          <button
            onClick={testTransactionFlow}
            className="w-full bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
          >
            💰 Test Transaction Flow
          </button>
          <button
            onClick={testComponentLoad}
            className="w-full bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
          >
            ⚡ Test Component Load
          </button>
        </div>

        <div className="border-t pt-2 text-xs text-gray-500">
          <div>🔍 Monitoring: Page loads, transactions, API calls</div>
          <div>📈 Data sent to Firebase Performance</div>
          <div>💡 Dev mode only</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
