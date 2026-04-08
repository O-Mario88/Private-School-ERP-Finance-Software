/**
 * MAPLE SCHOOL FINANCE ERP
 * Default Budget Item Library
 *
 * 11 categories × item groups × starter items.
 * This is the system-level default library shipped with every Maple installation.
 * Institutions can hide items they don't use but cannot delete defaults.
 */

import type {
  BudgetCategoryDefinition,
  BudgetItemGroupDefinition,
  BudgetItemDefinition,
  BudgetItemPriority,
  BudgetItemFrequency,
} from '../types';

// ---------------------------------------------------------------------------
// Shorthand helpers to reduce verbosity
// ---------------------------------------------------------------------------

const P = {
  E: 'essential' as BudgetItemPriority,
  I: 'important' as BudgetItemPriority,
  D: 'desirable' as BudgetItemPriority,
  O: 'optional' as BudgetItemPriority,
};

const F = {
  M: 'monthly' as BudgetItemFrequency,
  Q: 'quarterly' as BudgetItemFrequency,
  A: 'annual' as BudgetItemFrequency,
  T: 'per_term' as BudgetItemFrequency,
  X: 'one_time' as BudgetItemFrequency,
};

function item(
  name: string,
  priority: BudgetItemPriority = P.I,
  frequency: BudgetItemFrequency = F.M,
  unitLabel?: string,
  countryFilter?: string[],
): BudgetItemDefinition {
  return { name, priority, frequency, unitLabel, countryFilter };
}

function group(code: string, name: string, items: BudgetItemDefinition[]): BudgetItemGroupDefinition {
  return { code, name, items };
}

// ============================================================================
// CATEGORY 01 — STAFF COSTS
// ============================================================================

const CAT_01_STAFF_COSTS: BudgetCategoryDefinition = {
  code: '01',
  name: 'Staff Costs',
  description: 'All employee compensation, benefits, and statutory contributions',
  typicalPercentage: '45–65%',
  groups: [
    group('01-01', 'Teaching Staff', [
      item('Teacher Salaries', P.E, F.M, 'staff'),
      item('Teacher Allowances', P.I, F.M, 'staff'),
      item('Overtime Pay', P.I, F.M),
      item('Substitute Teacher Pay', P.I, F.M),
    ]),
    group('01-02', 'Non-Teaching Staff', [
      item('Admin Salaries', P.E, F.M, 'staff'),
      item('Support Staff Wages', P.E, F.M, 'staff'),
      item('Kitchen Staff Wages', P.E, F.M, 'staff'),
      item('Driver Wages', P.I, F.M, 'staff'),
    ]),
    group('01-03', 'Management & Leadership', [
      item('Director / Head Teacher Salary', P.E, F.M),
      item('Deputy Head Salary', P.E, F.M),
      item('Bursar Salary', P.E, F.M),
      item('Department Head Allowances', P.I, F.M, 'heads'),
    ]),
    group('01-04', 'Statutory Contributions', [
      item('NSSF Contribution', P.E, F.M, 'staff', ['UG', 'KE', 'TZ']),
      item('NHIF Contribution', P.E, F.M, 'staff', ['KE', 'TZ']),
      item('UIF (Unemployment Insurance)', P.E, F.M, 'staff', ['ZA']),
      item('SSNIT Contribution', P.E, F.M, 'staff', ['GH']),
      item('NIS Contribution', P.E, F.M, 'staff', ['GH']),
      item('Pension Fund Contributions', P.E, F.M, 'staff'),
      item('Workers Compensation', P.E, F.A),
    ]),
    group('01-05', 'Staff Welfare & Development', [
      item('Staff Training & CPD', P.I, F.A),
      item('Staff Medical Scheme', P.I, F.A),
      item('Staff Meals', P.D, F.M),
      item('Uniforms & Protective Gear', P.D, F.A),
      item('End-of-Year Bonuses', P.D, F.A),
      item('Gratuity Provisions', P.I, F.A),
    ]),
    group('01-06', 'Recruitment', [
      item('Advertising & Job Posts', P.D, F.A),
      item('Interview Costs', P.D, F.A),
      item('Onboarding Costs', P.D, F.A),
    ]),
  ],
};

// ============================================================================
// CATEGORY 02 — ACADEMIC & CURRICULUM
// ============================================================================

