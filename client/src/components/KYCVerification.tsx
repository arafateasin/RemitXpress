import React, { useState } from "react";

interface KYCVerificationProps {
  onClose: () => void;
}

const KYCVerification: React.FC<KYCVerificationProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    dateOfBirth: "",
    nationality: "",
    phoneNumber: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",

    // Document Upload
    documentType: "passport",
    documentNumber: "",
    documentFile: null,
    selfieFile: null,

    // Additional Information
    occupation: "",
    sourceOfFunds: "",
    monthlyIncome: "",
    purposeOfAccount: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files?.[0],
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Here you would submit the KYC data to your API
      console.log("KYC Data:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(
        "KYC verification submitted successfully! We will review your application within 24-48 hours."
      );
      onClose();
    } catch (error) {
      console.error("KYC submission error:", error);
      alert("Error submitting KYC verification. Please try again.");
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nationality *
          </label>
          <select
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Nationality</option>
            <option value="MY">Malaysian</option>
            <option value="SG">Singaporean</option>
            <option value="BD">Bangladeshi</option>
            <option value="IN">Indian</option>
            <option value="PK">Pakistani</option>
            <option value="US">American</option>
            <option value="UK">British</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="+60123456789"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address *
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleTextareaChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your full address"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code *
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Country</option>
            <option value="MY">Malaysia</option>
            <option value="SG">Singapore</option>
            <option value="BD">Bangladesh</option>
            <option value="IN">India</option>
            <option value="PK">Pakistan</option>
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Document Verification
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Document Type *
        </label>
        <select
          name="documentType"
          value={formData.documentType}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="passport">Passport</option>
          <option value="nric">National ID (NRIC)</option>
          <option value="driving_license">Driving License</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Document Number *
        </label>
        <input
          type="text"
          name="documentNumber"
          value={formData.documentNumber}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter document number"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Document Photo *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            name="documentFile"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="hidden"
            id="documentFile"
            required
          />
          <label htmlFor="documentFile" className="cursor-pointer">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="mt-2">
              <span className="text-blue-600 font-medium">Click to upload</span>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-sm text-gray-500">PNG, JPG, PDF up to 10MB</p>
          </label>
          {formData.documentFile && (
            <p className="mt-2 text-sm text-green-600">
              ✓ {formData.documentFile.name}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Selfie with Document *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            name="selfieFile"
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="selfieFile"
            required
          />
          <label htmlFor="selfieFile" className="cursor-pointer">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="mt-2">
              <span className="text-blue-600 font-medium">
                Click to upload selfie
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Hold your document next to your face
            </p>
          </label>
          {formData.selfieFile && (
            <p className="mt-2 text-sm text-green-600">
              ✓ {formData.selfieFile.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Additional Information
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Occupation *
        </label>
        <input
          type="text"
          name="occupation"
          value={formData.occupation}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Software Engineer, Teacher, Business Owner"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source of Funds *
        </label>
        <select
          name="sourceOfFunds"
          value={formData.sourceOfFunds}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Source</option>
          <option value="employment">Employment/Salary</option>
          <option value="business">Business Income</option>
          <option value="investment">Investment Returns</option>
          <option value="savings">Personal Savings</option>
          <option value="family">Family Support</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monthly Income Range *
        </label>
        <select
          name="monthlyIncome"
          value={formData.monthlyIncome}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Range</option>
          <option value="0-2000">Less than RM 2,000</option>
          <option value="2000-5000">RM 2,000 - RM 5,000</option>
          <option value="5000-10000">RM 5,000 - RM 10,000</option>
          <option value="10000-20000">RM 10,000 - RM 20,000</option>
          <option value="20000+">More than RM 20,000</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Purpose of Account *
        </label>
        <select
          name="purposeOfAccount"
          value={formData.purposeOfAccount}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Purpose</option>
          <option value="family_support">Family Support</option>
          <option value="education">Education Expenses</option>
          <option value="business">Business Transactions</option>
          <option value="investment">Investment</option>
          <option value="personal">Personal Use</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Review & Submit</h3>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div>
          <h4 className="font-medium text-gray-800">Personal Information</h4>
          <p className="text-sm text-gray-600">
            {formData.fullName} • {formData.nationality} •{" "}
            {formData.phoneNumber}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-800">Document</h4>
          <p className="text-sm text-gray-600">
            {formData.documentType.toUpperCase()} • {formData.documentNumber}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-800">Additional Info</h4>
          <p className="text-sm text-gray-600">
            {formData.occupation} • {formData.sourceOfFunds}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• We&apos;ll review your documents within 24-48 hours</li>
          <li>• You&apos;ll receive an email notification about the status</li>
          <li>• Once approved, you can start sending money internationally</li>
          <li>• Higher transaction limits will be available</li>
        </ul>
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              KYC Verification
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep} of 4</span>
              <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {getStepContent()}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Submit KYC
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KYCVerification;
