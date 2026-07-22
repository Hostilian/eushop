import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';

<<<<<<< Updated upstream
export default function BecomeSellerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [formData, setFormData] = useState({
    businessName: '',
    tradeName: '',
    vatId: '',
    commercialRegisterNumber: '',
    registerCity: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: 'DE',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    documentLanguage: 'de',
    needsMultilingualForm: false,
    dsaConsent: false,
=======
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
  productOriginCountry: string;
  allergenResponsibilities: string[]; // List of allergens the seller takes responsibility for
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
    productOriginCountry: '',
    allergenResponsibilities: [],
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
>>>>>>> Stashed changes
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< Updated upstream
    setSubmitted(true);
=======
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
        productInfo: {
          originCountry: formData.businessDetailsInfo.productOriginCountry,
          allergenResponsibilities: formData.businessDetailsInfo.allergenResponsibilities,
        },
        compliance: {
          selfCertified: formData.complianceInfo.selfCertification,
          termsAccepted: formData.complianceInfo.acceptTerms,
        },
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
>>>>>>> Stashed changes
  };

  return (
    <PageWrapper>
      <Head>
        <title>Become a Verified EU Seller — DSA Art. 30 Onboarding</title>
        <meta
          name="description"
          content="Cross-border EU trader registration under Digital Services Act (DSA) Article 30 with Regulation (EU) 2016/1191 document translation guidance."
        />
      </Head>

      <div className="max-w-5xl mx-auto py-8">
        {/* Header Section */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-green dark:text-brand-gold uppercase tracking-wider mb-2">
            <span>🇪🇺 EU Digital Services Act (DSA) Article 30 Compliance</span>
          </div>
<<<<<<< Updated upstream
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display mb-3">
            Trader Onboarding & Cross-Border Identity Verification
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
            To sell specialty goods across the EU Single Market, EU law requires verifying 5 mandatory trader identification data points before listings go live.
          </p>
=======

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
                Please provide additional details about your business and products.
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

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-brand-dark dark:text-white mb-3">
                      Product Information
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <!-- COMPLIANCE-REVIEW: DSA Article 30 requires transparency about products offered -->
                      <!-- COMPLIANCE-REVIEW: EU 1169/2011 requires allergen information accuracy -->
                    </p>
                    <div>
                      <label className={LABEL}>Primary Product Origin Country</label>
                      <select
                        required
                        value={formData.businessDetailsInfo.productOriginCountry}
                        onChange={e => handleInputChange('businessDetailsInfo', 'productOriginCountry', e.target.value)}
                        className={INPUT}
                        aria-label="Primary product origin country"
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

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Allergen Responsibilities
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <!-- COMPLIANCE-REVIEW: DSA Article 30 requires sellers to acknowledge responsibility for allergen information accuracy -->
                        Please select the allergens for which you accept responsibility for accurate labeling and information:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {EU_ALLERGENS.map(allergen => (
                          <div key={allergen} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`allergen-${allergen}`}
                              checked={formData.businessDetailsInfo.allergenResponsibilities.includes(allergen)}
                              onChange={e => {
                                const allergenList = [...formData.businessDetailsInfo.allergenResponsibilities];
                                if (e.target.checked) {
                                  allergenList.push(allergen);
                                } else {
                                  const index = allergenList.indexOf(allergen);
                                  if (index > -1) allergenList.splice(index, 1);
                                }
                                setFormData(prev => ({
                                  ...prev,
                                  businessDetailsInfo: {
                                    ...prev.businessDetailsInfo,
                                    allergenResponsibilities: allergenList,
                                  },
                                }));
                              }}
                              className="h-4 w-4 text-brand-green rounded border-gray-300"
                              aria-label={`Responsibility for ${allergen} allergen`}
                            />
                            <label htmlFor={`allergen-${allergen}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              {allergen}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
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
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Street Address:</span>
                        <span className="font-mono">{formData.businessInfo.addressStreet || 'Not provided'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">City:</span>
                        <span className="font-mono">{formData.businessInfo.addressCity || 'Not provided'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Postal Code:</span>
                        <span className="font-mono">{formData.businessInfo.addressPostalCode || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-2">
                      Business Identification
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Trade Register Number:</span>
                        <span className="font-mono">{formData.identificationInfo.tradeRegisterNumber || 'Not provided'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Tax ID:</span>
                        <span className="font-mono">{formData.identificationInfo.taxId || 'Not provided'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">VAT Number:</span>
                        <span className="font-mono">{formData.identificationInfo.vatNumber || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-2">
                      Business Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Country of Establishment:</span>
                        <span className="font-mono">{formData.businessDetailsInfo.country || 'Not provided'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Product Origin Country:</span>
                        <span className="font-mono">{formData.businessDetailsInfo.productOriginCountry || 'Not provided'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 dark:text-gray-400 font-medium">Allergen Responsibilities:</span>
                        <span className="font-mono flex flex-wrap gap-1">
                          {formData.businessDetailsInfo.allergenResponsibilities.length > 0 ? (
                            formData.businessDetailsInfo.allergenResponsibilities.map(allergen => (
                              <span key={allergen} className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800 font-medium">
                                {allergen}</span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400 italic">None selected</span>
                          )}
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
>>>>>>> Stashed changes
        </div>

        {/* Translation Guidance Alert (Task 70) */}
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
            <span>📜</span>
            <span>Regulation (EU) 2016/1191 — Cross-Border Document Translation Rules</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            If your commercial register excerpt or ID document is issued in a language other than English or German, EU Regulation 2016/1191 allows attaching a <strong>Multilingual Standard Form (MSF)</strong> issued by your local public authority without needing costly sworn translations.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center space-y-4">
            <span className="text-4xl">🎉</span>
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">
              Trader Verification Application Submitted
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
              Your trader identification data for <strong>{formData.businessName || 'EU Trader'}</strong> has been submitted to EUshop Compliance Operations. Pursuant to DSA Art. 30(2), verification takes 1-2 business days.
            </p>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button variant="primary">Access Seller Dashboard</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm space-y-8">
            {/* Section 1: Business Identity */}
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-green text-white text-xs flex items-center justify-center font-mono">1</span>
                <span>Business & Statutory Identification</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessName" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Legal Business Name (as registered) *
                  </label>
                  <input
                    id="businessName"
                    required
                    type="text"
                    placeholder="e.g. Parma Delights S.r.l."
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div>
                  <label htmlFor="vatId" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    EU VAT Identification Number *
                  </label>
                  <input
                    id="vatId"
                    required
                    type="text"
                    placeholder="e.g. IT12345678901"
                    value={formData.vatId}
                    onChange={(e) => setFormData({ ...formData, vatId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div>
                  <label htmlFor="commercialRegisterNumber" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Commercial Register Number (Handelsregister / R.E.A.) *
                  </label>
                  <input
                    id="commercialRegisterNumber"
                    required
                    type="text"
                    placeholder="e.g. HRB 98765"
                    value={formData.commercialRegisterNumber}
                    onChange={(e) => setFormData({ ...formData, commercialRegisterNumber: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Country of Establishment *
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                  >
                    <option value="DE">Germany (DE)</option>
                    <option value="IT">Italy (IT)</option>
                    <option value="FR">France (FR)</option>
                    <option value="ES">Spain (ES)</option>
                    <option value="CZ">Czech Republic (CZ)</option>
                    <option value="PL">Poland (PL)</option>
                    <option value="BE">Belgium (BE)</option>
                    <option value="NL">Netherlands (NL)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact & DSA Disclosures */}
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-green text-white text-xs flex items-center justify-center font-mono">2</span>
                <span>DSA Art. 30 Public Trader Disclosure</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactName" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Trader Contact Person *
                  </label>
                  <input
                    id="contactName"
                    required
                    type="text"
                    placeholder="e.g. Giovanni Rossi"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Trader Public Email *
                  </label>
                  <input
                    id="contactEmail"
                    required
                    type="email"
                    placeholder="info@parmadelights.it"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: DSA Consent */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.dsaConsent}
                  onChange={(e) => setFormData({ ...formData, dsaConsent: e.target.checked })}
                  className="mt-0.5 rounded text-brand-green focus:ring-brand-green"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  I confirm that all submitted identification data is accurate under penalty of account suspension pursuant to Digital Services Act (DSA) Article 30(3). I agree to display "Sold by {formData.businessName || 'Trader'}" on all product listings.
                </span>
              </label>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary">
                  Submit Verification Data
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </PageWrapper>
  );
}
