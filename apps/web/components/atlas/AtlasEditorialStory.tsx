import React from 'react';
import { getAssetPath } from '../../lib/asset-path';

interface AtlasEditorialStoryProps {
  title: string;
  subtitle: string;
  regionTag: string;
  description: string;
  imageSrc: string;
  ctaText: string;
  onCtaClick: () => void;
}

export const AtlasEditorialStory: React.FC<AtlasEditorialStoryProps> = ({
  title,
  subtitle,
  regionTag,
  description,
  imageSrc,
  ctaText,
  onCtaClick,
}) => {
  const resolvedImageSrc = getAssetPath(imageSrc);

  return (
    <div className="w-full bg-[#18212A] text-[#F6F0E5] rounded-3xl overflow-hidden shadow-2xl border border-[#D29A38]/30 font-sans my-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
        {/* Left Side: Editorial Content */}
        <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase bg-[#D29A38]/20 text-[#D29A38] border border-[#D29A38]/30 tracking-widest inline-block">
              {regionTag}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-base font-semibold text-[#D29A38]">
              {subtitle}
            </p>
            <p className="text-sm text-[#F6F0E5]/80 leading-relaxed max-w-xl">
              {description}
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={onCtaClick}
              className="px-6 py-3.5 bg-[#D29A38] hover:bg-[#b8832a] text-[#201B17] font-black text-sm rounded-xl transition shadow-lg inline-flex items-center gap-2"
            >
              {ctaText} →
            </button>
          </div>
        </div>

        {/* Right Side: Full Bleed Photography */}
        <div className="lg:col-span-6 min-h-[340px] relative bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedImageSrc}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