const CAT_02_ACADEMIC: BudgetCategoryDefinition = {
  code: '02',
  name: 'Academic & Curriculum',
  description: 'Teaching materials, textbooks, exams, curriculum development',
  typicalPercentage: '5–10%',
  groups: [
    group('02-01', 'Teaching & Learning Materials', [
      item('Textbooks', P.E, F.T),
      item('Exercise Books & Stationery', P.E, F.T),
      item('Science Lab Supplies', P.I, F.T),
      item('Art & Craft Materials', P.D, F.T),
      item('Maps & Charts', P.D, F.A),
    ]),
    group('02-02', 'Examinations', [
      item('Internal Exam Printing', P.E, F.T),
      item('External Exam Registration Fees', P.E, F.A),
      item('Exam Materials & Supplies', P.I, F.T),
      item('Marking & Moderation', P.I, F.T),
    ]),
    group('02-03', 'Library', [
      item('Library Books', P.I, F.A),
      item('Periodicals & Subscriptions', P.D, F.A),
      item('Library Software / OPAC', P.O, F.A),
    ]),
    group('02-04', 'Curriculum Development', [
      item('Syllabus Review', P.D, F.A),
      item('Curriculum Training', P.D, F.A),
      item('Subject Panel Meetings', P.D, F.T),
    ]),
    group('02-05', 'Special Needs Education', [
      item('Learning Support Materials', P.I, F.A),
      item('Specialist Staff / Consultants', P.D, F.A),
      item('Assistive Devices', P.D, F.A),
    ]),
  ],
};

// ============================================================================
// CATEGORY 03 — STUDENT WELFARE & ACTIVITIES
// ============================================================================

const CAT_03_STUDENT_WELFARE: BudgetCategoryDefinition = {
  code: '03',
  name: 'Student Welfare & Activities',
  description: 'Co-curricular activities, student health, sports, clubs, and pastoral care',
  typicalPercentage: '3–6%',
  groups: [
    group('03-01', 'Sports & Games', [
      item('Sports Equipment', P.I, F.A),
      item('Uniforms & Kits', P.I, F.A),
      item('Competition Fees & Travel', P.D, F.T),
      item('Coaching Fees', P.D, F.M),
      item('Field / Court Maintenance', P.D, F.A),
    ]),
    group('03-02', 'Clubs & Societies', [
      item('Club Materials', P.D, F.T),
      item('Competition Fees', P.D, F.T),
      item('Guest Speakers / Facilitators', P.O, F.T),
    ]),
    group('03-03', 'Student Health', [
      item('First Aid Supplies', P.E, F.T),
      item('School Nurse Costs', P.I, F.M),
      item('Student Health Insurance', P.I, F.A),
      item('Medical Evacuation Fund', P.D, F.A),
    ]),
    group('03-04', 'Pastoral Care', [
      item('Counselling Services', P.I, F.A),
      item('Mentorship Programs', P.D, F.A),
      item('Student Welfare Fund', P.D, F.A),
    ]),
    group('03-05', 'Field Trips & Excursions', [
      item('Transport for Trips', P.D, F.T),
      item('Entry Fees & Tickets', P.D, F.T),
      item('Accommodation & Meals', P.D, F.T),
      item('Insurance', P.D, F.T),
    ]),
    group('03-06', 'Prizes & Awards', [
      item('Academic Awards', P.D, F.T),
      item('Sports Awards', P.D, F.A),
      item('End-of-Year Prizes', P.D, F.A),
      item('Graduation Ceremony', P.D, F.A),
    ]),
  ],
};

// ============================================================================
// CATEGORY 04 — FACILITIES & MAINTENANCE
// ============================================================================

const CAT_04_FACILITIES: BudgetCategoryDefinition = {
  code: '04',
  name: 'Facilities & Maintenance',
  description: 'Building repairs, utilities, cleaning, groundskeeping, and security',
  typicalPercentage: '8–15%',
  groups: [
    group('04-01', 'Building Maintenance', [
      item('Repairs & Painting', P.I, F.A),
      item('Plumbing', P.I, F.A),
      item('Roofing', P.I, F.A),
      item('Electrical Repairs', P.I, F.A),
      item('Carpentry', P.D, F.A),
      item('Pest Control', P.I, F.Q),
    ]),
    group('04-02', 'Utilities', [
      item('Electricity', P.E, F.M),
      item('Water & Sewage', P.E, F.M),
      item('Internet Connectivity', P.E, F.M),
      item('Generator Fuel', P.I, F.M),
      item('Solar System Maintenance', P.D, F.A),
    ]),
    group('04-03', 'Cleaning & Sanitation', [
      item('Cleaning Supplies', P.E, F.M),
      item('Waste Disposal', P.I, F.M),
      item('Sanitary Products', P.E, F.M),
    ]),
    group('04-04', 'Grounds & Landscaping', [
      item('Gardening & Landscaping', P.D, F.M),
      item('Playground Maintenance', P.I, F.A),
      item('Fencing', P.I, F.A),
    ]),
    group('04-05', 'Security', [
      item('Security Guards', P.E, F.M, 'guards'),
      item('CCTV & Surveillance', P.I, F.A),
      item('Access Control Systems', P.D, F.A),
      item('Security Lighting', P.I, F.A),
    ]),
    group('04-06', 'Furniture & Fittings', [
      item('Classroom Furniture', P.I, F.A),
      item('Office Furniture', P.D, F.A),
      item('Curtains & Blinds', P.O, F.A),
      item('Notice Boards', P.O, F.A),
    ]),
  ],
};

