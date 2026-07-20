import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authAPI, User, foodAPI, FoodItem } from '../lib/services';
import { PageWrapper } from '../components/layout/PageWrapper';

const INPUT = 'w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm text-gray-800 dark:text-gray-200 transition';
const INPUT_LG = 'w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm text-gray-800 dark:text-gray-200 transition';
const LABEL = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2';

const EU_ALLERGENS = [
  'Gluten', 'Crustaceans', 'Eggs', 'Fish', 'Peanuts', 'Soybeans',
  'Milk', 'Nuts', 'Celery', 'Mustard', 'Sesame', 'Sulfites', 'Lupin', 'Molluscs',
];

// COMPLIANCE-REVIEW: DSA Article 30 requires collection of trader identification information
// COMPLIANCE-REVIEW: DAC7 requires tax identifier collection for seller reporting
// COMPLIANCE-REVIEW: EU 1169/2011 requires allergen responsibility acknowledgment

interface BusinessInfo {
  businessName: string;
  email: string;
  phone: string;
  addressStreet: string;
  addressCity: string;
  addressPostalCode: string;
}

interface IdentificationInfo {
  tradeRegisterNumber: string;
  taxId: string;
  vatNumber?: string;
}

interface BusinessDetailsInfo {
  country: string;
  productOrigin: string;
}

interface ComplianceInfo {
  selfCertification: boolean;
  acceptTerms: boolean;
}

interface FormData {
  businessInfo: BusinessInfo;
  identificationInfo: IdentificationInfo;
  businessDetailsInfo: BusinessDetailsInfo;
  complianceInfo: ComplianceInfo;
}

const INITIAL_FORM_DATA: FormData = {
  businessInfo: {
    businessName: '',
    email: '',
    phone: '',
    addressStreet: '',
    addressCity: '',
    addressPostalCode: '',
  },
  identificationInfo: {
    tradeRegisterNumber: '',
    taxId: '',
    vatNumber: '',
  },
  businessDetailsInfo: {
    country: '',
    productOrigin: '',
  },
  complianceInfo: {
    selfCertification: false,
    acceptTerms: false,
  },
};

function getFormDataFromStorage(): FormData | null {
  try {
    const saved = localStorage.getItem('eushop-seller-draft');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.warn('Failed to parse seller draft from localStorage', e);
    return null;
  }
}

