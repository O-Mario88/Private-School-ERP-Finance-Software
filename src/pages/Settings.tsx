/**
 * Settings Page
 * System configuration, user preferences, school settings
 */

import React from 'react';

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage system configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Menu */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <div className="card-body space-y-2">
              <SettingMenuItem label="School Information" active />
              <SettingMenuItem label="Users & Roles" />
              <SettingMenuItem label="Chart of Accounts" />
              <SettingMenuItem label="Fee Rules" />
              <SettingMenuItem label="Approval Rules" />
              <SettingMenuItem label="Preferences" />
              <SettingMenuItem label="Backup & Restore" />
              <SettingMenuItem label="API Keys" />
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header border-b border-gray-200">
              <h3 className="text-lg font-semibold">School Information</h3>
            </div>
            <div className="card-body space-y-6">
              <div>
                <label className="form-label">School Name</label>
                <input
                  type="text"
                  defaultValue="Maple Private School"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">School Registration Number</label>
                <input
                  type="text"
                  defaultValue="REG-2020-001"
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Currency</label>
                  <select className="form-input">
                    <option>KES (Kenyan Shilling)</option>
                    <option>USD (US Dollar)</option>
                    <option>NGN (Nigerian Naira)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Timezone</label>
                  <select className="form-input">
                    <option>Africa/Nairobi</option>
                    <option>Africa/Lagos</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  defaultValue="bursar@maplesch.com"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  defaultValue="+254 701 234 567"
                  className="form-input"
                />
              </div>

              <div>
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SettingMenuItemProps {
  label: string;
  active?: boolean;
}

function SettingMenuItem({ label, active = false }: SettingMenuItemProps) {
  return (
    <button
      className={`w-full text-left px-4 py-3 rounded-md transition-colors text-sm font-medium ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
}
