export type CatalogueEntryKind =
  | 'current-application'
  | 'application-view'
  | 'historical-snapshot';

export type SnapshotLineage =
  | 'recovered-prototype'
  | 'core-theme-variant'
  | 'marketplace-concept'
  | 'enterprise-snapshot';

export type CatalogueEntryCategory =
  | 'flagship-release'
  | 'application-view'
  | 'recovered-prototype'
  | 'core-theme-variant'
  | 'marketplace-concept'
  | 'enterprise-snapshot';

export interface VersionCatalogueEntry {
  key: string;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  path: string;
  kind: CatalogueEntryKind;
  category?: CatalogueEntryCategory;
  accentClass: string;
  lineage?: SnapshotLineage;
  introducedIn?: string;
  lastIntegratedIn?: string;
}

export const CURRENT_APPLICATION: VersionCatalogueEntry = {
  key: 'current',
  name: 'Current integrated application',
  shortName: 'Current',
  badge: 'CURRENT',
  description:
    'The active Next.js application. Feature availability depends on the configured backend and runtime services.',
  path: '/',
  kind: 'current-application',
  category: 'application-view',
  accentClass:
    'from-emerald-700 to-amber-600 border-amber-300 text-emerald-800 dark:text-emerald-300',
};

export const FLAGSHIP_RELEASES: readonly VersionCatalogueEntry[] = [
  {
    key: 'v177',
    name: 'V177 - Ground-Up Re-Founded Pan-European Marketplace',
    shortName: 'V177',
    badge: 'V177 GROUND-UP',
    description:
      'Ground-up pan-European specialty food marketplace with decision truth records, baseline audits, and legal claims ledgers.',
    path: '/v177/',
    kind: 'application-view',
    category: 'flagship-release',
    accentClass:
      'from-fuchsia-700 to-purple-900 border-fuchsia-400 text-fuchsia-800 dark:text-fuchsia-200 font-bold',
  },
  {
    key: 'v132',
    name: 'V132 - Enterprise EU Logistics & Tax Gateway',
    shortName: 'V132',
    badge: 'V132 LOGISTICS',
    description:
      'Real-time cross-border customs clearance, cold-chain spatial corridor matching, and automated OSS threshold calculations.',
    path: '/v132/',
    kind: 'application-view',
    category: 'flagship-release',
    accentClass:
      'from-purple-600 to-indigo-800 border-purple-300 text-purple-800 dark:text-purple-200 font-bold',
  },
  {
    key: 'v122',
    name: 'V122 - Enterprise Multi-Million Dollar Platform',
    shortName: 'V122',
    badge: 'V122 ENTERPRISE',
    description:
      'Enterprise pan-European specialty food marketplace with interactive allergen safety and DSA Art. 30 verification.',
    path: '/v122/',
    kind: 'application-view',
    category: 'flagship-release',
    accentClass:
      'from-rose-600 to-rose-900 border-rose-400 text-rose-800 dark:text-rose-200 font-bold',
  },
  {
    key: 'v121',
    name: 'V121 - High-Converting Standalone UI',
    shortName: 'V121',
    badge: 'V121 UI',
    description:
      'High-converting standalone visual identity demo with curated PDO/PGI catalog items.',
    path: '/v121/',
    kind: 'application-view',
    category: 'flagship-release',
    accentClass:
      'from-sky-500 to-blue-700 border-sky-300 text-sky-700 dark:text-sky-200 font-bold',
  },
  {
    key: 'v77',
    name: 'V77 - European Food Atlas & Editorial Marketplace',
    shortName: 'V77',
    badge: 'V77 FLAGSHIP',
    description:
      'Version 77 flagship release: Contemporary European food atlas, origin-led discovery canvas, transparent seller trust shield, and single market commerce.',
    path: '/atlas',
    kind: 'application-view',
    category: 'flagship-release',
    accentClass:
      'from-cobalt-600 to-saffron-500 border-cobalt-400 text-cobalt-800 dark:text-cobalt-200 font-bold',
  },
  {
    key: 'v66',
    name: 'V66 - Evolutionary Scale & PostGIS Spatial Engine',
    shortName: 'V66',
    badge: 'V66 RELEASE',
    description:
      'Version 66 flagship release: PostGIS spatial corridor matching, OpenTelemetry distributed tracing, k6 load testing, and property-based financial testing.',
    path: '/?v=v66',
    kind: 'application-view',
    category: 'flagship-release',
    accentClass:
      'from-emerald-600 to-indigo-600 border-indigo-400 text-emerald-800 dark:text-emerald-200 font-bold',
  },
  {
    key: 'v55',
    name: 'V55 - Security Emergency & CodeQL Zero-Critical',
    shortName: 'V55',
    badge: 'V55 RELEASE',
    description:
      'Version 55 safety & compliance milestone: Zero-critical CodeQL enforcement, OWASP taint sink remediation, and DAC7 automated tax reporting.',
    path: '/?v=v55',
    kind: 'application-view',
    category: 'flagship-release',
    accentClass:
      'from-blue-600 to-emerald-500 border-blue-400 text-blue-800 dark:text-blue-200 font-bold',
  },
  {
    key: 'v44',
    name: 'V44 - YC Master Legal Compliance Release',
    shortName: 'V44',
    badge: 'V44 RELEASE',
    description:
      'Master legal compliance & YC optimization release featuring EU Annex II allergens, DSA Art. 30 seller disclosures, GPSR, and 100% compliance test coverage.',
    path: '/?v=v44',
    kind: 'application-view',
    category: 'flagship-release',
    accentClass:
      'from-amber-500 to-emerald-600 border-amber-400 text-amber-800 dark:text-amber-200 font-bold',
  },
];

