/**
 * Collections Module Page
 * Payment tracking, aging analysis, collections follow-ups
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';

export default function CollectionsPage() {
  return (
    <Routes>
      <Route path="/" element={<CollectionsHome />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/aging" element={<Aging />} />
      <Route path="/followups" element={<Followups />} />
    </Routes>
  );
}

function CollectionsHome() {
  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <h1 className="page-title">Collections</h1>
        <p className="page-subtitle">Manage payments, track arrears, and collections activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModuleCard
          title="Payments"
          description="Record and allocate student payments"
          icon="💳"
          link="/collections/payments"
        />
        <ModuleCard
          title="Aging Analysis"
          description="View outstanding invoices by age"
          icon="⏰"
          link="/collections/aging"
        />
        <ModuleCard
          title="Follow-ups"
          description="Track collections activities and follow-ups"
          icon="📞"
          link="/collections/followups"
        />
      </div>
    </div>
  );
}

function Payments() {
  return <PagePlaceholder title="Payments" />;
}

function Aging() {
  return <PagePlaceholder title="Aging Analysis" />;
}

function Followups() {
  return <PagePlaceholder title="Follow-ups" />;
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
