import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface NoticeAndActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetContentId?: string;
}

export function NoticeAndActionModal({ isOpen, onClose, targetContentId = 'LISTING-DEMO' }: NoticeAndActionModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterEmail: '',
    explanation: '',
    exactUrl: `https://hostilian.github.io/eushop/food/${targetContentId}`,
    goodFaithConfirmation: false,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" data-testid="notice-action-modal">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
            <span>🚩</span>
            <span>DSA Article 16 Illegal Content Notice</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <span className="text-3xl">✅</span>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Notice Submitted Successfully</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Pursuant to DSA Art. 16(5), an automated confirmation has been generated and dispatched. Our legal moderation team will review this notice without undue delay.
            </p>
            <Button variant="secondary" onClick={onClose}>Close Notice Window</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Use this statutory mechanism to notify EUshop of allegedly illegal content (e.g. unsafe food, counterfeit goods, missing Annex II allergen warnings).
            </p>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Your Full Name / Entity *</label>
              <input
                type="text"
                required
                placeholder="e.g. Consumer Protection Agency / John Doe"
                value={formData.reporterName}
                onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Your Contact Email *</label>
              <input
                type="email"
                required
                placeholder="reporter@example.eu"
                value={formData.reporterEmail}
                onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Reasoned Explanation of Alleged Illegality *</label>
              <textarea
                required
                rows={3}
                placeholder="Explain why you consider the content to be illegal under EU law..."
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.goodFaithConfirmation}
                onChange={(e) => setFormData({ ...formData, goodFaithConfirmation: e.target.checked })}
                className="mt-0.5 rounded text-brand-green"
              />
              <span className="text-gray-600 dark:text-gray-400">
                I confirm in good faith that the information contained in this notice is accurate and complete (DSA Art. 16(2)(d)).
              </span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary">Submit DSA Art. 16 Notice</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