export const APPLICATION_VIEWS: readonly VersionCatalogueEntry[] = [
  ...FLAGSHIP_RELEASES,
  {
    key: 'buyer-view',
    name: 'Buyer marketplace view',
    shortName: 'Buyer',
    badge: 'VIEW',
    description:
      'The current storefront route for browsing demo or API-backed catalogue data.',
    path: '/',
    kind: 'application-view',
    category: 'application-view',
    accentClass:
      'from-emerald-500 to-green-600 border-green-200 text-green-700',
  },
  {
    key: 'seller-view',
    name: 'Seller onboarding view',
    shortName: 'Seller',
    badge: 'VIEW',
    description:
      'The current seller onboarding route. Legal and tax outcomes still require qualified human review.',
    path: '/become-seller',
    kind: 'application-view',
    category: 'application-view',
    accentClass:
      'from-amber-500 to-orange-600 border-orange-200 text-orange-700',
  },
  {
    key: 'operator-view',
    name: 'Operator dashboard view',
    shortName: 'Operator',
    badge: 'VIEW',
    description:
      'The current administrative demonstration route; authorization must be validated with the backend.',
    path: '/admin/dashboard',
    kind: 'application-view',
    category: 'application-view',
    accentClass:
      'from-purple-500 to-indigo-600 border-indigo-200 text-indigo-700',
  },
  {
    key: 'v1',
    name: 'V1 - Pitch & ARR Calculator',
    shortName: 'V1 Pitch',
    badge: 'INVESTOR',
    description: 'Investor landing page with TAM story and interactive ARR projector.',
    path: '/?v=v1',
    kind: 'application-view',
    category: 'application-view',
    accentClass: 'from-rose-500 to-pink-600 border-rose-200 text-rose-700',
  },
  {
    key: 'v2',
    name: 'V2 - Buyer Marketplace',
    shortName: 'V2 Buyer',
    badge: 'BUYER',
    description: 'Artisanal food explorer with search, product detail pages, and cart.',
    path: '/?v=v2',
    kind: 'application-view',
    category: 'application-view',
    accentClass: 'from-emerald-500 to-green-600 border-green-200 text-green-700',
  },
  {
    key: 'v3-view',
    name: 'V3 - Seller Compliance Hub',
    shortName: 'V3 Seller',
    badge: 'SELLER',
    description: 'KYBC onboarding, DAC7 tax self-certification, and DSA Art. 30 manager.',
    path: '/become-seller/?v=v3',
    kind: 'application-view',
    category: 'application-view',
    accentClass: 'from-amber-500 to-orange-600 border-orange-200 text-orange-700',
  },
  {
    key: 'v4-view',
    name: 'V4 - Admin Console',
    shortName: 'V4 Admin',
    badge: 'OPERATOR',
    description: 'Moderation desk to approve seller applications and audit tax details.',
    path: '/admin/dashboard/?v=v4',
    kind: 'application-view',
    category: 'application-view',
    accentClass: 'from-purple-500 to-indigo-600 border-indigo-200 text-indigo-700',
  },
  {
    key: 'v5-view',
    name: 'V5 - Developer Portal & Docs',
    shortName: 'V5 Docs',
    badge: 'DEVELOPER',
    description: 'Interactive documentation viewer: system status, development guide, and API reference.',
    path: '/docs/?v=v5',
    kind: 'application-view',
    category: 'application-view',
    accentClass: 'from-blue-500 to-cyan-600 border-blue-200 text-blue-700',
  },
];

