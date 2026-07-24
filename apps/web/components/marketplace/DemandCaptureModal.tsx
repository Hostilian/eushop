import React, { useState } from 'react';

interface DemandCaptureProps {
  initialSearchTerm: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DemandCaptureModal: React.FC<DemandCaptureProps> = ({
  initialSearchTerm,
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white text-sm"
        >
          ✕
        </button>

        <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-2">
          Specialty Food Acquisition Network
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2">Request "{initialSearchTerm}"</h2>
        <p className="text-sm text-neutral-300 mb-6">
          We couldn't find an active producer listing for this specialty yet. Enter your email and our European producer acquisition team will locate verified suppliers.
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-bold text-sm text-center">
            ✓ Request submitted! We'll notify you as soon as a verified producer lists this specialty.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Your Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="buyer@example.eu"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg"
            >
              Submit Food Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
