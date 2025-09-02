// Alternative KYC Solutions for RemitXpress

export const kycProviders = {
  // 1. Jumio (Easy integration)
  jumio: {
    website: "https://www.jumio.com/",
    pricing: "Pay per verification",
    complexity: "Medium",
    setup: "https://www.jumio.com/developers/",
  },

  // 2. Onfido (Developer friendly)
  onfido: {
    website: "https://onfido.com/",
    pricing: "Free tier available",
    complexity: "Easy",
    setup: "https://developers.onfido.com/",
  },

  // 3. Veriff (Simple API)
  veriff: {
    website: "https://www.veriff.com/",
    pricing: "Pay per verification",
    complexity: "Easy",
    setup: "https://developers.veriff.com/",
  },

  // 4. Mock KYC (For development/demo)
  mock: {
    description: "Simple mock KYC for testing",
    implementation: "Built-in component",
    cost: "Free",
    suitable: "Development & Demo",
  },
};

// Current Implementation: Mock KYC for Development
// You can upgrade to real KYC service later
