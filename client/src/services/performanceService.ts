import { performance } from "../config/firebase";
import { trace } from "firebase/performance";

export class PerformanceService {
  // Track page load times
  static trackPageLoad(pageName: string) {
    if (!performance) {
      console.log("Firebase Performance not available");
      return null;
    }

    try {
      const pageTrace = trace(performance, `page_load_${pageName}`);
      pageTrace.start();
      return pageTrace;
    } catch (error) {
      console.error("Error starting page load trace:", error);
      return null;
    }
  }

  // Track transaction flow performance
  static trackTransactionFlow() {
    if (!performance) {
      console.log("Firebase Performance not available");
      return null;
    }

    try {
      const transactionTrace = trace(performance, "transaction_flow");
      transactionTrace.start();
      return transactionTrace;
    } catch (error) {
      console.error("Error starting transaction trace:", error);
      return null;
    }
  }

  // Track API calls performance
  static trackApiCall(apiName: string) {
    if (!performance) {
      console.log("Firebase Performance not available");
      return null;
    }

    try {
      const apiTrace = trace(performance, `api_call_${apiName}`);
      apiTrace.start();
      return apiTrace;
    } catch (error) {
      console.error("Error starting API trace:", error);
      return null;
    }
  }

  // Track Firebase operations
  static trackFirebaseOperation(operationName: string) {
    if (!performance) {
      console.log("Firebase Performance not available");
      return null;
    }

    try {
      const firebaseTrace = trace(performance, `firebase_${operationName}`);
      firebaseTrace.start();
      return firebaseTrace;
    } catch (error) {
      console.error("Error starting Firebase operation trace:", error);
      return null;
    }
  }

  // Track user authentication flow
  static trackAuthFlow() {
    if (!performance) {
      console.log("Firebase Performance not available");
      return null;
    }

    try {
      const authTrace = trace(performance, "auth_flow");
      authTrace.start();
      return authTrace;
    } catch (error) {
      console.error("Error starting auth trace:", error);
      return null;
    }
  }

  // Stop trace and add custom attributes
  static stopTrace(traceInstance: any, attributes?: { [key: string]: string }) {
    if (!traceInstance) {
      return;
    }

    try {
      // Check if trace is still running before stopping
      if (typeof traceInstance.stop === "function") {
        // Add custom attributes if provided
        if (attributes) {
          Object.entries(attributes).forEach(([key, value]) => {
            try {
              if (typeof traceInstance.putAttribute === "function") {
                traceInstance.putAttribute(key, value);
              }
            } catch (attrError) {
              console.warn("Error adding trace attribute:", attrError);
            }
          });
        }

        // Check if trace is still active before stopping
        try {
          traceInstance.stop();
        } catch (stopError: any) {
          // Ignore "trace is not running" errors
          if (!stopError.message?.includes("not running")) {
            console.warn("Error stopping trace:", stopError);
          }
        }
      }
    } catch (error) {
      console.error("Error stopping trace:", error);
    }
  }

  // Track custom metrics
  static trackCustomMetric(metricName: string, value: number) {
    if (!performance) {
      console.log("Firebase Performance not available");
      return;
    }

    try {
      const customTrace = trace(performance, "custom_metrics");
      customTrace.start();
      customTrace.putMetric(metricName, value);
      customTrace.stop();
    } catch (error) {
      console.error("Error tracking custom metric:", error);
    }
  }

  // Track transaction completion rate
  static trackTransactionSuccess(
    transactionId: string,
    amount: number,
    currency: string
  ) {
    if (!performance) {
      return;
    }

    try {
      const successTrace = trace(performance, "transaction_success");
      successTrace.start();
      successTrace.putAttribute("transaction_id", transactionId);
      successTrace.putAttribute("currency", currency);
      successTrace.putMetric("amount", amount);
      successTrace.putAttribute("status", "completed");
      successTrace.stop();

      console.log(
        `✅ Performance: Transaction ${transactionId} completed successfully`
      );
    } catch (error) {
      console.error("Error tracking transaction success:", error);
    }
  }

  // Track transaction failure
  static trackTransactionFailure(transactionId: string, errorReason: string) {
    if (!performance) {
      return;
    }

    try {
      const failureTrace = trace(performance, "transaction_failure");
      failureTrace.start();
      failureTrace.putAttribute("transaction_id", transactionId);
      failureTrace.putAttribute("error_reason", errorReason);
      failureTrace.putAttribute("status", "failed");
      failureTrace.stop();

      console.log(
        `❌ Performance: Transaction ${transactionId} failed - ${errorReason}`
      );
    } catch (error) {
      console.error("Error tracking transaction failure:", error);
    }
  }

  // Track user abandonment points
  static trackUserAbandonmentPoint(page: string, step: string) {
    if (!performance) {
      return;
    }

    try {
      const abandonmentTrace = trace(performance, "user_abandonment");
      abandonmentTrace.start();
      abandonmentTrace.putAttribute("page", page);
      abandonmentTrace.putAttribute("step", step);
      abandonmentTrace.putAttribute("event", "abandonment_point");
      abandonmentTrace.stop();

      console.log(`🚪 Performance: User abandoned at ${page} - ${step}`);
    } catch (error) {
      console.error("Error tracking user abandonment:", error);
    }
  }

  // Track loading times for critical components
  static async trackComponentLoad<T>(
    componentName: string,
    loadFunction: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    const componentTrace = this.trackApiCall(`component_load_${componentName}`);

    try {
      const result = await loadFunction();
      const loadTime = Date.now() - startTime;

      this.stopTrace(componentTrace, {
        component_name: componentName,
        load_status: "success",
      });

      this.trackCustomMetric(`${componentName}_load_time`, loadTime);

      console.log(`⚡ Performance: ${componentName} loaded in ${loadTime}ms`);
      return result;
    } catch (error) {
      const loadTime = Date.now() - startTime;

      this.stopTrace(componentTrace, {
        component_name: componentName,
        load_status: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
      });

      console.log(
        `⚠️ Performance: ${componentName} failed to load in ${loadTime}ms`
      );
      throw error;
    }
  }
}
