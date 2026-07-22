import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';

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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
        {/* v77 Editorial Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-[#141613] px-6 py-10 sm:px-10 text-[#fffdf8] shadow-2xl border border-[#dcd7cb]/20 mb-8">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-[#1845d4]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#e5a024]/20 text-[#e5a024] border border-[#e5a024]/30 uppercase tracking-widest mb-3">
              <span>🏛️</span> Specialist Seller Onboarding
            </span>
            
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
              Sell Regional Specialty Foods Across the EU
            </h1>
            
            <p className="text-sm text-[#dcd7cb]/80 mb-6 leading-relaxed">
              Expand your independent European food business across 27 EU member states with automated DSA Art. 30 trader identity verification, FIC Reg. 1169/2011 allergen tools, and DAC7 single-market tax compliance.
            </p>
          </div>

          {/* 4-Step Onboarding Workflow */}
          <div className="mt-4 pt-4 border-t border-[#dcd7cb]/15 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[#fffdf8]/10 border border-white/10">
              <span className="font-mono text-[#e5a024] font-bold block mb-1">STEP 01</span>
              <span className="font-bold text-white block">Trader Identification</span>
              <span className="text-[11px] text-[#dcd7cb]/70">Business name, VAT ID & address</span>
            </div>
            <div className="p-3 rounded-xl bg-[#fffdf8]/10 border border-white/10">
              <span className="font-mono text-[#e5a024] font-bold block mb-1">STEP 02</span>
              <span className="font-bold text-white block">DSA Art. 30 Audit</span>
              <span className="text-[11px] text-[#dcd7cb]/70">Commercial register verification</span>
            </div>
            <div className="p-3 rounded-xl bg-[#fffdf8]/10 border border-white/10">
              <span className="font-mono text-[#e5a024] font-bold block mb-1">STEP 03</span>
              <span className="font-bold text-white block">Food Allergen Setup</span>
              <span className="text-[11px] text-[#dcd7cb]/70">EU 14 allergen declarations</span>
            </div>
            <div className="p-3 rounded-xl bg-[#fffdf8]/10 border border-white/10">
              <span className="font-mono text-[#e5a024] font-bold block mb-1">STEP 04</span>
              <span className="font-bold text-white block">Single Market Live</span>
              <span className="text-[11px] text-[#dcd7cb]/70">Cross-border direct sales</span>
            </div>
          </div>
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