// ============================================================================
// CATEGORY 05 — ADMINISTRATION & OFFICE
// ============================================================================

const CAT_05_ADMIN: BudgetCategoryDefinition = {
  code: '05',
  name: 'Administration & Office',
  description: 'Non-academic operational costs for administration and governance',
  typicalPercentage: '4–8%',
  groups: [
    group('05-01', 'Office Supplies', [
      item('Stationery', P.I, F.M),
      item('Printing & Photocopying', P.I, F.M),
      item('Toner & Ink', P.I, F.Q),
      item('Paper', P.I, F.M),
    ]),
    group('05-02', 'Communication', [
      item('Telephone & Airtime', P.I, F.M),
      item('Internet Subscription', P.E, F.M),
      item('Postal Services', P.O, F.M),
      item('Bulk SMS Service', P.D, F.M),
    ]),
    group('05-03', 'Professional Services', [
      item('Legal Fees', P.I, F.A),
      item('Audit Fees', P.E, F.A),
      item('Consultancy', P.D, F.A),
      item('Accounting Services', P.I, F.A),
    ]),
    group('05-04', 'Insurance', [
      item('Property Insurance', P.E, F.A),
      item('Liability Insurance', P.E, F.A),
      item('Vehicle Insurance', P.E, F.A),
      item('Workers Compensation', P.E, F.A),
    ]),
    group('05-05', 'Marketing & Admissions', [
      item('Advertising', P.I, F.A),
      item('Open Day Events', P.D, F.T),
      item('Prospectus Printing', P.D, F.A),
      item('Website Maintenance', P.I, F.A),
    ]),
    group('05-06', 'Governance', [
      item('Board Meeting Expenses', P.I, F.Q),
      item('AGM Costs', P.I, F.A),
      item('Regulatory Compliance Fees', P.E, F.A),
    ]),
  ],
};

// ============================================================================
// CATEGORY 06 — ICT & TECHNOLOGY
// ============================================================================

const CAT_06_ICT: BudgetCategoryDefinition = {
  code: '06',
  name: 'ICT & Technology',
  description: 'Computers, software, internet, digital learning tools',
  typicalPercentage: '2–5%',
  groups: [
    group('06-01', 'Hardware', [
      item('Computers & Laptops', P.I, F.A),
      item('Printers & Scanners', P.I, F.A),
      item('Projectors & Screens', P.D, F.A),
      item('Networking Equipment', P.I, F.A),
      item('UPS & Power Protection', P.I, F.A),
    ]),
    group('06-02', 'Software & Licensing', [
      item('ERP / School Management Software', P.E, F.A),
      item('Antivirus & Security', P.E, F.A),
      item('Microsoft / Google Licensing', P.I, F.A),
      item('Learning Management System', P.D, F.A),
    ]),
    group('06-03', 'Connectivity', [
      item('Internet Bandwidth', P.E, F.M),
      item('Wi-Fi Infrastructure', P.I, F.A),
      item('Mobile Data for Staff', P.D, F.M),
    ]),
    group('06-04', 'Digital Learning', [
      item('E-Learning Content', P.D, F.A),
      item('Tablets / Devices for Students', P.O, F.A),
      item('Digital Whiteboard', P.O, F.A),
    ]),
    group('06-05', 'IT Support', [
      item('IT Technician Costs', P.I, F.M),
      item('Equipment Repair', P.I, F.A),
      item('Data Backup & Recovery', P.E, F.A),
    ]),
  ],
};

// ============================================================================
// CATEGORY 07 — TRANSPORT
// ============================================================================

