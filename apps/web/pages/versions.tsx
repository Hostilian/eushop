import { GetStaticProps } from 'next';
import Link from 'next/link';
import {
  APPLICATION_VIEWS,
  CURRENT_APPLICATION,
  FLAGSHIP_RELEASES,
  HISTORICAL_SNAPSHOTS,
  VERSION_SELECTOR_OPTIONS,
  CatalogueEntryKind,
  SnapshotLineage
} from '@/data/version-catalog';

export const metadata = {
  title: 'Eushop Version Catalogue',
  description: 'Explore the historical versions and current views of the Eushop application',
};



export default function VersionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Eshop Version Catalogue
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the evolution of Eshop through our preserved versions.
            Each entry in this catalogue represents a verifiable artifact from
            the repository's history.
          </p>
        </header>

        {/* Current Application Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Current Application
          </h2>
          <div className="bg-white rounded-lg shadow-sm divide-y">
            <div className="px-6 py-4 flex items-center justify-between sm:grid sm:grid-cols-3 sm:text-center sm:gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {CURRENT_APPLICATION.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 truncate">
                  {CURRENT_APPLICATION.description}
                </p>
              </div>
              <div>
                <span className="px-3 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                  {CURRENT_APPLICATION.badge}
                </span>
              </div>
              <div className="text-sm">
                <Link
                  href={CURRENT_APPLICATION.path}
                  className="text-indigo-600 hover:text-indigo-500 hover:underline"
                >
                  View Application →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Flagship Major Releases Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>🚀</span> Flagship Major Releases
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            Major milestone releases showcasing PostGIS spatial engines, CodeQL zero-critical security hardening, and YC legal compliance frameworks.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FLAGSHIP_RELEASES.map((release) => (
              <div key={release.key} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 text-xs font-black bg-emerald-600 text-white rounded-full uppercase tracking-wider">
                      {release.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {release.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {release.description}
                  </p>
                </div>
                <div>
                  <Link
                    href={release.path}
                    className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                  >
                    Launch Interactive View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Application Views Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>📱</span> Application Views
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            Role-based perspectives on the live application for buyers, sellers, and operators.
          </p>
          <div className="space-y-4">
            {APPLICATION_VIEWS.filter(v => v.category !== 'flagship-release').map((view) => (
              <div key={view.key} className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 flex items-center justify-between sm:grid sm:grid-cols-3 sm:text-center sm:gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {view.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 truncate">
                      {view.description}
                    </p>
                  </div>
                  <div>
                    <span className="px-3 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      {view.badge}
                    </span>
                  </div>
                  <div className="text-sm">
                    <Link
                      href={view.path}
                      className="text-indigo-600 font-semibold hover:text-indigo-500 hover:underline"
                    >
                      Open Route →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historical Snapshots Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Historical Snapshots
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            These are preserved static snapshots of the application at specific
            points in history. Each snapshot is an independent artifact that
            can be visited directly.
          </p>

          {/* Group by lineage */}
          <div className="space-y-8">
            {/* Recovered Prototype */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Recovered Prototype
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                The earliest recovered version of the Eshop prototype, showing
                the core application concept before thematic variations.
              </p>
              <div className="space-y-3">
                {HISTORICAL_SNAPSHOTS
                  .filter((s) => s.lineage === 'recovered-prototype')
                  .map((snapshot) => (
                    <div key={snapshot.key} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {snapshot.badge}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{snapshot.name}</h4>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {snapshot.description}
                          </p>
                          <div className="mt-2 flex items-center text-sm">
                            <span className="mr-4">
                              Introduced: {snapshot.introducedIn?.toUpperCase()}
                            </span>
                            <span>
                              Last integrated: {snapshot.lastIntegratedIn?.toUpperCase()}
                            </span>
                          </div>
                          <Link
                            href={snapshot.path}
                            className="mt-2 inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            Visit Snapshot →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Core Theme Variants */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Core Theme Variants
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Visual theme variations applied to the shared core prototype,
                demonstrating different color schemes and styling approaches.
              </p>
              <div className="space-y-3">
                {HISTORICAL_SNAPSHOTS
                  .filter((s) => s.lineage === 'core-theme-variant')
                  .map((snapshot) => (
                    <div key={snapshot.key} className="border-l-4 border-purple-500 pl-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <span className="px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            {snapshot.badge}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{snapshot.name}</h4>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {snapshot.description}
                          </p>
                          <div className="mt-2 flex items-center text-sm">
                            <span className="mr-4">
                              Introduced: {snapshot.introducedIn?.toUpperCase()}
                            </span>
                            <span>
                              Last integrated: {snapshot.lastIntegratedIn?.toUpperCase()}
                            </span>
                          </div>
                          <Link
                            href={snapshot.path}
                            className="mt-2 inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            Visit Snapshot →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Marketplace Concepts */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Marketplace Concepts
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Independent marketplace concepts that explored different
                directions for the Eshop platform's evolution.
              </p>
              <div className="space-y-3">
                {HISTORICAL_SNAPSHOTS
                  .filter((s) => s.lineage === 'marketplace-concept')
                  .map((snapshot) => (
                    <div key={snapshot.key} className="border-l-4 border-rose-500 pl-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <span className="px-2.5 py-0.5 text-xs font-medium bg-rose-100 text-rose-800 rounded-full">
                            {snapshot.badge}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{snapshot.name}</h4>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {snapshot.description}
                          </p>
                          <div className="mt-2 flex items-center text-sm">
                            <span className="mr-4">
                              Introduced: {snapshot.introducedIn?.toUpperCase()}
                            </span>
                            <span>
                              Last integrated: {snapshot.lastIntegratedIn?.toUpperCase()}
                            </span>
                          </div>
                          <Link
                            href={snapshot.path}
                            className="mt-2 inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            Visit Snapshot →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Ground-Up & Enterprise Releases */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ground-Up & Enterprise Releases
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Full standalone enterprise marketplace releases, spatial corridor logistics engines, and production-grade ground-up builds.
              </p>
              <div className="space-y-3">
                {HISTORICAL_SNAPSHOTS
                  .filter((s) => s.lineage === 'enterprise-snapshot')
                  .map((snapshot) => (
                    <div key={snapshot.key} className="border-l-4 border-emerald-600 pl-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <span className="px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                            {snapshot.badge}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{snapshot.name}</h4>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {snapshot.description}
                          </p>
                          <div className="mt-2 flex items-center text-sm">
                            <span className="mr-4">
                              Introduced: {snapshot.introducedIn?.toUpperCase()}
                            </span>
                            <span>
                              Last integrated: {snapshot.lastIntegratedIn?.toUpperCase()}
                            </span>
                          </div>
                          <Link
                            href={snapshot.path}
                            className="mt-2 inline-flex items-center px-3 py-1.5 text-sm font-medium text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-50 hover:text-emerald-800"
                          >
                            Visit Snapshot →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Important Notes
            </h3>
            <p className="text-sm text-gray-600">
              <strong>Snapshot Identification:</strong> The V-labels in this catalogue
              are identifiers for preserved artifacts, not semantic versions or
              signed releases.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              <strong>Interpretation Limits:</strong> Static snapshots contain
              demonstration data and historical claims that have not been
              re-certified during recovery. This recovery implements preservation
              and truthful navigation structure. It does not certify GDPR, DSA,
              DAC7, VAT, food-law, accessibility, security, or production readiness.
              Qualified legal, tax, security, and accessibility review remains
              required before launch.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}