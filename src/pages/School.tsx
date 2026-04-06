/**
 * School Module Page
 * Student management, invoicing, billing
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';

export default function SchoolPage() {
  return (
    <Routes>
      <Route path="/" element={<SchoolHome />} />
      <Route path="/students" element={<Students />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/families" element={<Families />} />
    </Routes>
  );
}

function SchoolHome() {
  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <h1 className="page-title">School Finance</h1>
        <p className="page-subtitle">Manage students, invoicing, and school-specific finances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModuleCard
          title="Students"
          description="Manage student records and financial profiles"
          icon="👨‍🎓"
          link="/school/students"
        />
        <ModuleCard
          title="Invoices"
          description="Create and manage student invoices"
          icon="📄"
          link="/school/invoices"
        />
        <ModuleCard
          title="Families"
          description="View family accounts and household balances"
          icon="👨‍👩‍👧‍👦"
          link="/school/families"
        />
      </div>
    </div>
  );
}

function Students() {
  return <PagePlaceholder title="Students" />;
}

function Invoices() {
  return <PagePlaceholder title="Invoices" />;
}

function Families() {
  return <PagePlaceholder title="Families" />;
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
