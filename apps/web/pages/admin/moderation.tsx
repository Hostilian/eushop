import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface ModerationReport {
  id: string;
  itemType: 'PRODUCT' | 'SELLER' | 'REVIEW';
  targetId: string;
  targetTitle: string;
  reporterEmail: string;
  reason: 'ILLEGAL_CONTENT' | 'NON_COMPLIANT_ALLERGENS' | 'FAKE_SELLER_INFO' | 'UNSAFE_FOOD';
  status: 'PENDING' | 'INVESTIGATING' | 'REMOVED' | 'REJECTED';
  timestamp: string;
}

const INITIAL_REPORTS: ModerationReport[] = [
  {
    id: 'REP-101',
    itemType: 'PRODUCT',
    targetId: 'FOOD-881',
    targetTitle: 'Artisanal Alpine Raw Milk Cheese 500g',
    reporterEmail: 'compliance-auditor@eushop.eu',
    reason: 'NON_COMPLIANT_ALLERGENS',
    status: 'PENDING',
    timestamp: '2026-07-24T09:15:00Z',
  },
  {
    id: 'REP-102',
    itemType: 'SELLER',
    targetId: 'SELLER-904',
    targetTitle: 'Distribuzioni Alimentari Milano S.r.l.',
    reporterEmail: 'buyer-notice@dsa.eu',
    reason: 'FAKE_SELLER_INFO',
    status: 'INVESTIGATING',
    timestamp: '2026-07-23T14:30:00Z',
  },
];

export default function ModerationDashboardPage() {
  const [reports, setReports] = useState<ModerationReport[]>(INITIAL_REPORTS);

  const handleStatusChange = (id: string, newStatus: ModerationReport['status']) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <>
      <Head>
        <title>DSA Notice & Action Moderation Dashboard — EUshop Admin</title>
      </Head>

      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-800">
            <div>
              <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-1">
                Regulation (EU) 2022/2065 (DSA) Articles 16 & 20
              </div>
              <h1 className="text-3xl font-extrabold text-white">DSA Notice & Action Moderation</h1>
            </div>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-lg text-neutral-200"
            >
              ← Back to Admin
            </Link>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-6 border border-neutral-800 bg-neutral-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-400 text-black">
                      {report.reason}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">{report.id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{report.targetTitle}</h3>
                  <p className="text-xs text-neutral-400">
                    Reporter: <span className="text-neutral-200">{report.reporterEmail}</span> • Filed:{' '}
                    {new Date(report.timestamp).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      report.status === 'PENDING'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : report.status === 'REMOVED'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {report.status}
                  </span>

                  {report.status !== 'REMOVED' && (
                    <button
                      onClick={() => handleStatusChange(report.id, 'REMOVED')}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Takedown & Delist
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