const CAT_07_TRANSPORT: BudgetCategoryDefinition = {
  code: '07',
  name: 'Transport',
  description: 'Fleet maintenance, fuel, driver costs, route operations',
  typicalPercentage: '3–8%',
  groups: [
    group('07-01', 'Fleet Operations', [
      item('Fuel & Lubricants', P.E, F.M),
      item('Vehicle Servicing & Repairs', P.E, F.Q),
      item('Tyres', P.I, F.A),
      item('Vehicle Insurance', P.E, F.A),
      item('Road Licenses & Permits', P.E, F.A),
    ]),
    group('07-02', 'Personnel', [
      item('Driver Salaries', P.E, F.M, 'drivers'),
      item('Conductor / Attendant Pay', P.I, F.M),
      item('Driver Training', P.D, F.A),
    ]),
    group('07-03', 'Route Management', [
      item('GPS Tracking System', P.I, F.A),
      item('Route Planning Tools', P.D, F.A),
      item('Parent Communication (SMS)', P.D, F.M),
    ]),
    group('07-04', 'Vehicle Acquisition', [
      item('Bus / Van Purchase', P.O, F.X),
      item('Vehicle Lease Payments', P.I, F.M),
      item('Vehicle Depreciation Provision', P.I, F.A),
    ]),
  ],
};

// ============================================================================
// CATEGORY 08 — FOOD & KITCHEN
// ============================================================================

const CAT_08_FOOD_KITCHEN: BudgetCategoryDefinition = {
  code: '08',
  name: 'Food & Kitchen',
  description: 'Kitchen supplies, food procurement, catering staff, equipment',
  typicalPercentage: '5–12%',
  groups: [
    group('08-01', 'Food Procurement', [
      item('Staple Foods (rice, maize, beans)', P.E, F.M),
      item('Fresh Produce (vegetables, fruits)', P.E, F.M),
      item('Meat & Protein', P.E, F.M),
      item('Dairy Products', P.I, F.M),
      item('Cooking Oil & Spices', P.E, F.M),
      item('Beverages', P.D, F.M),
    ]),
    group('08-02', 'Kitchen Operations', [
      item('Cooking Gas / Firewood / Charcoal', P.E, F.M),
      item('Kitchen Equipment Maintenance', P.I, F.A),
      item('Kitchen Utensils & Crockery', P.I, F.A),
      item('Kitchen Sanitation', P.E, F.M),
    ]),
    group('08-03', 'Kitchen Staff', [
      item('Cook Salaries', P.E, F.M, 'staff'),
      item('Kitchen Helper Wages', P.E, F.M, 'staff'),
      item('Kitchen Staff Uniforms', P.D, F.A),
    ]),
    group('08-04', 'Dining Facilities', [
      item('Dining Tables & Chairs', P.I, F.A),
      item('Serving Equipment', P.I, F.A),
      item('Dining Hall Maintenance', P.D, F.A),
    ]),
  ],
};

// ============================================================================
// CATEGORY 09 — CAPITAL EXPENDITURE
// ============================================================================

const CAT_09_CAPEX: BudgetCategoryDefinition = {
  code: '09',
  name: 'Capital Expenditure',
  description: 'Land, buildings, major equipment, furniture',
  typicalPercentage: '5–15%',
  groups: [
    group('09-01', 'Buildings & Construction', [
      item('New Classroom Block', P.O, F.X),
      item('Laboratory Construction', P.O, F.X),
      item('Dormitory Block', P.O, F.X),
      item('Administration Block', P.O, F.X),
      item('Multipurpose Hall', P.O, F.X),
    ]),
    group('09-02', 'Land', [
      item('Land Acquisition', P.O, F.X),
      item('Land Development', P.O, F.X),
      item('Boundary & Fencing', P.I, F.X),
    ]),
    group('09-03', 'Major Equipment', [
      item('School Bus Purchase', P.O, F.X),
      item('Generator', P.I, F.X),
      item('Solar Panel System', P.D, F.X),
      item('Water Tank & Borehole', P.I, F.X),
      item('Science Lab Equipment', P.I, F.X),
    ]),
    group('09-04', 'Renovation', [
      item('Building Renovation', P.D, F.X),
      item('Facility Upgrade', P.D, F.X),
      item('Campus Expansion', P.O, F.X),
    ]),
  ],
};

// ============================================================================
// CATEGORY 10 — FINANCIAL & STATUTORY
// ============================================================================

