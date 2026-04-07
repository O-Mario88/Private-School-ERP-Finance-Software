/**
 * MAPLE SCHOOL FINANCE ERP
 * Main Application Component
 */

import React, { useEffect, useState } from 'react';
import { useAuthStore, useUIStore, useSyncStore } from './store';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import AccountingPage from './pages/Accounting';
import SchoolPage from './pages/School';
import CollectionsPage from './pages/Collections';
import PayrollPage from './pages/Payroll';
import APPage from './pages/AP';
import AssetsPage from './pages/Assets';
import TreasuryPage from './pages/Treasury';
import BudgetPage from './pages/Budget';
import StudentsPage from './pages/Students';
import BillingPage from './pages/Billing';
import InvoicesPage from './pages/Invoices';
import PaymentsPage from './pages/Payments';
import ReceiptsPage from './pages/Receipts';
import TransportPage from './pages/Transport';
import InventoryPage from './pages/Inventory';
import BankReconPage from './pages/BankRecon';
import ScholarshipsPage from './pages/Scholarships';
import AuditPage from './pages/Audit';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';
import Layout from './components/Layout';
import OfflineIndicator from './components/OfflineIndicator';
import NotificationCenter from './components/NotificationCenter';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isOfflineMode = useAuthStore((state) => state.isOfflineMode);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check for stored session on app startup
    const initializeApp = async () => {
      try {
        // This would typically load from local storage or check session validity
        // For now, just complete initialization
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            MAPLE School Finance ERP
          </h1>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {isOfflineMode && <OfflineIndicator />}
      {isAuthenticated ? (
        <Layout>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/accounting/*" element={<AccountingPage />} />
            <Route path="/school/*" element={<SchoolPage />} />
            <Route path="/collections/*" element={<CollectionsPage />} />
            <Route path="/payroll/*" element={<PayrollPage />} />
            <Route path="/ap/*" element={<APPage />} />
            <Route path="/assets/*" element={<AssetsPage />} />
            <Route path="/treasury/*" element={<TreasuryPage />} />
            <Route path="/budget/*" element={<BudgetPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/receipts" element={<ReceiptsPage />} />
            <Route path="/transport" element={<TransportPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/bankrecon" element={<BankReconPage />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
      <NotificationCenter />
    </Router>
  );
}

export default App;