export const HISTORICAL_SNAPSHOTS: readonly VersionCatalogueEntry[] = [
  {
    key: 'v3',
    name: 'V3 - Recovered core prototype',
    shortName: 'V3',
    badge: 'RECOVERED',
    description:
      'Recovered static prototype in the Cursor/Antigravity lineage, with later navigation repairs.',
    path: '/v3/',
    kind: 'historical-snapshot',
    lineage: 'recovered-prototype',
    introducedIn: 'd08148c9',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-slate-500 to-slate-700 border-slate-300 text-slate-700 dark:text-slate-300',
  },
  {
    key: 'v6',
    name: 'V6 - Base static prototype',
    shortName: 'V6',
    badge: 'BASE',
    description:
      'Base static catalogue, listing, and request prototype used by the subsequent theme variants.',
    path: '/v6/',
    kind: 'historical-snapshot',
    lineage: 'recovered-prototype',
    introducedIn: '4d4b5c27',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-gray-500 to-slate-600 border-slate-200 text-slate-700 dark:text-slate-300',
  },
  {
    key: 'v7',
    name: 'V7 - Emerald theme',
    shortName: 'V7',
    badge: 'THEME',
    description: 'Emerald visual variant of the shared static prototype.',
    path: '/v7/',
    kind: 'historical-snapshot',
    lineage: 'core-theme-variant',
    introducedIn: '4d4b5c27',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-teal-500 to-emerald-600 border-teal-200 text-teal-700',
  },
  {
    key: 'v8',
    name: 'V8 - Midnight theme',
    shortName: 'V8',
    badge: 'THEME',
    description: 'Dark midnight visual variant of the shared static prototype.',
    path: '/v8/',
    kind: 'historical-snapshot',
    lineage: 'core-theme-variant',
    introducedIn: '4d4b5c27',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-slate-700 to-slate-900 border-slate-600 text-slate-300',
  },
  {
    key: 'v9',
    name: 'V9 - Rose theme',
    shortName: 'V9',
    badge: 'THEME',
    description: 'Rose visual variant of the shared static prototype.',
    path: '/v9/',
    kind: 'historical-snapshot',
    lineage: 'core-theme-variant',
    introducedIn: '4d4b5c27',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-rose-400 to-rose-600 border-rose-300 text-rose-800',
  },
  {
    key: 'v10',
    name: 'V10 - Platinum theme',
    shortName: 'V10',
    badge: 'THEME',
    description: 'Platinum visual variant of the shared static prototype.',
    path: '/v10/',
    kind: 'historical-snapshot',
    lineage: 'core-theme-variant',
    introducedIn: 'd08148c9',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-slate-300 to-slate-500 border-slate-200 text-slate-700',
  },
  {
    key: 'v11',
    name: 'V11 - Forest theme',
    shortName: 'V11',
    badge: 'THEME',
    description: 'Forest-green visual variant of the shared static prototype.',
    path: '/v11/',
    kind: 'historical-snapshot',
    lineage: 'core-theme-variant',
    introducedIn: 'd08148c9',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-emerald-600 to-green-800 border-green-200 text-green-700',
  },
  {
    key: 'v12',
    name: 'V12 - Terracotta theme',
    shortName: 'V12',
    badge: 'THEME',
    description: 'Terracotta visual variant of the shared static prototype.',
    path: '/v12/',
    kind: 'historical-snapshot',
    lineage: 'core-theme-variant',
    introducedIn: 'd08148c9',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-orange-400 to-amber-600 border-orange-200 text-orange-700',
  },
  {
    key: 'v13',
    name: 'V13 - Lavender theme',
    shortName: 'V13',
    badge: 'THEME',
    description: 'Lavender visual variant of the shared static prototype.',
    path: '/v13/',
    kind: 'historical-snapshot',
    lineage: 'core-theme-variant',
    introducedIn: 'd08148c9',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-purple-400 to-indigo-600 border-purple-200 text-purple-700',
  },
  {
    key: 'v14',
    name: 'V14 - White modern theme',
    shortName: 'V14',
    badge: 'THEME',
    description:
      'White modern markup and styling layered over the shared static application logic and data.',
    path: '/v14/',
    kind: 'historical-snapshot',
    lineage: 'core-theme-variant',
    introducedIn: '84fe48fc',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-gray-100 to-gray-300 border-gray-300 text-gray-800',
  },
  {
    key: 'v15',
    name: 'V15 - Azure theme',
    shortName: 'V15',
    badge: 'THEME',
    description:
      'Azure visual variant of the V14 markup, preserved at its actual /v15/ snapshot path.',
    path: '/v15/',
    kind: 'historical-snapshot',
    lineage: 'core-theme-variant',
    introducedIn: '3f44c710',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-sky-400 to-blue-700 border-sky-200 text-sky-800',
  },
  {
    key: 'v16',
    name: 'V16 - Cherry blossom theme',
    shortName: 'V16',
    badge: 'THEME',
    description: 'Cherry-blossom visual variant of the shared static prototype.',
    path: '/v16/',
    kind: 'historical-snapshot',
    lineage: 'core-theme-variant',
    introducedIn: '84fe48fc',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-pink-400 to-pink-600 border-pink-200 text-pink-700',
  },
  {
    key: 'v17',
    name: 'V17 - Royal gold theme',
    shortName: 'V17',
    badge: 'THEME',
    description: 'Gold visual variant of the shared static prototype.',
    path: '/v17/',
    kind: 'historical-snapshot',
    lineage: 'core-theme-variant',
    introducedIn: '84fe48fc',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-amber-400 to-amber-600 border-amber-200 text-amber-800',
  },
  {
    key: 'v18',
    name: 'V18 - Auction marketplace concept',
    shortName: 'V18',
    badge: 'CONCEPT',
    description:
      'Independent auction-oriented static marketplace concept with bids, ratings, and a watchlist.',
    path: '/v18/',
    kind: 'historical-snapshot',
    lineage: 'marketplace-concept',
    introducedIn: '7057bb84',
    lastIntegratedIn: '1c3d86cc',
    accentClass:
      'from-blue-500 to-blue-700 border-blue-200 text-blue-700',
  },
  {
    key: 'v19',
    name: 'V19 - Catalogue marketplace concept',
    shortName: 'V19',
    badge: 'CONCEPT',
    description:
      'Independent catalogue-oriented static marketplace concept with dense navigation and a local cart.',
    path: '/v19/',
    kind: 'historical-snapshot',
    lineage: 'marketplace-concept',
    introducedIn: '7057bb84',
    lastIntegratedIn: '1c3d86cc',
    accentClass:
      'from-amber-500 to-orange-600 border-amber-200 text-amber-800',
  },
  {
    key: 'v121',
    name: 'V121 - High-converting standalone UI',
    shortName: 'V121',
    badge: 'STANDALONE',
    description:
      'High-converting standalone visual identity demo with curated PDO/PGI catalog items.',
    path: '/v121/',
    kind: 'historical-snapshot',
    lineage: 'enterprise-snapshot',
    introducedIn: 'e1210000',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-sky-500 to-blue-700 border-sky-300 text-sky-700',
  },
  {
    key: 'v122',
    name: 'V122 - Enterprise multi-million platform',
    shortName: 'V122',
    badge: 'ENTERPRISE',
    description:
      'Enterprise pan-European specialty food marketplace with interactive allergen safety and DSA Art. 30 verification.',
    path: '/v122/',
    kind: 'historical-snapshot',
    lineage: 'enterprise-snapshot',
    introducedIn: 'e1220000',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-rose-600 to-rose-900 border-rose-400 text-rose-800',
  },
  {
    key: 'v132',
    name: 'V132 - Enterprise EU logistics & tax gateway',
    shortName: 'V132',
    badge: 'LOGISTICS',
    description:
      'Real-time cross-border customs clearance, cold-chain spatial corridor matching, and automated OSS threshold calculations.',
    path: '/v132/',
    kind: 'historical-snapshot',
    lineage: 'enterprise-snapshot',
    introducedIn: 'e1320000',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-purple-600 to-indigo-800 border-purple-300 text-purple-800',
  },
  {
    key: 'v177',
    name: 'V177 - Production-grade ground-up marketplace',
    shortName: 'V177',
    badge: 'GROUND-UP',
    description:
      'Ground-up pan-European specialty food marketplace with decision truth records, baseline audits, and legal claims ledgers.',
    path: '/v177/',
    kind: 'historical-snapshot',
    lineage: 'enterprise-snapshot',
    introducedIn: 'e1770000',
    lastIntegratedIn: '0020e35f',
    accentClass:
      'from-fuchsia-700 to-purple-900 border-fuchsia-400 text-fuchsia-800',
  },
];

export const VERSION_SELECTOR_OPTIONS: readonly VersionCatalogueEntry[] = [
  CURRENT_APPLICATION,
  ...APPLICATION_VIEWS,
  ...HISTORICAL_SNAPSHOTS,
];

export const EXPECTED_HISTORICAL_VERSION_KEYS = [
  'v3',
  'v6',
  'v7',
  'v8',
  'v9',
  'v10',
  'v11',
  'v12',
  'v13',
  'v14',
  'v15',
  'v16',
  'v17',
  'v18',
  'v19',
  'v121',
  'v122',
  'v132',
  'v177',
] as const;
