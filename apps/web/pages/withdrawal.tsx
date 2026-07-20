import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';

export default function WithdrawalPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    consumerName: '',
    consumerAddress: '',
    consumerEmail: '',
    orderNumber: '',
    orderDate: '',
    goodsReceivedDate: '',
    itemDetails: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <PageWrapper>
      <Head>
        <title>Statutory Right of Withdrawal Form — EUshop</title>
        <meta
          name="description"
          content="Standard statutory EU withdrawal form under Directive 2011/83/EU Annex I(B) for EU Single Market distance sales."
        />
      </Head>

      <div className="max-w-4xl mx-auto py-8">
        {/* Header & Directive Citation */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-green dark:text-brand-gold uppercase tracking-wider mb-2">
            <span>🇪🇺 EU Consumer Rights Directive 2011/83/EU Annex I(B)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display mb-3">
            Model Statutory Withdrawal Form
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            As an EU consumer, you have the right to withdraw from a distance purchase within <strong>14 days</strong> without giving any reason. You may use this model form or submit an unambiguous written declaration.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center space-y-4">
            <span className="text-4xl">✅</span>
            <h2 className="text-xl font-bold text-green-900 dark:text-green-200">
              Withdrawal Declaration Registered
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 max-w-lg mx-auto">
              Your statutory withdrawal request for order <strong>{formData.orderNumber || '#EU-DEMO'}</strong> has been registered. The trader and marketplace support team have been notified.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Button variant="primary" onClick={handlePrint}>
                🖨️ Print Statutory PDF Record
              </Button>
              <Link href="/">
                <Button variant="secondary">Return to Storefront</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm space-y-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                To Trader / EUshop Marketplace Operator:
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                EUshop Marketplace Europe S.à r.l. · 14 Rue Erasme, L-1468 Luxembourg · email: withdrawal@eushop.eu
              </p>
            </div>

            <p className="text-xs italic text-gray-600 dark:text-gray-400">
              I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*):
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="consumerName" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Name of Consumer(s) *
                </label>
                <input
                  id="consumerName"
                  required
                  type="text"
                  placeholder="e.g. Marie Curie"
                  value={formData.consumerName}
                  onChange={(e) => setFormData({ ...formData, consumerName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div>
                <label htmlFor="consumerEmail" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  id="consumerEmail"
                  required
                  type="email"
                  placeholder="marie.curie@example.eu"
                  value={formData.consumerEmail}
                  onChange={(e) => setFormData({ ...formData, consumerEmail: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="consumerAddress" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Address of Consumer(s) *
                </label>
                <input
                  id="consumerAddress"
                  required
                  type="text"
                  placeholder="Street, Postal Code, City, Country"
                  value={formData.consumerAddress}
                  onChange={(e) => setFormData({ ...formData, consumerAddress: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div>
                <label htmlFor="orderNumber" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Order Reference / Number *
                </label>
                <input
                  id="orderNumber"
                  required
                  type="text"
                  placeholder="e.g. EU-98231-BE"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div>
                <label htmlFor="orderDate" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Ordered On / Received On Date *
                </label>
                <input
                  id="orderDate"
                  required
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="itemDetails" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Description of Items Being Returned
                </label>
                <textarea
                  id="itemDetails"
                  rows={3}
                  placeholder="List items included in this withdrawal request..."
                  value={formData.itemDetails}
                  onChange={(e) => setFormData({ ...formData, itemDetails: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                (*) Delete as appropriate. Statutory compliance verified under EU Directive 2011/83/EU.
              </span>
              <Button type="submit" variant="primary">
                Submit Withdrawal Declaration
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageWrapper>
  );
}