function saveFormDataToStorage(data: FormData) {
  try {
    localStorage.setItem('eushop-seller-draft', JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save seller draft to localStorage', e);
  }
}

function clearFormDataFromStorage() {
  try {
    localStorage.removeItem('eushop-seller-draft');
  } catch (e) {
    console.warn('Failed to clear seller draft from localStorage', e);
  }
}

export default function BecomeSeller() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = getFormDataFromStorage();
    return saved ?? INITIAL_FORM_DATA;
  });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'sell' | 'dashboard'>('sell');
  const [user, setUser] = useState<User | null>(null);
  const [myListings, setMyListings] = useState<FoodItem[]>([]);

  // Load user data and draft form data on mount
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        if (isMounted) {
          setUser(userData);

          // Pre-fill form with user data if available
          if (userData) {
            setFormData(prev => ({
              ...prev,
              businessInfo: {
                ...prev.businessInfo,
                email: userData.email || '',
              },
              businessDetailsInfo: {
                ...prev.businessDetailsInfo,
                country: userData.country || '',
              }
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    saveFormDataToStorage(formData);
  }, [formData]);

  const goToNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleGoToStep = (stepNumber: number) => {
    setStep(stepNumber);
  };

  const handleInputChange = (
    field: keyof FormData,
    subField: keyof any,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] as object),
        [subField]: value,
      } as any,
    }));
  };

  const handleCreateSellerAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessInfo.businessName || !formData.businessInfo.email) {
      return;
    }

    setSubmitting(true);
    try {
      // Prepare seller application data
      const sellerData = {
        businessName: formData.businessInfo.businessName,
        contactEmail: formData.businessInfo.email,
        phoneNumber: formData.businessInfo.phone,
        businessAddress: {
          street: formData.businessInfo.addressStreet,
          city: formData.businessInfo.addressCity,
          postalCode: formData.businessInfo.addressPostalCode,
          country: formData.businessDetailsInfo.country,
        },
        identification: {
          tradeRegisterNumber: formData.identificationInfo.tradeRegisterNumber,
          taxId: formData.identificationInfo.taxId,
          vatNumber: formData.identificationInfo.vatNumber || undefined,
        },
        compliance: {
          selfCertified: formData.complianceInfo.selfCertification,
          termsAccepted: formData.complianceInfo.acceptTerms,
        },
        productOrigin: formData.businessDetailsInfo.productOrigin,
      };

      // This would typically call an API to submit the seller application
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear the draft since we've successfully submitted
      clearFormDataFromStorage();

      setSuccess(true);
      // In a real app, we would redirect to a success page or dashboard
    } catch (error) {
      console.error('Failed to submit seller application:', error);
      // In a real app, we would show an error message
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-green/10 text-brand-green mb-6">
              ✓
            </div>
            <h1 className="text-2xl font-black text-brand-dark dark:text-white mb-4">
              Application Submitted Successfully!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Thank you for applying to become a seller on EUshop. Our team will review your application and contact you via email within 1-3 business days.
            </p>
            <div className="space-y-4">
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-brand-green text-white rounded-xl font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 transition-colors"
              >
                Return to Home
              </Link>
              <Link
                href="/search"
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
            <div
              className={`h-2.5 w-[${(step - 1) / 3 * 100}%] bg-brand-green rounded-none transition-all duration-300`}
            ></div>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span>Step 1 of 4</span>
            <span>Step 2 of 4</span>
            <span>Step 3 of 4</span>
            <span>Step 4 of 4</span>
          </div>

          {/* Form Steps */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-black text-brand-dark dark:text-white mb-4">
                Business Information
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Let's start with your basic business information.
              </p>

              <form onSubmit={e => e.preventDefault()} className="space-y-6">
                <div>
                  <label className={LABEL}>Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Artisanal Foods Ltd"
                    value={formData.businessInfo.businessName}
                    onChange={e => handleInputChange('businessInfo', 'businessName', e.target.value)}
                    className={INPUT}
                    aria-label="Business name"
                  />
                </div>

                <div>
                  <label className={LABEL}>Business Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@yourbusiness.com"
                    value={formData.businessInfo.email}
                    onChange={e => handleInputChange('businessInfo', 'email', e.target.value)}
                    className={INPUT}
                    aria-label="Business email"
                  />
                </div>

                <div>
                  <label className={LABEL}>Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+49 123 456789"
                    value={formData.businessInfo.phone}
                    onChange={e => handleInputChange('businessInfo', 'phone', e.target.value)}
                    className={INPUT}
                    aria-label="Business phone number"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Václavské náměstí 1"
                      value={formData.businessInfo.addressStreet}
                      onChange={e => handleInputChange('businessInfo', 'addressStreet', e.target.value)}
                      className={INPUT}
                      aria-label="Street address"
                    />
                  </div>
                  <div>
                    <label className={LABEL}>City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prague"
                      value={formData.businessInfo.addressCity}
                      onChange={e => handleInputChange('businessInfo', 'addressCity', e.target.value)}
                      className={INPUT}
                      aria-label="City"
                    />
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Postal Code</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{5}"
                    placeholder="e.g. 11000"
                    value={formData.businessInfo.addressPostalCode}
                    onChange={e => handleInputChange => handleInputChange('businessInfo', 'addressPostalCode', e.target.value)}
                  className={INPUT}
                  aria-label="Postal code"
                />
              </div>
            </form>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={goToNextStep}
                disabled={submitting}
                className="px-6 py-3 bg-brand-green text-white rounded-xl font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                Next Step
              </button>
            </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-2xl font-black text-brand-dark dark:text-white mb-4">
                Business Identification
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please provide your official business identification numbers.
              </p>

              <form onSubmit={e => e.preventDefault()} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-brand-dark dark:text-white mb-3">
                    Legal Identification (DSA/DAC7 Requirements)
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    These fields are required for compliance with EU regulations:
                    <span className="text-xs block mt-1">
                      • DSA Article 30: Trader identification and verification<br />
                      • DAC7: Tax reporting obligations for digital platforms
                    </span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Trade Register Number</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HRB 12345"
                        value={formData.identificationInfo.tradeRegisterNumber}
                        onChange={e => handleInputChange('identificationInfo', 'tradeRegisterNumber', e.target.value)}
                        className={INPUT}
                        aria-label="Trade register number"
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Tax Identification Number (TIN)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DE123456789"
                        value={formData.identificationInfo.taxId}
                        onChange={e => handleInputChange('identificationInfo', 'taxId', e.target.value)}
                        className={INPUT}
                        aria-label="Tax identification number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>VAT Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. EU VAT Number"
                      value={formData.identificationInfo.vatNumber}
                      onChange={e => handleInputChange('identificationInfo', 'vatNumber', e.target.value)}
                      className={INPUT}
                      aria-label="VAT number"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Optional for businesses not required to register for VAT
                    </p>
                  </div>
                </div>
              </form>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="px-6 py-3 bg-white text-gray-800 dark:text-gray-200 border border-gray-300 rounded-xl hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 transition-colors"
                >
                  Previous Step
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={submitting}
                  className="px-6 py-3 bg-brand-green text-white rounded-xl font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-2xl font-black text-brand-dark dark:text-white mb-4">
                Business Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please provide additional details about your business.
              </p>

              <form onSubmit={e => e.preventDefault()} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-brand-dark dark:text-white mb-3">
                    Business Location
                  </h2>

                  <div>
                    <label className={LABEL}>Country of Establishment</label>
                    <select
                      required
                      value={formData.businessDetailsInfo.country}
                      onChange={e => handleInputChange('businessDetailsInfo', 'country', e.target.value)}
                      className={INPUT}
                      aria-label="Country of establishment"
                    >
                      <option value="">Select Country</option>
                      <option value="AT">Austria</option>
                      <option value="BE">Belgium</option>
                      <option value="BG">Bulgaria</option>
                      <option value="HR">Croatia</option>
                      <option value="CY">Cyprus</option>
                      <option value="CZ">Czech Republic</option>
                      <option value="DK">Denmark</option>
                      <option value="EE">Estonia</option>
                      <option value="FI">Finland</option>
                      <option value="FR">France</option>
                      <option value="DE">Germany</option>
                      <option value="GR">Greece</option>
                      <option value="HU">Hungary</option>
                      <option value="IE">Ireland</option>
                      <option value="IT">Italy</option>
                      <option value="LV">Latvia</option>
                      <option value="LT">Lithuania</option>
                      <option value="LU">Luxembourg</option>
                      <option value="MT">Malta</option>
                      <option value="NL">Netherlands</option>
                      <option value="PL">Poland</option>
                      <option value="PT">Portugal</option>
                      <option value="RO">Romania</option>
                      <option value="SK">Slovakia</option>
                      <option value="SI">Slovenia</option>
                      <option value="ES">Spain</option>
                      <option value="SE">Sweden</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Product Origin Countries</label>
                    <textarea
                      placeholder="e.g. Germany, France, Italy (where you source or produce your products)"
                      value={formData.businessDetailsInfo.productOrigin}
                      onChange={e => handleInputChange('businessDetailsInfo', 'productOrigin', e.target.value)}
                      className={INPUT_LG}
                      aria-label="Product origin countries"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      List the countries where you source or produce your products, separated by commas.
                      This helps ensure accurate origin labeling for your food items.
                    </p>
                  </div>
                </div>
              </form>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="px-6 py-3 bg-white text-gray-800 dark:text-gray-200 border border-gray-300 rounded-xl hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 transition-colors"
                >
                  Previous Step
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={submitting}
                  className="px-6 py-3 bg-brand-green text-white rounded-xl font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="text-2xl font-black text-brand-dark dark:text-white mb-4">
                Review & Submit
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please review your information before submitting your application.
              </p>

              {/* Preview Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8 p-6">
                <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-4">
                  Application Summary
                </h2>

                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-2">
                      Business Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Business Name:</span>
                        <span className="font-mono">{formData.businessInfo.businessName || 'Not provided'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Email:</span>
                        <span className="font-mono">{formData.businessInfo.email || 'Not provided'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Phone:</span>
                        <span className="font-mono">{formData.businessInfo.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Address:</span>
                        <span className="font-mono">
                          {[formData.businessInfo.addressStreet, formData.businessInfo.addressCity, formData.businessInfo.addressPostalCode, formData.businessDetailsInfo.country]
                            .filter(Boolean)
                            .join(', ') || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-2">
                      Identification & Verification
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Trade Register:</span>
                        <span className="font-mono">
                          {formData.identificationInfo.tradeRegisterNumber || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Tax ID:</span>
                        <span className="font-mono">
                          {formData.identificationInfo.taxId || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">VAT Number:</span>
                        <span className="font-mono">
                          {formData.identificationInfo.vatNumber || 'Not provided (optional)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-2">
                      Business Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Country:</span>
                        <span className="font-mono">
                          {formData.businessDetailsInfo.country || 'Not selected'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-2">
                      Product Origin
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Product Origin:</span>
                        <span className="font-mono">
                          {formData.businessDetailsInfo.productOrigin || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-2">
                      Compliance & Agreements
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Self-Certification:</span>
                        <span className="font-mono">
                          {formData.complianceInfo.selfCertification ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Terms Accepted:</span>
                        <span className="font-mono">
                          {formData.complianceInfo.acceptTerms ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="self-certification"
                    checked={formData.complianceInfo.selfCertification}
                    onChange={e =>
                      handleInputChange('complianceInfo', 'selfCertification', e.target.checked)
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green h-4 w-4"
                  />
                  <label for="self-certification" className="ml-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    I self-certify that all products I list will comply with EU law, including
                    allergen labelling (Regulation EU 1169/2011) and national food safety standards.
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This is required under DSA Article 30 for trader transparency.
                    </span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms-acceptance"
                    checked={formData.complianceInfo.acceptTerms}
                    onChange={e =>
                      handleInputChange('complianceInfo', 'acceptTerms', e.target.checked)
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green h-4 w-4"
                  />
                  <label for="terms-acceptance" className="ml-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    I agree to the
                    <Link
                      href="/terms"
                      className="text-brand-green dark:text-brand-gold hover:underline font-semibold"
                    >
                      Terms of Service
                    </Link>
                    and
                    <Link
                      href="/privacy"
                      className="text-brand-green dark:text-brand-gold hover:underline font-semibold"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCreateSellerAccount}
                  disabled={submitting || !formData.complianceInfo.selfCertification || !formData.complianceInfo.acceptTerms}
                  className="px-8 py-4 bg-brand-green text-white rounded-xl font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}