const CAT_10_FINANCIAL: BudgetCategoryDefinition = {
  code: '10',
  name: 'Financial & Statutory',
  description: 'Taxes, licenses, bank charges, depreciation provisions',
  typicalPercentage: '2–5%',
  groups: [
    group('10-01', 'Taxes', [
      item('Corporate / Income Tax', P.E, F.A),
      item('PAYE (Employer Portion)', P.E, F.M),
      item('Withholding Tax', P.E, F.M),
      item('VAT (where applicable)', P.I, F.M),
      item('Property Tax / Rates', P.I, F.A),
    ]),
    group('10-02', 'Regulatory Fees', [
      item('School Operating License', P.E, F.A),
      item('Education Board Registration', P.E, F.A),
      item('Health & Safety Inspection Fees', P.I, F.A),
      item('Environmental Compliance', P.D, F.A),
    ]),
    group('10-03', 'Banking Costs', [
      item('Bank Charges', P.E, F.M),
      item('Mobile Money Transaction Fees', P.I, F.M),
      item('Currency Conversion Costs', P.D, F.M),
    ]),
    group('10-04', 'Financial Provisions', [
      item('Bad Debt Provision', P.I, F.A),
      item('Depreciation', P.E, F.A),
      item('Amortization', P.I, F.A),
      item('Loan Interest Payments', P.E, F.M),
    ]),
  ],
};

// ============================================================================
// CATEGORY 11 — CONTINGENCY & RESERVES
// ============================================================================

const CAT_11_CONTINGENCY: BudgetCategoryDefinition = {
  code: '11',
  name: 'Contingency & Reserves',
  description: 'Emergency fund, unplanned expenses, strategic reserve',
  typicalPercentage: '2–5%',
  groups: [
    group('11-01', 'Emergency Fund', [
      item('Emergency Repairs', P.E, F.A),
      item('Medical Emergencies', P.I, F.A),
      item('Natural Disaster Response', P.D, F.A),
    ]),
    group('11-02', 'Strategic Reserve', [
      item('Growth Reserve', P.I, F.A),
      item('Scholarship Fund Reserve', P.D, F.A),
      item('Technology Upgrade Reserve', P.D, F.A),
    ]),
    group('11-03', 'Miscellaneous', [
      item('Unclassified Expenses', P.O, F.A),
      item('Rounding Adjustments', P.O, F.A),
    ]),
  ],
};

// ============================================================================
// FULL LIBRARY
// ============================================================================

/** All 11 default budget categories with their item groups and starter items */
export const DEFAULT_BUDGET_CATEGORIES: readonly BudgetCategoryDefinition[] = [
  CAT_01_STAFF_COSTS,
  CAT_02_ACADEMIC,
  CAT_03_STUDENT_WELFARE,
  CAT_04_FACILITIES,
  CAT_05_ADMIN,
  CAT_06_ICT,
  CAT_07_TRANSPORT,
  CAT_08_FOOD_KITCHEN,
  CAT_09_CAPEX,
  CAT_10_FINANCIAL,
  CAT_11_CONTINGENCY,
] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Get a category by its 2-digit code */
export function getCategoryByCode(code: string): BudgetCategoryDefinition | undefined {
  return DEFAULT_BUDGET_CATEGORIES.find((c) => c.code === code);
}

/** Get all item groups for a category code */
export function getItemGroupsByCategory(categoryCode: string): BudgetItemGroupDefinition[] {
  return getCategoryByCode(categoryCode)?.groups ?? [];
}

/** Get all items for a specific item group code */
export function getItemsByGroup(groupCode: string): BudgetItemDefinition[] {
  for (const cat of DEFAULT_BUDGET_CATEGORIES) {
    const grp = cat.groups.find((g) => g.code === groupCode);
    if (grp) return grp.items;
  }
  return [];
}

/**
 * Get default items filtered by country code.
 * Items with no countryFilter are always included.
 * Items with a countryFilter are only included if the country matches.
 */
export function getItemsForCountry(
  groupCode: string,
  countryCode: string,
): BudgetItemDefinition[] {
  return getItemsByGroup(groupCode).filter(
    (it) => !it.countryFilter || it.countryFilter.includes(countryCode),
  );
}

/** Total number of default categories */
export function getCategoryCount(): number {
  return DEFAULT_BUDGET_CATEGORIES.length;
}

/** Total number of default item groups across all categories */
export function getItemGroupCount(): number {
  return DEFAULT_BUDGET_CATEGORIES.reduce((sum, c) => sum + c.groups.length, 0);
}

/** Total number of default items across all categories and groups */
export function getItemCount(): number {
  return DEFAULT_BUDGET_CATEGORIES.reduce(
    (sum, c) => sum + c.groups.reduce((gs, g) => gs + g.items.length, 0),
    0,
  );
}
