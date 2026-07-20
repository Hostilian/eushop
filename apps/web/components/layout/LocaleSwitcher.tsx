import React, { useState, useEffect } from 'react';
import type { SupportedLanguage } from '../../lib/i18n';

export const SUPPORTED_LOCALES: Array<{ code: SupportedLanguage; label: string; flag: string }> = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'cs', label: 'Čeština', flag: '🇨🇿' },
];

export function LocaleSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eushop_locale') as SupportedLanguage;
      if (saved && SUPPORTED_LOCALES.some(l => l.code === saved)) {
        return saved;
      }
    }
    return 'en';
  });

  const handleLocaleChange = (code: SupportedLanguage) => {
    setCurrentLocale(code);
    localStorage.setItem('eushop_locale', code);
    document.documentElement.lang = code;
  };

  return (
    <div className="relative inline-block text-left" data-testid="locale-switcher">
      <label htmlFor="locale-select" className="sr-only">
        Select Language / EU Locale
      </label>
      <select
        id="locale-select"
        value={currentLocale}
        onChange={(e) => handleLocaleChange(e.target.value as SupportedLanguage)}
        className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-green cursor-pointer transition-colors"
        aria-label="Language selector"
      >
        {SUPPORTED_LOCALES.map(({ code, label, flag }) => (
          <option key={code} value={code}>
            {flag} {label} ({code.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  );
}
