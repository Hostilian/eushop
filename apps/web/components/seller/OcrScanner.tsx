import React, { useState } from 'react';
import { EU_ALLERGENS_14, type EUAllergen } from '@eushop/compliance';

interface OcrScannerProps {
  onScanComplete?: (ingredients: string, allergens: string[]) => void;
}

const DEMO_SAMPLE_LABELS = [
  {
    title: 'German Bakery Cookie Label',
    text: 'Zutaten: Weizenmehl, Butter (Milch), Zucker, Frischeier, Haselnüsse, Sojalecithin, Speisesalz.',
    detected: ['Cereals containing gluten', 'Milk', 'Eggs', 'Nuts', 'Soybeans'],
  },
  {
    title: 'French Specialty Cheese Label',
    text: 'Ingrédients: Lait de brebis cru, sel, présure, ferment lactique. Fabriqué dans un atelier utilisant des fruits à coque.',
    detected: ['Milk', 'Nuts'],
  },
  {
    title: 'Italian Pesto Label',
    text: 'Ingredienti: Basilico Genovese DOP (35%), olio extravergine di oliva, pinoli, Formaggio Parmigiano Reggiano DOP (latte), anacardi, aglio, sale.',
    detected: ['Milk', 'Nuts'],
  },
];

export function OcrScanner({ onScanComplete }: OcrScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [rawText, setRawText] = useState('');
  const [detectedAllergens, setDetectedAllergens] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<number | null>(null);

  const handleRunOcr = (sampleText: string, sampleAllergens: string[]) => {
    setScanning(true);
    setConfidence(null);

    setTimeout(() => {
      setRawText(sampleText);
      setDetectedAllergens(sampleAllergens);
      setConfidence(98.4);
      setScanning(false);
      if (onScanComplete) {
        onScanComplete(sampleText, sampleAllergens);
      }
    }, 800);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6" data-testid="ocr-scanner">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-lg">📷</span>
          <div>
            <h3 className="text-base font-bold text-white font-display">Vision AI Allergen & Ingredient Scanner</h3>
            <p className="text-xs text-slate-400">EU Reg. 1169/2011 Annex II automated OCR detection pipeline</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
          AI Vision Ready
        </span>
      </div>

      {/* Preset Camera Scan Demos */}
      <div>
        <p className="text-xs font-semibold text-slate-300 mb-2.5">Select a packaging photo to simulate camera OCR scan:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_SAMPLE_LABELS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleRunOcr(sample.text, sample.detected)}
              disabled={scanning}
              className="text-left p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-xl transition text-xs space-y-1 group disabled:opacity-50"
            >
              <div className="font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                <span>{sample.title}</span>
                <span>➔</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{sample.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Scanning Indicator */}
      {scanning && (
        <div className="p-6 bg-slate-950 rounded-xl border border-emerald-500/30 flex items-center justify-center gap-3 text-emerald-400 text-xs font-bold animate-pulse">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Processing food packaging OCR & matching 14 EU Annex II allergens...</span>
        </div>
      )}

      {/* Scan Results */}
      {!scanning && rawText && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-300">Extracted Ingredient Text</span>
            {confidence && (
              <span className="text-[11px] text-emerald-400 font-semibold">
                OCR Accuracy Confidence: {confidence}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg font-mono leading-relaxed">
            "{rawText}"
          </p>

          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">
              Detected EU Reg. 1169/2011 Annex II Allergens ({detectedAllergens.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {detectedAllergens.length > 0 ? (
                detectedAllergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="px-2.5 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-lg flex items-center gap-1.5"
                  >
                    <span>⚠️</span>
                    <span>{allergen}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No Annex II allergens detected in text.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
