/**
 * Accounting Module Page
 * General ledger, trial balance, journal entries
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';

export default function AccountingPage() {
  return (
    <Routes>
      <Route path="/" element={<AccountingHome />} />
      <Route path="/gl" element={<GeneralLedger />} />
      <Route path="/journal" element={<JournalEntries />} />
      <Route path="/trial-balance" element={<TrialBalance />} />
      <Route path="/receipts" element={<Receipts />} />
    </Routes>
  );
}

function AccountingHome() {
  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <h1 className="page-title">Accounting</h1>
        <p className="page-subtitle">Manage general ledger, journal entries, and financial statements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModuleCard
          title="General Ledger"
          description="View and manage general ledger accounts"
          icon="📚"
          link="/accounting/gl"
        />
        <ModuleCard
          title="Journal Entries"
          description="Create and post journal entries"
          icon="📝"
          link="/accounting/journal"
        />
        <ModuleCard
          title="Trial Balance"
          description="View trial balance and financial statements"
          icon="⚖️"
          link="/accounting/trial-balance"
        />
        <ModuleCard
          title="Receipts"
          description="View and reprint payment receipts"
          icon="🧾"
          link="/accounting/receipts"
        />
      </div>
    </div>
  );
}

function GeneralLedger() {
  return <PagePlaceholder title="General Ledger" />;
}

function JournalEntries() {
  return <PagePlaceholder title="Journal Entries" />;
}

function TrialBalance() {
  return <PagePlaceholder title="Trial Balance" />;
}

function Receipts() {
  return <PagePlaceholder title="Receipts" />;
}

interface ModuleCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
}

function ModuleCard({ title, description, icon, link }: ModuleCardProps) {
  return (
    <a
      href={link}
      className="card hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="card-body">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm mt-2">{description}</p>
        <div className="mt-4">
          <span className="text-blue-600 text-sm font-medium">Go to module →</span>
        </div>
      </div>
    </a>
  );
}

function PagePlaceholder({ title }: { title: string }) {
  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="card">
        <div className="card-body h-64 flex items-center justify-center text-gray-400">
          <p>{title} features coming soon...</p>
        </div>
      </div>
    </div>
  );
}
