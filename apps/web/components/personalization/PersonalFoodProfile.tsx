import React, { useEffect, useState } from 'react';
import {
  getAnonymousPreferences,
  saveAnonymousPreferences,
  clearAnonymousPreferences,
  AnonymousFoodPreferences,
} from '../../lib/personalization/userPreferences';
import { trackEvent } from '../../lib/analytics/events';
import { EU_ALLERGENS_14 } from '@eushop/compliance';

const FOOD_INTEREST_OPTIONS = [
  { id: 'Cheese', name: 'Artisan Cheeses', icon: '🧀' },
  { id: 'Chocolate', name: 'Belgian & Swiss Chocolates', icon: '🍫' },
  { id: 'Wine', name: 'Fine European Wines & Spirits', icon: '🍷' },
  { id: 'Charcuterie', name: 'Cured Meats & Charcuterie', icon: '🥓' },
  { id: 'Condiment', name: 'Olive Oils & Vinegars', icon: '🫒' },
  { id: 'Sweets', name: 'Pastries & Confectionery', icon: '🥐' },
  { id: 'Savory', name: 'Preserves & Delicatessen', icon: '🥫' },
];

const REGION_OPTIONS = [
  { id: 'IT', name: 'Italy (Tuscany, Emilia-Romagna, Sicily)', icon: '🇮🇹' },
  { id: 'FR', name: 'France (Bordeaux, Provence, Normandy)', icon: '🇫🇷' },
  { id: 'ES', name: 'Spain (Andalusia, La Rioja, Galicia)', icon: '🇪🇸' },
  { id: 'DE', name: 'Germany (Bavaria, Black Forest)', icon: '🇩🇪' },
  { id: 'BE', name: 'Belgium (Flanders, Ardennes)', icon: '🇧🇪' },
  { id: 'GR', name: 'Greece (Crete, Peloponnese)', icon: '🇬🇷' },
  { id: 'PT', name: 'Portugal (Douro, Alentejo)', icon: '🇵🇹' },
];

const DIETARY_OPTIONS = [
  { id: 'Vegetarian', label: 'Vegetarian' },
  { id: 'Vegan', label: 'Vegan' },
  { id: 'Organic', label: 'Certified Organic' },
  { id: 'Artisan', label: 'Artisan / Small-Batch Only' },
];

interface PersonalFoodProfileProps {
  onClose?: () => void;
  onPreferencesChanged?: (prefs: AnonymousFoodPreferences) => void;
  compact?: boolean;
}

