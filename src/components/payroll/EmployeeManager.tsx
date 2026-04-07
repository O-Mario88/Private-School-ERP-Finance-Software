import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { Employee, EmployeeStatus, SalaryStructure } from '../../types';

interface EmployeeDisplay extends Employee {
  salaryStructureName?: string;
  grossSalary?: number;
}

const MOCK_STRUCTURES: SalaryStructure[] = [
  { id: 'ss_1', name: 'Grade A - Senior Management', gradeLevel: 'A', basicSalary: 85000, housingAllowance: 15000, transportAllowance: 10000, medicalAllowance: 5000, otherAllowances: 5000, grossSalary: 120000, effectiveDate: '2026-01-01', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'ss_2', name: 'Grade B - Senior Teacher', gradeLevel: 'B', basicSalary: 65000, housingAllowance: 10000, transportAllowance: 8000, medicalAllowance: 4000, otherAllowances: 3000, grossSalary: 90000, effectiveDate: '2026-01-01', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'ss_3', name: 'Grade C - Teacher', gradeLevel: 'C', basicSalary: 55000, housingAllowance: 8000, transportAllowance: 5000, medicalAllowance: 4000, otherAllowances: 3000, grossSalary: 75000, effectiveDate: '2026-01-01', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'ss_4', name: 'Grade D - Support Staff', gradeLevel: 'D', basicSalary: 35000, housingAllowance: 5000, transportAllowance: 3000, medicalAllowance: 2000, otherAllowances: 0, grossSalary: 45000, effectiveDate: '2026-01-01', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
];

const MOCK_EMPLOYEES: EmployeeDisplay[] = [
  { id: 'emp_1', employeeNumber: 'EMP-001', firstName: 'James', lastName: 'Ochieng', department: 'Administration', position: 'Deputy Principal', hireDate: '2020-01-15', status: EmployeeStatus.ACTIVE, salaryStructureId: 'ss_1', salaryStructureName: 'Grade A', grossSalary: 120000, createdBy: 'usr_1', createdAt: '2020-01-15' },
  { id: 'emp_2', employeeNumber: 'EMP-002', firstName: 'Mary', lastName: 'Wanjiku', department: 'Teaching', position: 'HOD Science', hireDate: '2019-05-10', status: EmployeeStatus.ACTIVE, salaryStructureId: 'ss_2', salaryStructureName: 'Grade B', grossSalary: 90000, createdBy: 'usr_1', createdAt: '2019-05-10' },
  { id: 'emp_3', employeeNumber: 'EMP-003', firstName: 'Peter', lastName: 'Kamau', department: 'Teaching', position: 'Mathematics Teacher', hireDate: '2021-09-01', status: EmployeeStatus.ACTIVE, salaryStructureId: 'ss_3', salaryStructureName: 'Grade C', grossSalary: 75000, createdBy: 'usr_1', createdAt: '2021-09-01' },
  { id: 'emp_4', employeeNumber: 'EMP-004', firstName: 'Grace', lastName: 'Akinyi', department: 'Support', position: 'Office Assistant', hireDate: '2022-03-01', status: EmployeeStatus.ACTIVE, salaryStructureId: 'ss_4', salaryStructureName: 'Grade D', grossSalary: 45000, createdBy: 'usr_1', createdAt: '2022-03-01' },
  { id: 'emp_5', employeeNumber: 'EMP-005', firstName: 'David', lastName: 'Otieno', department: 'Teaching', position: 'English Teacher', hireDate: '2023-01-10', status: EmployeeStatus.ON_LEAVE, salaryStructureId: 'ss_3', salaryStructureName: 'Grade C', grossSalary: 75000, createdBy: 'usr_1', createdAt: '2023-01-10' },
];

export function EmployeeManager() {
  const addNotification = useUIStore((s) => s.addNotification);
  const [employees, setEmployees] = useState<EmployeeDisplay[]>(MOCK_EMPLOYEES);
  const [tab, setTab] = useState<'staff' | 'structures'>('staff');
  const [showForm, setShowForm] = useState(false);
  const [filterDept, setFilterDept] = useState('all');
  const [form, setForm] = useState({ firstName: '', lastName: '', department: 'Teaching', position: '', hireDate: '', salaryStructureId: '', employeeNumber: '' });

  const departments = [...new Set(employees.map(e => e.department))];
  const filtered = filterDept === 'all' ? employees : employees.filter(e => e.department === filterDept);

  const handleAdd = () => {
    if (!form.firstName || !form.lastName || !form.position || !form.hireDate || !form.salaryStructureId) {
      addNotification('Fill all required fields', 'error'); return;
    }
    const structure = MOCK_STRUCTURES.find(s => s.id === form.salaryStructureId);
    const emp: EmployeeDisplay = {
      id: `emp_${Date.now()}`, employeeNumber: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
      firstName: form.firstName, lastName: form.lastName, department: form.department,
      position: form.position, hireDate: form.hireDate, status: EmployeeStatus.ACTIVE,
      salaryStructureId: form.salaryStructureId, salaryStructureName: structure?.name,
      grossSalary: structure?.grossSalary, createdBy: 'usr_1', createdAt: new Date().toISOString(),
    };
    setEmployees([...employees, emp]);
    setShowForm(false);
    setForm({ firstName: '', lastName: '', department: 'Teaching', position: '', hireDate: '', salaryStructureId: '', employeeNumber: '' });
    addNotification(`Employee ${emp.firstName} ${emp.lastName} added`, 'success');
  };

  const statusBadge: Record<EmployeeStatus, string> = {
    [EmployeeStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [EmployeeStatus.ON_LEAVE]: 'bg-yellow-100 text-yellow-800',
    [EmployeeStatus.TERMINATED]: 'bg-red-100 text-red-800',
    [EmployeeStatus.SUSPENDED]: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-gray-600">Staff records, salary structures, and deductions</p></div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Add Employee</button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {(['staff', 'structures'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'staff' ? 'Staff Directory' : 'Salary Structures'}
          </button>
        ))}
      </div>

      {tab === 'staff' && (
        <>
          {showForm && (
            <div className="card"><div className="card-body space-y-4">
              <h3 className="text-lg font-semibold">New Employee</h3>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="form-label">First Name *</label>
                  <input className="form-input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
                <div><label className="form-label">Last Name *</label>
                  <input className="form-input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
                <div><label className="form-label">Department</label>
                  <select className="form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    <option>Administration</option><option>Teaching</option><option>Support</option><option>Finance</option>
                  </select></div>
                <div><label className="form-label">Position *</label>
                  <input className="form-input" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></div>
                <div><label className="form-label">Hire Date *</label>
                  <input type="date" className="form-input" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} /></div>
                <div><label className="form-label">Salary Grade *</label>
                  <select className="form-input" value={form.salaryStructureId} onChange={e => setForm({ ...form, salaryStructureId: e.target.value })}>
                    <option value="">Select grade...</option>
                    {MOCK_STRUCTURES.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grossSalary.toLocaleString()})</option>)}
                  </select></div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} className="btn btn-primary">Add Employee</button>
                <button onClick={() => setShowForm(false)} className="btn bg-gray-200 text-gray-700">Cancel</button>
              </div>
            </div></div>
          )}

          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">Department:</label>
            <select className="form-input w-48" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
              <option value="all">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-4 py-3">Emp #</th><th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Department</th><th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Grade</th><th className="px-4 py-3 text-right">Gross Salary</th>
                  <th className="px-4 py-3">Status</th>
                </tr></thead>
                <tbody>
                  {filtered.map(emp => (
                    <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono">{emp.employeeNumber}</td>
                      <td className="px-4 py-3 font-medium">{emp.firstName} {emp.lastName}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.position}</td>
                      <td className="px-4 py-3 text-sm">{emp.salaryStructureName}</td>
                      <td className="px-4 py-3 text-right font-medium">UGX {emp.grossSalary?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[emp.status]}`}>{emp.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'structures' && (
        <div className="card">
          <div className="card-header border-b border-gray-200"><h3 className="text-lg font-semibold">Salary Structures</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Grade</th><th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 text-right">Basic</th><th className="px-4 py-3 text-right">Housing</th>
                <th className="px-4 py-3 text-right">Transport</th><th className="px-4 py-3 text-right">Medical</th>
                <th className="px-4 py-3 text-right">Other</th><th className="px-4 py-3 text-right">Gross</th>
              </tr></thead>
              <tbody>
                {MOCK_STRUCTURES.map(s => (
                  <tr key={s.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium">{s.gradeLevel}</td>
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3 text-right">{s.basicSalary.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{s.housingAllowance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{s.transportAllowance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{s.medicalAllowance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{s.otherAllowances.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold">UGX {s.grossSalary.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