export const PersonalFoodProfile: React.FC<PersonalFoodProfileProps> = ({
  onClose,
  onPreferencesChanged,
  compact = false,
}) => {
  const [prefs, setPrefs] = useState<AnonymousFoodPreferences>({
    categoryIds: [],
    regionIds: [],
    dietaryPreferences: [],
    excludedAllergens: [],
  });
  const [activeTab, setActiveTab] = useState<'categories' | 'regions' | 'dietary' | 'allergens'>('categories');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loaded = getAnonymousPreferences();
    setPrefs(loaded);
  }, []);

  const toggleCategory = (catId: string) => {
    const current = prefs.categoryIds || [];
    const next = current.includes(catId)
      ? current.filter((c) => c !== catId)
      : [...current, catId];
    updatePrefs({ categoryIds: next });
    trackEvent('preference_selected', { filterName: 'category', filterValue: catId });
  };

  const toggleRegion = (regId: string) => {
    const current = prefs.regionIds || [];
    const next = current.includes(regId)
      ? current.filter((r) => r !== regId)
      : [...current, regId];
    updatePrefs({ regionIds: next });
    trackEvent('preference_selected', { filterName: 'region', filterValue: regId });
  };

  const toggleDietary = (dietId: string) => {
    const current = prefs.dietaryPreferences || [];
    const next = current.includes(dietId)
      ? current.filter((d) => d !== dietId)
      : [...current, dietId];
    updatePrefs({ dietaryPreferences: next });
    trackEvent('preference_selected', { filterName: 'dietary', filterValue: dietId });
  };

  const toggleAllergen = (allergen: string) => {
    const current = prefs.excludedAllergens || [];
    const next = current.includes(allergen)
      ? current.filter((a) => a !== allergen)
      : [...current, allergen];
    updatePrefs({ excludedAllergens: next });
    trackEvent('preference_selected', { filterName: 'excludedAllergen', filterValue: allergen });
  };

  const updatePrefs = (delta: Partial<AnonymousFoodPreferences>) => {
    const updated = { ...prefs, ...delta };
    setPrefs(updated);
    saveAnonymousPreferences(updated);
    if (onPreferencesChanged) onPreferencesChanged(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReset = () => {
    clearAnonymousPreferences();
    const empty = getAnonymousPreferences();
    setPrefs(empty);
    if (onPreferencesChanged) onPreferencesChanged(empty);
    trackEvent('preference_reset');
  };

  const handleSkip = () => {
    trackEvent('preference_skipped');
    if (onClose) onClose();
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden transition-all ${
        compact ? 'p-4' : 'p-6 md:p-8'
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✨</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              My European Food Profile
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Personalize your discovery experience instantly. No account required.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              ✓ Preferences Saved
            </span>
          )}
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            Reset
          </button>
          {onClose && (
            <button
              onClick={handleSkip}
              className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3.5 py-1.5 rounded-xl transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto py-4 scrollbar-none border-b border-gray-100 dark:border-gray-800">
        {[
          { key: 'categories', label: 'Food Categories', icon: '🧀' },
          { key: 'regions', label: 'Regions', icon: '🗺️' },
          { key: 'dietary', label: 'Dietary', icon: '🌱' },
          { key: 'allergens', label: 'Allergen Filters', icon: '⚠️' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FOOD_INTEREST_OPTIONS.map((item) => {
              const selected = (prefs.categoryIds || []).includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleCategory(item.id)}
                  className={`flex items-center space-x-3 p-3.5 rounded-2xl border text-left transition-all ${
                    selected
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <span className="text-xs font-semibold block">{item.name}</span>
                  </div>
                  {selected && <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'regions' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REGION_OPTIONS.map((item) => {
              const selected = (prefs.regionIds || []).includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleRegion(item.id)}
                  className={`flex items-center space-x-3 p-3.5 rounded-2xl border text-left transition-all ${
                    selected
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <span className="text-xs font-semibold block">{item.name}</span>
                  </div>
                  {selected && <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'dietary' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DIETARY_OPTIONS.map((item) => {
              const selected = (prefs.dietaryPreferences || []).includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleDietary(item.id)}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    selected
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 font-semibold'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-xs block">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'allergens' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start space-x-3">
              <span className="text-lg">⚠️</span>
              <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                <strong>Safety Disclaimer:</strong> Allergen exclusions hide matching items from your discovery view. Always inspect the producer's official allergen statement on the physical product before consumption.
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {EU_ALLERGENS_14.map((allergen) => {
                const excluded = (prefs.excludedAllergens || []).includes(allergen);
                return (
                  <button
                    key={allergen}
                    onClick={() => toggleAllergen(allergen)}
                    className={`p-2.5 rounded-xl border text-xs text-left flex items-center justify-between transition-all ${
                      excluded
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-medium'
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <span>{allergen}</span>
                    {excluded ? (
                      <span className="text-red-500 text-xs font-bold">Excluded</span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-xs">+ Exclude</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer summary */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
        <div>
          Active selections:{' '}
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {(prefs.categoryIds || []).length} categories, {(prefs.regionIds || []).length} regions,{' '}
            {(prefs.excludedAllergens || []).length} excluded allergens
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl transition-all shadow-md shadow-blue-500/10"
          >
            Apply to Browsing
          </button>
        )}
      </div>
    </div>
  );
};
