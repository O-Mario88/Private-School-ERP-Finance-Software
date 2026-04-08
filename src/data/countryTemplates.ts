/**
 * MAPLE ERP — International Country Template Library
 *
 * This file contains the complete country template definitions for all 21
 * English-speaking African countries supported by Maple ERP.
 *
 * Each template defines:
 *  - Country identity (name, ISO codes, region)
 *  - Currency (code, symbol, formatting rules)
 *  - Education structure (levels, stage groups, progression chain)
 *  - Academic calendar defaults (terms, year start)
 *  - ERP terminology defaults (student/class/invoice labels)
 *
 * RULES:
 *  - currency_code (ISO 4217) is the accounting source of truth
 *  - currency_symbol is a display helper only
 *  - level sequence must be strictly monotonically increasing
 *  - next_level_id chains the progression graph; null = terminal
 *  - templates are read-only reference data; institutions get copies
 */

import type {
  CountryTemplate,
  EducationLevel,
  StageGroup,
} from '../types';

// ============================================================================
// HELPER: Build a level with defaults
// ============================================================================

function level(
  levelId: string,
  stage: EducationLevel['stage'],
  stageGroupName: string,
  shortCode: string,
  longName: string,
  sequence: number,
  nextLevelId: string | null,
  opts?: Partial<Pick<EducationLevel, 'isCompletionExamStage' | 'completionExamName' | 'feeBillable' | 'promotionEligible'>>
): EducationLevel {
  return {
    levelId,
    stage,
    stageGroupName,
    shortCode,
    longName,
    sequence,
    nextLevelId,
    isCompletionExamStage: opts?.isCompletionExamStage ?? false,
    completionExamName: opts?.completionExamName ?? null,
    feeBillable: opts?.feeBillable ?? true,
    promotionEligible: opts?.promotionEligible ?? true,
  };
}

function stageGroup(
  id: string,
  name: string,
  stage: StageGroup['stage'],
  levelIds: string[],
  displayOrder: number
): StageGroup {
  return { stageGroupId: id, stageGroupName: name, stage, levelIds, displayOrder };
}

// ============================================================================
// 1. UGANDA (UG)
// ============================================================================

const ugandaLevels: EducationLevel[] = [
  level('UG-NURSERY-BABY',   'pre_primary', 'Nursery',  'Baby',   'Baby Class',      1, 'UG-NURSERY-MIDDLE'),
  level('UG-NURSERY-MIDDLE', 'pre_primary', 'Nursery',  'Middle', 'Middle Class',     2, 'UG-NURSERY-TOP'),
  level('UG-NURSERY-TOP',    'pre_primary', 'Nursery',  'Top',    'Top Class',        3, 'UG-P1'),
  level('UG-P1', 'primary', 'Primary', 'P1', 'Primary One',    4,  'UG-P2'),
  level('UG-P2', 'primary', 'Primary', 'P2', 'Primary Two',    5,  'UG-P3'),
  level('UG-P3', 'primary', 'Primary', 'P3', 'Primary Three',  6,  'UG-P4'),
  level('UG-P4', 'primary', 'Primary', 'P4', 'Primary Four',   7,  'UG-P5'),
  level('UG-P5', 'primary', 'Primary', 'P5', 'Primary Five',   8,  'UG-P6'),
  level('UG-P6', 'primary', 'Primary', 'P6', 'Primary Six',    9,  'UG-P7'),
  level('UG-P7', 'primary', 'Primary', 'P7', 'Primary Seven', 10,  'UG-S1', { isCompletionExamStage: true, completionExamName: 'PLE' }),
  level('UG-S1', 'lower_secondary', 'O-Level', 'S1', 'Senior One',   11, 'UG-S2'),
  level('UG-S2', 'lower_secondary', 'O-Level', 'S2', 'Senior Two',   12, 'UG-S3'),
  level('UG-S3', 'lower_secondary', 'O-Level', 'S3', 'Senior Three', 13, 'UG-S4'),
  level('UG-S4', 'lower_secondary', 'O-Level', 'S4', 'Senior Four',  14, 'UG-S5', { isCompletionExamStage: true, completionExamName: 'UCE' }),
  level('UG-S5', 'upper_secondary', 'A-Level', 'S5', 'Senior Five',  15, 'UG-S6'),
  level('UG-S6', 'upper_secondary', 'A-Level', 'S6', 'Senior Six',   16, null, { isCompletionExamStage: true, completionExamName: 'UACE' }),
];

const UGANDA: CountryTemplate = {
  countryName: 'Uganda',
  isoCountryCode: 'UG',
  isoCountryCode3: 'UGA',
  region: 'East Africa',
  subregion: 'East Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: [],
  currency: {
    currencyCode: 'UGX',
    currencySymbol: 'USh',
    currencyName: 'Ugandan Shilling',
    currencySubunitName: 'Cent',
    symbolPosition: 'before',
    decimalPlaces: 0,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'USh #,###',
  },
  educationSystemType: 'p_s_based',
  systemStructureCode: '7-4-2',
  prePrimaryEnabled: true,
  levels: ugandaLevels,
  stageGroups: [
    stageGroup('UG-NURSERY',   'Nursery',  'pre_primary',     ['UG-NURSERY-BABY', 'UG-NURSERY-MIDDLE', 'UG-NURSERY-TOP'], 1),
    stageGroup('UG-PRIMARY',   'Primary',  'primary',         ['UG-P1', 'UG-P2', 'UG-P3', 'UG-P4', 'UG-P5', 'UG-P6', 'UG-P7'], 2),
    stageGroup('UG-O-LEVEL',   'O-Level',  'lower_secondary', ['UG-S1', 'UG-S2', 'UG-S3', 'UG-S4'], 3),
    stageGroup('UG-A-LEVEL',   'A-Level',  'upper_secondary', ['UG-S5', 'UG-S6'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 2,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Pupil',
    learnerLabel: 'Pupil',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'School Fees Invoice',
    receiptLabel: 'Receipt',
    classLabel: 'Class',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Class',
    formLabel: 'Senior',
    standardLabel: 'Primary',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 2. KENYA (KE)
// ============================================================================

const kenyaLevels: EducationLevel[] = [
  level('KE-PP1', 'pre_primary', 'Pre-Primary', 'PP1', 'Pre-Primary 1', 1, 'KE-PP2'),
  level('KE-PP2', 'pre_primary', 'Pre-Primary', 'PP2', 'Pre-Primary 2', 2, 'KE-G1'),
  level('KE-G1',  'primary', 'Lower Primary', 'Grade 1', 'Grade 1',  3,  'KE-G2'),
  level('KE-G2',  'primary', 'Lower Primary', 'Grade 2', 'Grade 2',  4,  'KE-G3'),
  level('KE-G3',  'primary', 'Lower Primary', 'Grade 3', 'Grade 3',  5,  'KE-G4'),
  level('KE-G4',  'primary', 'Upper Primary', 'Grade 4', 'Grade 4',  6,  'KE-G5'),
  level('KE-G5',  'primary', 'Upper Primary', 'Grade 5', 'Grade 5',  7,  'KE-G6'),
  level('KE-G6',  'primary', 'Upper Primary', 'Grade 6', 'Grade 6',  8,  'KE-G7', { isCompletionExamStage: true, completionExamName: 'KPSEA' }),
  level('KE-G7',  'lower_secondary', 'Junior School',  'Grade 7',  'Grade 7',   9, 'KE-G8'),
  level('KE-G8',  'lower_secondary', 'Junior School',  'Grade 8',  'Grade 8',  10, 'KE-G9'),
  level('KE-G9',  'lower_secondary', 'Junior School',  'Grade 9',  'Grade 9',  11, 'KE-G10'),
  level('KE-G10', 'upper_secondary', 'Senior School',  'Grade 10', 'Grade 10', 12, 'KE-G11'),
  level('KE-G11', 'upper_secondary', 'Senior School',  'Grade 11', 'Grade 11', 13, 'KE-G12'),
  level('KE-G12', 'upper_secondary', 'Senior School',  'Grade 12', 'Grade 12', 14, null, { isCompletionExamStage: true, completionExamName: 'KCSE' }),
];

const KENYA: CountryTemplate = {
  countryName: 'Kenya',
  isoCountryCode: 'KE',
  isoCountryCode3: 'KEN',
  region: 'East Africa',
  subregion: 'East Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['Swahili'],
  currency: {
    currencyCode: 'KES',
    currencySymbol: 'KSh',
    currencyName: 'Kenyan Shilling',
    currencySubunitName: 'Cent',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'KSh #,###.##',
  },
  educationSystemType: 'grade_based',
  systemStructureCode: '2-6-3-3',
  prePrimaryEnabled: true,
  levels: kenyaLevels,
  stageGroups: [
    stageGroup('KE-PRE-PRIMARY',  'Pre-Primary',   'pre_primary',     ['KE-PP1', 'KE-PP2'], 1),
    stageGroup('KE-LOWER-PRIMARY','Lower Primary',  'primary',         ['KE-G1', 'KE-G2', 'KE-G3'], 2),
    stageGroup('KE-UPPER-PRIMARY','Upper Primary',  'primary',         ['KE-G4', 'KE-G5', 'KE-G6'], 3),
    stageGroup('KE-JUNIOR',       'Junior School',  'lower_secondary', ['KE-G7', 'KE-G8', 'KE-G9'], 4),
    stageGroup('KE-SENIOR',       'Senior School',  'upper_secondary', ['KE-G10', 'KE-G11', 'KE-G12'], 5),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 1,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Learner',
    learnerLabel: 'Learner',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'Fee Statement',
    receiptLabel: 'Receipt',
    classLabel: 'Grade',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Grade',
    formLabel: 'Grade',
    standardLabel: 'Grade',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 3. TANZANIA (TZ)
// ============================================================================

const tanzaniaLevels: EducationLevel[] = [
  level('TZ-PRE',  'pre_primary', 'Pre-Primary', 'Pre-Primary', 'Pre-Primary', 1, 'TZ-STD1'),
  level('TZ-STD1', 'primary', 'Primary', 'Std I',   'Standard I',    2,  'TZ-STD2'),
  level('TZ-STD2', 'primary', 'Primary', 'Std II',  'Standard II',   3,  'TZ-STD3'),
  level('TZ-STD3', 'primary', 'Primary', 'Std III', 'Standard III',  4,  'TZ-STD4'),
  level('TZ-STD4', 'primary', 'Primary', 'Std IV',  'Standard IV',   5,  'TZ-STD5'),
  level('TZ-STD5', 'primary', 'Primary', 'Std V',   'Standard V',    6,  'TZ-STD6'),
  level('TZ-STD6', 'primary', 'Primary', 'Std VI',  'Standard VI',   7,  'TZ-STD7'),
  level('TZ-STD7', 'primary', 'Primary', 'Std VII', 'Standard VII',  8,  'TZ-F1', { isCompletionExamStage: true, completionExamName: 'PSLE' }),
  level('TZ-F1', 'lower_secondary', 'Ordinary Level', 'Form I',   'Form I',    9,  'TZ-F2'),
  level('TZ-F2', 'lower_secondary', 'Ordinary Level', 'Form II',  'Form II',  10,  'TZ-F3'),
  level('TZ-F3', 'lower_secondary', 'Ordinary Level', 'Form III', 'Form III', 11,  'TZ-F4'),
  level('TZ-F4', 'lower_secondary', 'Ordinary Level', 'Form IV',  'Form IV',  12,  'TZ-F5', { isCompletionExamStage: true, completionExamName: 'CSEE' }),
  level('TZ-F5', 'upper_secondary', 'Advanced Level', 'Form V',   'Form V',   13,  'TZ-F6'),
  level('TZ-F6', 'upper_secondary', 'Advanced Level', 'Form VI',  'Form VI',  14,  null, { isCompletionExamStage: true, completionExamName: 'ACSEE' }),
];

const TANZANIA: CountryTemplate = {
  countryName: 'Tanzania',
  isoCountryCode: 'TZ',
  isoCountryCode3: 'TZA',
  region: 'East Africa',
  subregion: 'East Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['Swahili'],
  currency: {
    currencyCode: 'TZS',
    currencySymbol: 'TSh',
    currencyName: 'Tanzanian Shilling',
    currencySubunitName: 'Cent',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'TSh #,###',
  },
  educationSystemType: 'standard_form_based',
  systemStructureCode: '7-4-2',
  prePrimaryEnabled: true,
  levels: tanzaniaLevels,
  stageGroups: [
    stageGroup('TZ-PRE-PRIMARY', 'Pre-Primary',     'pre_primary',     ['TZ-PRE'], 1),
    stageGroup('TZ-PRIMARY',     'Primary',          'primary',         ['TZ-STD1','TZ-STD2','TZ-STD3','TZ-STD4','TZ-STD5','TZ-STD6','TZ-STD7'], 2),
    stageGroup('TZ-O-LEVEL',     'Ordinary Level',   'lower_secondary', ['TZ-F1','TZ-F2','TZ-F3','TZ-F4'], 3),
    stageGroup('TZ-A-LEVEL',     'Advanced Level',   'upper_secondary', ['TZ-F5','TZ-F6'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 1,
    termCount: 2,
    defaultTermNames: ['Term 1', 'Term 2'],
    semesterSupport: true,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Student',
    learnerLabel: 'Student',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'Fee Invoice',
    receiptLabel: 'Receipt',
    classLabel: 'Standard',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Standard',
    formLabel: 'Form',
    standardLabel: 'Standard',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 4. RWANDA (RW)
// ============================================================================

const rwandaLevels: EducationLevel[] = [
  level('RW-NURSERY', 'pre_primary', 'Pre-Primary', 'Nursery', 'Nursery', 1, 'RW-P1'),
  level('RW-P1', 'primary', 'Primary', 'P1', 'Primary 1', 2,  'RW-P2'),
  level('RW-P2', 'primary', 'Primary', 'P2', 'Primary 2', 3,  'RW-P3'),
  level('RW-P3', 'primary', 'Primary', 'P3', 'Primary 3', 4,  'RW-P4'),
  level('RW-P4', 'primary', 'Primary', 'P4', 'Primary 4', 5,  'RW-P5'),
  level('RW-P5', 'primary', 'Primary', 'P5', 'Primary 5', 6,  'RW-P6'),
  level('RW-P6', 'primary', 'Primary', 'P6', 'Primary 6', 7,  'RW-S1', { isCompletionExamStage: true, completionExamName: 'P6 National Exam' }),
  level('RW-S1', 'lower_secondary', 'Ordinary Level', 'S1', 'Senior 1',  8,  'RW-S2'),
  level('RW-S2', 'lower_secondary', 'Ordinary Level', 'S2', 'Senior 2',  9,  'RW-S3'),
  level('RW-S3', 'lower_secondary', 'Ordinary Level', 'S3', 'Senior 3', 10,  'RW-S4', { isCompletionExamStage: true, completionExamName: 'S3 National Exam' }),
  level('RW-S4', 'upper_secondary', 'Advanced Level', 'S4', 'Senior 4', 11,  'RW-S5'),
  level('RW-S5', 'upper_secondary', 'Advanced Level', 'S5', 'Senior 5', 12,  'RW-S6'),
  level('RW-S6', 'upper_secondary', 'Advanced Level', 'S6', 'Senior 6', 13,  null, { isCompletionExamStage: true, completionExamName: 'S6 National Exam' }),
];

const RWANDA: CountryTemplate = {
  countryName: 'Rwanda',
  isoCountryCode: 'RW',
  isoCountryCode3: 'RWA',
  region: 'East Africa',
  subregion: 'East Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['French', 'Kinyarwanda'],
  currency: {
    currencyCode: 'RWF',
    currencySymbol: 'FRw',
    currencyName: 'Rwandan Franc',
    currencySubunitName: 'Centime',
    symbolPosition: 'before',
    decimalPlaces: 0,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'FRw #,###',
  },
  educationSystemType: 'p_s_based',
  systemStructureCode: '6-3-3',
  prePrimaryEnabled: true,
  levels: rwandaLevels,
  stageGroups: [
    stageGroup('RW-PRE-PRIMARY', 'Pre-Primary',     'pre_primary',     ['RW-NURSERY'], 1),
    stageGroup('RW-PRIMARY',     'Primary',          'primary',         ['RW-P1','RW-P2','RW-P3','RW-P4','RW-P5','RW-P6'], 2),
    stageGroup('RW-O-LEVEL',     'Ordinary Level',   'lower_secondary', ['RW-S1','RW-S2','RW-S3'], 3),
    stageGroup('RW-A-LEVEL',     'Advanced Level',   'upper_secondary', ['RW-S4','RW-S5','RW-S6'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 1,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Student',
    learnerLabel: 'Student',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'Fee Invoice',
    receiptLabel: 'Receipt',
    classLabel: 'Class',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Primary',
    formLabel: 'Senior',
    standardLabel: 'Primary',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 5. SOUTH AFRICA (ZA)
// ============================================================================

const southAfricaLevels: EducationLevel[] = [
  level('ZA-GR',  'pre_primary', 'Foundation Phase', 'Grade R', 'Grade R (Reception)', 1, 'ZA-G1'),
  level('ZA-G1',  'primary', 'Foundation Phase',   'Grade 1',  'Grade 1',   2, 'ZA-G2'),
  level('ZA-G2',  'primary', 'Foundation Phase',   'Grade 2',  'Grade 2',   3, 'ZA-G3'),
  level('ZA-G3',  'primary', 'Foundation Phase',   'Grade 3',  'Grade 3',   4, 'ZA-G4'),
  level('ZA-G4',  'primary', 'Intermediate Phase', 'Grade 4',  'Grade 4',   5, 'ZA-G5'),
  level('ZA-G5',  'primary', 'Intermediate Phase', 'Grade 5',  'Grade 5',   6, 'ZA-G6'),
  level('ZA-G6',  'primary', 'Intermediate Phase', 'Grade 6',  'Grade 6',   7, 'ZA-G7'),
  level('ZA-G7',  'primary', 'Senior Phase',       'Grade 7',  'Grade 7',   8, 'ZA-G8'),
  level('ZA-G8',  'lower_secondary', 'Senior Phase', 'Grade 8', 'Grade 8',  9, 'ZA-G9'),
  level('ZA-G9',  'lower_secondary', 'Senior Phase', 'Grade 9', 'Grade 9', 10, 'ZA-G10'),
  level('ZA-G10', 'upper_secondary', 'FET Phase', 'Grade 10', 'Grade 10', 11, 'ZA-G11'),
  level('ZA-G11', 'upper_secondary', 'FET Phase', 'Grade 11', 'Grade 11', 12, 'ZA-G12'),
  level('ZA-G12', 'upper_secondary', 'FET Phase', 'Grade 12', 'Grade 12', 13, null, { isCompletionExamStage: true, completionExamName: 'NSC' }),
];

const SOUTH_AFRICA: CountryTemplate = {
  countryName: 'South Africa',
  isoCountryCode: 'ZA',
  isoCountryCode3: 'ZAF',
  region: 'Southern Africa',
  subregion: 'Southern Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['Afrikaans', 'Zulu', 'Xhosa'],
  currency: {
    currencyCode: 'ZAR',
    currencySymbol: 'R',
    currencyName: 'South African Rand',
    currencySubunitName: 'Cent',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'R #,###.##',
  },
  educationSystemType: 'grade_based',
  systemStructureCode: '1-6-3-3',
  prePrimaryEnabled: true,
  levels: southAfricaLevels,
  stageGroups: [
    stageGroup('ZA-FOUNDATION',    'Foundation Phase',    'pre_primary',     ['ZA-GR'], 1),
    stageGroup('ZA-FOUNDATION-P',  'Foundation Phase',    'primary',         ['ZA-G1','ZA-G2','ZA-G3'], 2),
    stageGroup('ZA-INTERMEDIATE',  'Intermediate Phase',  'primary',         ['ZA-G4','ZA-G5','ZA-G6'], 3),
    stageGroup('ZA-SENIOR',        'Senior Phase',        'primary',         ['ZA-G7'], 4),
    stageGroup('ZA-SENIOR-SEC',    'Senior Phase',        'lower_secondary', ['ZA-G8','ZA-G9'], 5),
    stageGroup('ZA-FET',           'FET Phase',           'upper_secondary', ['ZA-G10','ZA-G11','ZA-G12'], 6),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 1,
    termCount: 4,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3', 'Term 4'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Learner',
    learnerLabel: 'Learner',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Progress Report',
    invoiceLabel: 'Fee Statement',
    receiptLabel: 'Receipt',
    classLabel: 'Grade',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Grade',
    formLabel: 'Grade',
    standardLabel: 'Grade',
    headTeacherLabel: 'Principal',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 6. GHANA (GH)
// ============================================================================

const ghanaLevels: EducationLevel[] = [
  level('GH-KG1',  'pre_primary', 'Kindergarten', 'KG1', 'Kindergarten 1', 1, 'GH-KG2'),
  level('GH-KG2',  'pre_primary', 'Kindergarten', 'KG2', 'Kindergarten 2', 2, 'GH-P1'),
  level('GH-P1',   'primary', 'Primary', 'Primary 1', 'Primary 1',  3, 'GH-P2'),
  level('GH-P2',   'primary', 'Primary', 'Primary 2', 'Primary 2',  4, 'GH-P3'),
  level('GH-P3',   'primary', 'Primary', 'Primary 3', 'Primary 3',  5, 'GH-P4'),
  level('GH-P4',   'primary', 'Primary', 'Primary 4', 'Primary 4',  6, 'GH-P5'),
  level('GH-P5',   'primary', 'Primary', 'Primary 5', 'Primary 5',  7, 'GH-P6'),
  level('GH-P6',   'primary', 'Primary', 'Primary 6', 'Primary 6',  8, 'GH-JHS1'),
  level('GH-JHS1', 'lower_secondary', 'JHS', 'JHS 1', 'Junior High School 1',  9, 'GH-JHS2'),
  level('GH-JHS2', 'lower_secondary', 'JHS', 'JHS 2', 'Junior High School 2', 10, 'GH-JHS3'),
  level('GH-JHS3', 'lower_secondary', 'JHS', 'JHS 3', 'Junior High School 3', 11, 'GH-SHS1', { isCompletionExamStage: true, completionExamName: 'BECE' }),
  level('GH-SHS1', 'upper_secondary', 'SHS', 'SHS 1', 'Senior High School 1', 12, 'GH-SHS2'),
  level('GH-SHS2', 'upper_secondary', 'SHS', 'SHS 2', 'Senior High School 2', 13, 'GH-SHS3'),
  level('GH-SHS3', 'upper_secondary', 'SHS', 'SHS 3', 'Senior High School 3', 14, null, { isCompletionExamStage: true, completionExamName: 'WASSCE' }),
];

const GHANA: CountryTemplate = {
  countryName: 'Ghana',
  isoCountryCode: 'GH',
  isoCountryCode3: 'GHA',
  region: 'West Africa',
  subregion: 'West Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: [],
  currency: {
    currencyCode: 'GHS',
    currencySymbol: 'GH₵',
    currencyName: 'Ghana Cedi',
    currencySubunitName: 'Pesewa',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'GH₵ #,###.##',
  },
  educationSystemType: 'kg_primary_jhs_shs',
  systemStructureCode: '2-6-3-3',
  prePrimaryEnabled: true,
  levels: ghanaLevels,
  stageGroups: [
    stageGroup('GH-KG',      'Kindergarten', 'pre_primary',     ['GH-KG1','GH-KG2'], 1),
    stageGroup('GH-PRIMARY', 'Primary',      'primary',         ['GH-P1','GH-P2','GH-P3','GH-P4','GH-P5','GH-P6'], 2),
    stageGroup('GH-JHS',     'JHS',          'lower_secondary', ['GH-JHS1','GH-JHS2','GH-JHS3'], 3),
    stageGroup('GH-SHS',     'SHS',          'upper_secondary', ['GH-SHS1','GH-SHS2','GH-SHS3'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2025/2026',
    academicYearStartMonth: 9,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Pupil',
    learnerLabel: 'Pupil',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'Fee Note',
    receiptLabel: 'Receipt',
    classLabel: 'Class',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Primary',
    formLabel: 'JHS/SHS',
    standardLabel: 'Primary',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 7. BOTSWANA (BW)
// ============================================================================

const botswanaLevels: EducationLevel[] = [
  level('BW-REC',  'pre_primary', 'Pre-Primary', 'Reception', 'Reception', 1, 'BW-STD1'),
  level('BW-STD1', 'primary', 'Primary', 'Std 1', 'Standard 1', 2,  'BW-STD2'),
  level('BW-STD2', 'primary', 'Primary', 'Std 2', 'Standard 2', 3,  'BW-STD3'),
  level('BW-STD3', 'primary', 'Primary', 'Std 3', 'Standard 3', 4,  'BW-STD4'),
  level('BW-STD4', 'primary', 'Primary', 'Std 4', 'Standard 4', 5,  'BW-STD5'),
  level('BW-STD5', 'primary', 'Primary', 'Std 5', 'Standard 5', 6,  'BW-STD6'),
  level('BW-STD6', 'primary', 'Primary', 'Std 6', 'Standard 6', 7,  'BW-STD7'),
  level('BW-STD7', 'primary', 'Primary', 'Std 7', 'Standard 7', 8,  'BW-F1', { isCompletionExamStage: true, completionExamName: 'PSLE' }),
  level('BW-F1', 'lower_secondary', 'Junior Secondary', 'Form 1', 'Form 1',  9, 'BW-F2'),
  level('BW-F2', 'lower_secondary', 'Junior Secondary', 'Form 2', 'Form 2', 10, 'BW-F3'),
  level('BW-F3', 'lower_secondary', 'Junior Secondary', 'Form 3', 'Form 3', 11, 'BW-F4', { isCompletionExamStage: true, completionExamName: 'JCE' }),
  level('BW-F4', 'upper_secondary', 'Senior Secondary', 'Form 4', 'Form 4', 12, 'BW-F5'),
  level('BW-F5', 'upper_secondary', 'Senior Secondary', 'Form 5', 'Form 5', 13, null, { isCompletionExamStage: true, completionExamName: 'BGCSE' }),
];

const BOTSWANA: CountryTemplate = {
  countryName: 'Botswana',
  isoCountryCode: 'BW',
  isoCountryCode3: 'BWA',
  region: 'Southern Africa',
  subregion: 'Southern Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['Setswana'],
  currency: {
    currencyCode: 'BWP',
    currencySymbol: 'P',
    currencyName: 'Botswana Pula',
    currencySubunitName: 'Thebe',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'P #,###.##',
  },
  educationSystemType: 'standard_form_based',
  systemStructureCode: '7-3-2',
  prePrimaryEnabled: true,
  levels: botswanaLevels,
  stageGroups: [
    stageGroup('BW-PRE-PRIMARY', 'Pre-Primary',       'pre_primary',     ['BW-REC'], 1),
    stageGroup('BW-PRIMARY',     'Primary',            'primary',         ['BW-STD1','BW-STD2','BW-STD3','BW-STD4','BW-STD5','BW-STD6','BW-STD7'], 2),
    stageGroup('BW-JUNIOR-SEC',  'Junior Secondary',   'lower_secondary', ['BW-F1','BW-F2','BW-F3'], 3),
    stageGroup('BW-SENIOR-SEC',  'Senior Secondary',   'upper_secondary', ['BW-F4','BW-F5'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 1,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Learner',
    learnerLabel: 'Learner',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'Fee Statement',
    receiptLabel: 'Receipt',
    classLabel: 'Standard',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Standard',
    formLabel: 'Form',
    standardLabel: 'Standard',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 8. NAMIBIA (NA)
// ============================================================================

const namibiaLevels: EducationLevel[] = [
  level('NA-G0',  'pre_primary', 'Pre-Primary', 'Grade 0', 'Grade 0 (Pre-Primary)', 1, 'NA-G1'),
  level('NA-G1',  'primary', 'Lower Primary', 'Grade 1',  'Grade 1',   2, 'NA-G2'),
  level('NA-G2',  'primary', 'Lower Primary', 'Grade 2',  'Grade 2',   3, 'NA-G3'),
  level('NA-G3',  'primary', 'Lower Primary', 'Grade 3',  'Grade 3',   4, 'NA-G4'),
  level('NA-G4',  'primary', 'Upper Primary', 'Grade 4',  'Grade 4',   5, 'NA-G5'),
  level('NA-G5',  'primary', 'Upper Primary', 'Grade 5',  'Grade 5',   6, 'NA-G6'),
  level('NA-G6',  'primary', 'Upper Primary', 'Grade 6',  'Grade 6',   7, 'NA-G7'),
  level('NA-G7',  'primary', 'Upper Primary', 'Grade 7',  'Grade 7',   8, 'NA-G8'),
  level('NA-G8',  'lower_secondary', 'Junior Secondary', 'Grade 8', 'Grade 8',  9, 'NA-G9'),
  level('NA-G9',  'lower_secondary', 'Junior Secondary', 'Grade 9', 'Grade 9', 10, 'NA-G10', { isCompletionExamStage: true, completionExamName: 'JSC' }),
  level('NA-G10', 'upper_secondary', 'Senior Secondary', 'Grade 10', 'Grade 10', 11, 'NA-G11'),
  level('NA-G11', 'upper_secondary', 'Senior Secondary', 'Grade 11', 'Grade 11', 12, 'NA-G12', { isCompletionExamStage: true, completionExamName: 'NSSCO' }),
  level('NA-G12', 'upper_secondary', 'Senior Secondary', 'Grade 12', 'Grade 12', 13, null, { isCompletionExamStage: true, completionExamName: 'NSSCAS' }),
];

const NAMIBIA: CountryTemplate = {
  countryName: 'Namibia',
  isoCountryCode: 'NA',
  isoCountryCode3: 'NAM',
  region: 'Southern Africa',
  subregion: 'Southern Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['Afrikaans'],
  currency: {
    currencyCode: 'NAD',
    currencySymbol: 'N$',
    currencyName: 'Namibian Dollar',
    currencySubunitName: 'Cent',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'N$ #,###.##',
  },
  educationSystemType: 'grade_based',
  systemStructureCode: '7-3-2',
  prePrimaryEnabled: true,
  levels: namibiaLevels,
  stageGroups: [
    stageGroup('NA-PRE-PRIMARY', 'Pre-Primary',       'pre_primary',     ['NA-G0'], 1),
    stageGroup('NA-LOWER-PRI',   'Lower Primary',     'primary',         ['NA-G1','NA-G2','NA-G3'], 2),
    stageGroup('NA-UPPER-PRI',   'Upper Primary',     'primary',         ['NA-G4','NA-G5','NA-G6','NA-G7'], 3),
    stageGroup('NA-JUNIOR-SEC',  'Junior Secondary',  'lower_secondary', ['NA-G8','NA-G9'], 4),
    stageGroup('NA-SENIOR-SEC',  'Senior Secondary',  'upper_secondary', ['NA-G10','NA-G11','NA-G12'], 5),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 1,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Learner',
    learnerLabel: 'Learner',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'Fee Statement',
    receiptLabel: 'Receipt',
    classLabel: 'Grade',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Grade',
    formLabel: 'Grade',
    standardLabel: 'Grade',
    headTeacherLabel: 'Principal',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 9. ZAMBIA (ZM)
// ============================================================================

const zambiaLevels: EducationLevel[] = [
  level('ZM-REC', 'pre_primary', 'Pre-Primary',  'Reception', 'Reception', 1, 'ZM-G1'),
  level('ZM-G1',  'primary', 'Primary', 'Grade 1', 'Grade 1',  2, 'ZM-G2'),
  level('ZM-G2',  'primary', 'Primary', 'Grade 2', 'Grade 2',  3, 'ZM-G3'),
  level('ZM-G3',  'primary', 'Primary', 'Grade 3', 'Grade 3',  4, 'ZM-G4'),
  level('ZM-G4',  'primary', 'Primary', 'Grade 4', 'Grade 4',  5, 'ZM-G5'),
  level('ZM-G5',  'primary', 'Primary', 'Grade 5', 'Grade 5',  6, 'ZM-G6'),
  level('ZM-G6',  'primary', 'Primary', 'Grade 6', 'Grade 6',  7, 'ZM-G7'),
  level('ZM-G7',  'primary', 'Primary', 'Grade 7', 'Grade 7',  8, 'ZM-G8', { isCompletionExamStage: true, completionExamName: 'Grade 7 Composite' }),
  level('ZM-G8',  'lower_secondary', 'Junior Secondary', 'Grade 8',  'Grade 8',   9, 'ZM-G9'),
  level('ZM-G9',  'lower_secondary', 'Junior Secondary', 'Grade 9',  'Grade 9',  10, 'ZM-G10', { isCompletionExamStage: true, completionExamName: 'G9 Exam' }),
  level('ZM-G10', 'upper_secondary', 'Senior Secondary', 'Grade 10', 'Grade 10', 11, 'ZM-G11'),
  level('ZM-G11', 'upper_secondary', 'Senior Secondary', 'Grade 11', 'Grade 11', 12, 'ZM-G12'),
  level('ZM-G12', 'upper_secondary', 'Senior Secondary', 'Grade 12', 'Grade 12', 13, null, { isCompletionExamStage: true, completionExamName: 'SCE' }),
];

const ZAMBIA: CountryTemplate = {
  countryName: 'Zambia',
  isoCountryCode: 'ZM',
  isoCountryCode3: 'ZMB',
  region: 'Southern Africa',
  subregion: 'Southern Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: [],
  currency: {
    currencyCode: 'ZMW',
    currencySymbol: 'K',
    currencyName: 'Zambian Kwacha',
    currencySubunitName: 'Ngwee',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'K #,###.##',
  },
  educationSystemType: 'grade_based',
  systemStructureCode: '7-2-3',
  prePrimaryEnabled: true,
  levels: zambiaLevels,
  stageGroups: [
    stageGroup('ZM-PRE-PRIMARY', 'Pre-Primary',       'pre_primary',     ['ZM-REC'], 1),
    stageGroup('ZM-PRIMARY',     'Primary',            'primary',         ['ZM-G1','ZM-G2','ZM-G3','ZM-G4','ZM-G5','ZM-G6','ZM-G7'], 2),
    stageGroup('ZM-JUNIOR-SEC',  'Junior Secondary',   'lower_secondary', ['ZM-G8','ZM-G9'], 3),
    stageGroup('ZM-SENIOR-SEC',  'Senior Secondary',   'upper_secondary', ['ZM-G10','ZM-G11','ZM-G12'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 1,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Pupil',
    learnerLabel: 'Pupil',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Progress Report',
    invoiceLabel: 'Fee Statement',
    receiptLabel: 'Receipt',
    classLabel: 'Grade',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Grade',
    formLabel: 'Grade',
    standardLabel: 'Grade',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 10. MAURITIUS (MU)
// ============================================================================

const mauritiusLevels: EducationLevel[] = [
  level('MU-PRE', 'pre_primary', 'Pre-Primary', 'Pre-Primary', 'Pre-Primary', 1, 'MU-G1'),
  level('MU-G1',  'primary', 'Primary', 'Grade 1', 'Grade 1', 2, 'MU-G2'),
  level('MU-G2',  'primary', 'Primary', 'Grade 2', 'Grade 2', 3, 'MU-G3'),
  level('MU-G3',  'primary', 'Primary', 'Grade 3', 'Grade 3', 4, 'MU-G4'),
  level('MU-G4',  'primary', 'Primary', 'Grade 4', 'Grade 4', 5, 'MU-G5'),
  level('MU-G5',  'primary', 'Primary', 'Grade 5', 'Grade 5', 6, 'MU-G6'),
  level('MU-G6',  'primary', 'Primary', 'Grade 6', 'Grade 6', 7, 'MU-G7', { isCompletionExamStage: true, completionExamName: 'PSAC' }),
  level('MU-G7',  'lower_secondary', 'Lower Secondary', 'Grade 7',  'Grade 7',   8, 'MU-G8'),
  level('MU-G8',  'lower_secondary', 'Lower Secondary', 'Grade 8',  'Grade 8',   9, 'MU-G9'),
  level('MU-G9',  'lower_secondary', 'Lower Secondary', 'Grade 9',  'Grade 9',  10, 'MU-G10', { isCompletionExamStage: true, completionExamName: 'NCE' }),
  level('MU-G10', 'upper_secondary', 'Upper Secondary',  'Grade 10', 'Grade 10', 11, 'MU-G11'),
  level('MU-G11', 'upper_secondary', 'Upper Secondary',  'Grade 11', 'Grade 11', 12, 'MU-G12', { isCompletionExamStage: true, completionExamName: 'SC' }),
  level('MU-G12', 'upper_secondary', 'Pre-University',   'Grade 12', 'Grade 12', 13, 'MU-G13'),
  level('MU-G13', 'upper_secondary', 'Pre-University',   'Grade 13', 'Grade 13', 14, null, { isCompletionExamStage: true, completionExamName: 'HSC' }),
];

const MAURITIUS: CountryTemplate = {
  countryName: 'Mauritius',
  isoCountryCode: 'MU',
  isoCountryCode3: 'MUS',
  region: 'East Africa',
  subregion: 'Indian Ocean',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['French', 'Kreol'],
  currency: {
    currencyCode: 'MUR',
    currencySymbol: 'Rs',
    currencyName: 'Mauritian Rupee',
    currencySubunitName: 'Cent',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'Rs #,###.##',
  },
  educationSystemType: 'grade_based',
  systemStructureCode: '6-5-2',
  prePrimaryEnabled: true,
  levels: mauritiusLevels,
  stageGroups: [
    stageGroup('MU-PRE-PRIMARY', 'Pre-Primary',       'pre_primary',     ['MU-PRE'], 1),
    stageGroup('MU-PRIMARY',     'Primary',            'primary',         ['MU-G1','MU-G2','MU-G3','MU-G4','MU-G5','MU-G6'], 2),
    stageGroup('MU-LOWER-SEC',   'Lower Secondary',    'lower_secondary', ['MU-G7','MU-G8','MU-G9'], 3),
    stageGroup('MU-UPPER-SEC',   'Upper Secondary',    'upper_secondary', ['MU-G10','MU-G11'], 4),
    stageGroup('MU-PRE-UNI',     'Pre-University',     'upper_secondary', ['MU-G12','MU-G13'], 5),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 1,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Student',
    learnerLabel: 'Student',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Progress Report',
    invoiceLabel: 'Fee Invoice',
    receiptLabel: 'Receipt',
    classLabel: 'Grade',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Grade',
    formLabel: 'Grade',
    standardLabel: 'Grade',
    headTeacherLabel: 'Rector',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 11. NIGERIA (NG)
// ============================================================================

const nigeriaLevels: EducationLevel[] = [
  level('NG-NUR1', 'pre_primary', 'Nursery', 'Nursery 1', 'Nursery 1', 1, 'NG-NUR2'),
  level('NG-NUR2', 'pre_primary', 'Nursery', 'Nursery 2', 'Nursery 2', 2, 'NG-NUR3'),
  level('NG-NUR3', 'pre_primary', 'Nursery', 'Nursery 3', 'Nursery 3', 3, 'NG-P1'),
  level('NG-P1', 'primary', 'Primary', 'Primary 1', 'Primary 1', 4,  'NG-P2'),
  level('NG-P2', 'primary', 'Primary', 'Primary 2', 'Primary 2', 5,  'NG-P3'),
  level('NG-P3', 'primary', 'Primary', 'Primary 3', 'Primary 3', 6,  'NG-P4'),
  level('NG-P4', 'primary', 'Primary', 'Primary 4', 'Primary 4', 7,  'NG-P5'),
  level('NG-P5', 'primary', 'Primary', 'Primary 5', 'Primary 5', 8,  'NG-P6'),
  level('NG-P6', 'primary', 'Primary', 'Primary 6', 'Primary 6', 9,  'NG-JSS1', { isCompletionExamStage: true, completionExamName: 'Common Entrance' }),
  level('NG-JSS1', 'lower_secondary', 'Junior Secondary', 'JSS 1', 'Junior Secondary 1', 10, 'NG-JSS2'),
  level('NG-JSS2', 'lower_secondary', 'Junior Secondary', 'JSS 2', 'Junior Secondary 2', 11, 'NG-JSS3'),
  level('NG-JSS3', 'lower_secondary', 'Junior Secondary', 'JSS 3', 'Junior Secondary 3', 12, 'NG-SSS1', { isCompletionExamStage: true, completionExamName: 'BECE' }),
  level('NG-SSS1', 'upper_secondary', 'Senior Secondary', 'SSS 1', 'Senior Secondary 1', 13, 'NG-SSS2'),
  level('NG-SSS2', 'upper_secondary', 'Senior Secondary', 'SSS 2', 'Senior Secondary 2', 14, 'NG-SSS3'),
  level('NG-SSS3', 'upper_secondary', 'Senior Secondary', 'SSS 3', 'Senior Secondary 3', 15, null, { isCompletionExamStage: true, completionExamName: 'WASSCE/NECO' }),
];

const NIGERIA: CountryTemplate = {
  countryName: 'Nigeria',
  isoCountryCode: 'NG',
  isoCountryCode3: 'NGA',
  region: 'West Africa',
  subregion: 'West Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: [],
  currency: {
    currencyCode: 'NGN',
    currencySymbol: '₦',
    currencyName: 'Nigerian Naira',
    currencySubunitName: 'Kobo',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: '₦ #,###.##',
  },
  educationSystemType: 'primary_jss_sss',
  systemStructureCode: '6-3-3',
  prePrimaryEnabled: true,
  levels: nigeriaLevels,
  stageGroups: [
    stageGroup('NG-NURSERY',    'Nursery',          'pre_primary',     ['NG-NUR1','NG-NUR2','NG-NUR3'], 1),
    stageGroup('NG-PRIMARY',    'Primary',           'primary',         ['NG-P1','NG-P2','NG-P3','NG-P4','NG-P5','NG-P6'], 2),
    stageGroup('NG-JUNIOR-SEC', 'Junior Secondary',  'lower_secondary', ['NG-JSS1','NG-JSS2','NG-JSS3'], 3),
    stageGroup('NG-SENIOR-SEC', 'Senior Secondary',  'upper_secondary', ['NG-SSS1','NG-SSS2','NG-SSS3'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2025/2026',
    academicYearStartMonth: 9,
    termCount: 3,
    defaultTermNames: ['First Term', 'Second Term', 'Third Term'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Pupil',
    learnerLabel: 'Pupil',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'School Fees Invoice',
    receiptLabel: 'Receipt',
    classLabel: 'Class',
    streamLabel: 'Arm',
    sectionLabel: 'Section',
    gradeLabel: 'Primary',
    formLabel: 'JSS/SSS',
    standardLabel: 'Primary',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 12. ZIMBABWE (ZW)
// ============================================================================

const zimbabweLevels: EducationLevel[] = [
  level('ZW-ECDA', 'pre_primary', 'ECD', 'ECD A', 'ECD A', 1, 'ZW-ECDB'),
  level('ZW-ECDB', 'pre_primary', 'ECD', 'ECD B', 'ECD B', 2, 'ZW-G1'),
  level('ZW-G1', 'primary', 'Primary', 'Grade 1', 'Grade 1', 3,  'ZW-G2'),
  level('ZW-G2', 'primary', 'Primary', 'Grade 2', 'Grade 2', 4,  'ZW-G3'),
  level('ZW-G3', 'primary', 'Primary', 'Grade 3', 'Grade 3', 5,  'ZW-G4'),
  level('ZW-G4', 'primary', 'Primary', 'Grade 4', 'Grade 4', 6,  'ZW-G5'),
  level('ZW-G5', 'primary', 'Primary', 'Grade 5', 'Grade 5', 7,  'ZW-G6'),
  level('ZW-G6', 'primary', 'Primary', 'Grade 6', 'Grade 6', 8,  'ZW-G7'),
  level('ZW-G7', 'primary', 'Primary', 'Grade 7', 'Grade 7', 9,  'ZW-F1', { isCompletionExamStage: true, completionExamName: 'Grade 7 Exam' }),
  level('ZW-F1', 'lower_secondary', 'Ordinary Level', 'Form 1', 'Form 1', 10, 'ZW-F2'),
  level('ZW-F2', 'lower_secondary', 'Ordinary Level', 'Form 2', 'Form 2', 11, 'ZW-F3'),
  level('ZW-F3', 'lower_secondary', 'Ordinary Level', 'Form 3', 'Form 3', 12, 'ZW-F4'),
  level('ZW-F4', 'lower_secondary', 'Ordinary Level', 'Form 4', 'Form 4', 13, 'ZW-F5', { isCompletionExamStage: true, completionExamName: 'O-Level (ZIMSEC)' }),
  level('ZW-F5', 'upper_secondary', 'Advanced Level', 'Form 5', 'Form 5 (Lower 6th)', 14, 'ZW-F6'),
  level('ZW-F6', 'upper_secondary', 'Advanced Level', 'Form 6', 'Form 6 (Upper 6th)', 15, null, { isCompletionExamStage: true, completionExamName: 'A-Level (ZIMSEC)' }),
];

const ZIMBABWE: CountryTemplate = {
  countryName: 'Zimbabwe',
  isoCountryCode: 'ZW',
  isoCountryCode3: 'ZWE',
  region: 'Southern Africa',
  subregion: 'Southern Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['Shona', 'Ndebele'],
  currency: {
    currencyCode: 'ZWG',
    currencySymbol: 'ZiG',
    currencyName: 'Zimbabwe Gold',
    currencySubunitName: 'Cent',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'ZiG #,###.##',
  },
  educationSystemType: 'grade_form_based',
  systemStructureCode: '7-4-2',
  prePrimaryEnabled: true,
  levels: zimbabweLevels,
  stageGroups: [
    stageGroup('ZW-ECD',     'ECD',              'pre_primary',     ['ZW-ECDA','ZW-ECDB'], 1),
    stageGroup('ZW-PRIMARY', 'Primary',           'primary',         ['ZW-G1','ZW-G2','ZW-G3','ZW-G4','ZW-G5','ZW-G6','ZW-G7'], 2),
    stageGroup('ZW-O-LEVEL', 'Ordinary Level',    'lower_secondary', ['ZW-F1','ZW-F2','ZW-F3','ZW-F4'], 3),
    stageGroup('ZW-A-LEVEL', 'Advanced Level',    'upper_secondary', ['ZW-F5','ZW-F6'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 1,
    termCount: 3,
    defaultTermNames: ['First Term', 'Second Term', 'Third Term'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Learner',
    learnerLabel: 'Learner',
    guardianLabel: 'Guardian',
    parentLabel: 'Guardian',
    payerLabel: 'Guardian',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'Fee Statement',
    receiptLabel: 'Receipt',
    classLabel: 'Grade',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Grade',
    formLabel: 'Form',
    standardLabel: 'Grade',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'needs_validation',
};

// ============================================================================
// 13. MALAWI (MW)
// ============================================================================

const malawiLevels: EducationLevel[] = [
  level('MW-ECD',  'pre_primary', 'ECD', 'ECD', 'Early Childhood Development', 1, 'MW-STD1'),
  level('MW-STD1', 'primary', 'Primary', 'Std 1', 'Standard 1',  2, 'MW-STD2'),
  level('MW-STD2', 'primary', 'Primary', 'Std 2', 'Standard 2',  3, 'MW-STD3'),
  level('MW-STD3', 'primary', 'Primary', 'Std 3', 'Standard 3',  4, 'MW-STD4'),
  level('MW-STD4', 'primary', 'Primary', 'Std 4', 'Standard 4',  5, 'MW-STD5'),
  level('MW-STD5', 'primary', 'Primary', 'Std 5', 'Standard 5',  6, 'MW-STD6'),
  level('MW-STD6', 'primary', 'Primary', 'Std 6', 'Standard 6',  7, 'MW-STD7'),
  level('MW-STD7', 'primary', 'Primary', 'Std 7', 'Standard 7',  8, 'MW-STD8'),
  level('MW-STD8', 'primary', 'Primary', 'Std 8', 'Standard 8',  9, 'MW-F1', { isCompletionExamStage: true, completionExamName: 'PSLCE' }),
  level('MW-F1', 'lower_secondary', 'Secondary', 'Form 1', 'Form 1', 10, 'MW-F2'),
  level('MW-F2', 'lower_secondary', 'Secondary', 'Form 2', 'Form 2', 11, 'MW-F3', { isCompletionExamStage: true, completionExamName: 'JCE' }),
  level('MW-F3', 'upper_secondary', 'Secondary', 'Form 3', 'Form 3', 12, 'MW-F4'),
  level('MW-F4', 'upper_secondary', 'Secondary', 'Form 4', 'Form 4', 13, null, { isCompletionExamStage: true, completionExamName: 'MSCE' }),
];

const MALAWI: CountryTemplate = {
  countryName: 'Malawi',
  isoCountryCode: 'MW',
  isoCountryCode3: 'MWI',
  region: 'Southern Africa',
  subregion: 'Southern Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['Chichewa'],
  currency: {
    currencyCode: 'MWK',
    currencySymbol: 'MK',
    currencyName: 'Malawian Kwacha',
    currencySubunitName: 'Tambala',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'MK #,###.##',
  },
  educationSystemType: 'standard_form_based',
  systemStructureCode: '8-4',
  prePrimaryEnabled: true,
  levels: malawiLevels,
  stageGroups: [
    stageGroup('MW-ECD',       'ECD',         'pre_primary',     ['MW-ECD'], 1),
    stageGroup('MW-PRIMARY',   'Primary',      'primary',         ['MW-STD1','MW-STD2','MW-STD3','MW-STD4','MW-STD5','MW-STD6','MW-STD7','MW-STD8'], 2),
    stageGroup('MW-SECONDARY', 'Secondary',    'lower_secondary', ['MW-F1','MW-F2'], 3),
    stageGroup('MW-SENIOR-SEC','Secondary',    'upper_secondary', ['MW-F3','MW-F4'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2025/2026',
    academicYearStartMonth: 9,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Learner',
    learnerLabel: 'Learner',
    guardianLabel: 'Guardian',
    parentLabel: 'Guardian',
    payerLabel: 'Guardian',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'Fee Statement',
    receiptLabel: 'Receipt',
    classLabel: 'Standard',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Standard',
    formLabel: 'Form',
    standardLabel: 'Standard',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 14. CAMEROON — Anglophone (CM)
// ============================================================================

const cameroonLevels: EducationLevel[] = [
  level('CM-NUR1', 'pre_primary', 'Nursery', 'Nursery 1', 'Nursery 1', 1, 'CM-NUR2'),
  level('CM-NUR2', 'pre_primary', 'Nursery', 'Nursery 2', 'Nursery 2', 2, 'CM-C1'),
  level('CM-C1', 'primary', 'Primary', 'Class 1', 'Class 1', 3,  'CM-C2'),
  level('CM-C2', 'primary', 'Primary', 'Class 2', 'Class 2', 4,  'CM-C3'),
  level('CM-C3', 'primary', 'Primary', 'Class 3', 'Class 3', 5,  'CM-C4'),
  level('CM-C4', 'primary', 'Primary', 'Class 4', 'Class 4', 6,  'CM-C5'),
  level('CM-C5', 'primary', 'Primary', 'Class 5', 'Class 5', 7,  'CM-C6'),
  level('CM-C6', 'primary', 'Primary', 'Class 6', 'Class 6', 8,  'CM-F1', { isCompletionExamStage: true, completionExamName: 'FSLC' }),
  level('CM-F1', 'lower_secondary', 'Secondary (O-Level)', 'Form 1', 'Form 1',  9, 'CM-F2'),
  level('CM-F2', 'lower_secondary', 'Secondary (O-Level)', 'Form 2', 'Form 2', 10, 'CM-F3'),
  level('CM-F3', 'lower_secondary', 'Secondary (O-Level)', 'Form 3', 'Form 3', 11, 'CM-F4'),
  level('CM-F4', 'lower_secondary', 'Secondary (O-Level)', 'Form 4', 'Form 4', 12, 'CM-F5'),
  level('CM-F5', 'lower_secondary', 'Secondary (O-Level)', 'Form 5', 'Form 5', 13, 'CM-LS', { isCompletionExamStage: true, completionExamName: 'GCE O-Level' }),
  level('CM-LS', 'upper_secondary', 'Advanced Level', 'Lower 6th', 'Lower Sixth', 14, 'CM-US'),
  level('CM-US', 'upper_secondary', 'Advanced Level', 'Upper 6th', 'Upper Sixth', 15, null, { isCompletionExamStage: true, completionExamName: 'GCE A-Level' }),
];

const CAMEROON: CountryTemplate = {
  countryName: 'Cameroon',
  isoCountryCode: 'CM',
  isoCountryCode3: 'CMR',
  region: 'Central Africa',
  subregion: 'Central Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['French'],
  currency: {
    currencyCode: 'XAF',
    currencySymbol: 'FCFA',
    currencyName: 'Central African CFA Franc',
    currencySubunitName: 'Centime',
    symbolPosition: 'after',
    decimalPlaces: 0,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: '#,### FCFA',
  },
  educationSystemType: 'class_form_based',
  systemStructureCode: '6-5-2',
  prePrimaryEnabled: true,
  levels: cameroonLevels,
  stageGroups: [
    stageGroup('CM-NURSERY',  'Nursery',              'pre_primary',     ['CM-NUR1','CM-NUR2'], 1),
    stageGroup('CM-PRIMARY',  'Primary',               'primary',         ['CM-C1','CM-C2','CM-C3','CM-C4','CM-C5','CM-C6'], 2),
    stageGroup('CM-O-LEVEL',  'Secondary (O-Level)',   'lower_secondary', ['CM-F1','CM-F2','CM-F3','CM-F4','CM-F5'], 3),
    stageGroup('CM-A-LEVEL',  'Advanced Level',        'upper_secondary', ['CM-LS','CM-US'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2025/2026',
    academicYearStartMonth: 9,
    termCount: 3,
    defaultTermNames: ['First Term', 'Second Term', 'Third Term'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Pupil',
    learnerLabel: 'Pupil',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'School Fees Invoice',
    receiptLabel: 'Receipt',
    classLabel: 'Class',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Class',
    formLabel: 'Form',
    standardLabel: 'Class',
    headTeacherLabel: 'Principal',
  },
  templateVersion: 1,
  confidence: 'needs_validation',
};

// ============================================================================
// 15. ESWATINI (SZ)
// ============================================================================

const eswatiniLevels: EducationLevel[] = [
  level('SZ-G0', 'pre_primary', 'Pre-Primary',  'Grade 0',  'Grade 0 (Reception)', 1, 'SZ-G1'),
  level('SZ-G1', 'primary', 'Primary', 'Grade 1', 'Grade 1', 2,  'SZ-G2'),
  level('SZ-G2', 'primary', 'Primary', 'Grade 2', 'Grade 2', 3,  'SZ-G3'),
  level('SZ-G3', 'primary', 'Primary', 'Grade 3', 'Grade 3', 4,  'SZ-G4'),
  level('SZ-G4', 'primary', 'Primary', 'Grade 4', 'Grade 4', 5,  'SZ-G5'),
  level('SZ-G5', 'primary', 'Primary', 'Grade 5', 'Grade 5', 6,  'SZ-G6'),
  level('SZ-G6', 'primary', 'Primary', 'Grade 6', 'Grade 6', 7,  'SZ-G7'),
  level('SZ-G7', 'primary', 'Primary', 'Grade 7', 'Grade 7', 8,  'SZ-F1', { isCompletionExamStage: true, completionExamName: 'EPC' }),
  level('SZ-F1', 'lower_secondary', 'Junior Secondary', 'Form 1', 'Form 1',  9, 'SZ-F2'),
  level('SZ-F2', 'lower_secondary', 'Junior Secondary', 'Form 2', 'Form 2', 10, 'SZ-F3'),
  level('SZ-F3', 'lower_secondary', 'Junior Secondary', 'Form 3', 'Form 3', 11, 'SZ-F4', { isCompletionExamStage: true, completionExamName: 'JC' }),
  level('SZ-F4', 'upper_secondary', 'Senior Secondary', 'Form 4', 'Form 4', 12, 'SZ-F5'),
  level('SZ-F5', 'upper_secondary', 'Senior Secondary', 'Form 5', 'Form 5', 13, null, { isCompletionExamStage: true, completionExamName: 'SGCSE' }),
];

const ESWATINI: CountryTemplate = {
  countryName: 'Eswatini',
  isoCountryCode: 'SZ',
  isoCountryCode3: 'SWZ',
  region: 'Southern Africa',
  subregion: 'Southern Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['siSwati'],
  currency: {
    currencyCode: 'SZL',
    currencySymbol: 'E',
    currencyName: 'Swazi Lilangeni',
    currencySubunitName: 'Cent',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'E #,###.##',
  },
  educationSystemType: 'grade_form_based',
  systemStructureCode: '7-3-2',
  prePrimaryEnabled: true,
  levels: eswatiniLevels,
  stageGroups: [
    stageGroup('SZ-PRE-PRIMARY', 'Pre-Primary',       'pre_primary',     ['SZ-G0'], 1),
    stageGroup('SZ-PRIMARY',     'Primary',            'primary',         ['SZ-G1','SZ-G2','SZ-G3','SZ-G4','SZ-G5','SZ-G6','SZ-G7'], 2),
    stageGroup('SZ-JUNIOR-SEC',  'Junior Secondary',   'lower_secondary', ['SZ-F1','SZ-F2','SZ-F3'], 3),
    stageGroup('SZ-SENIOR-SEC',  'Senior Secondary',   'upper_secondary', ['SZ-F4','SZ-F5'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 1,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Learner',
    learnerLabel: 'Learner',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'Fee Statement',
    receiptLabel: 'Receipt',
    classLabel: 'Grade',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Grade',
    formLabel: 'Form',
    standardLabel: 'Grade',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 16. THE GAMBIA (GM)
// ============================================================================

const gambiaLevels: EducationLevel[] = [
  level('GM-ECD1', 'pre_primary', 'ECD', 'ECD 1', 'Early Childhood Development 1', 1, 'GM-ECD2'),
  level('GM-ECD2', 'pre_primary', 'ECD', 'ECD 2', 'Early Childhood Development 2', 2, 'GM-ECD3'),
  level('GM-ECD3', 'pre_primary', 'ECD', 'ECD 3', 'Early Childhood Development 3', 3, 'GM-G1'),
  level('GM-G1',  'primary', 'Lower Basic', 'Grade 1', 'Grade 1',  4, 'GM-G2'),
  level('GM-G2',  'primary', 'Lower Basic', 'Grade 2', 'Grade 2',  5, 'GM-G3'),
  level('GM-G3',  'primary', 'Lower Basic', 'Grade 3', 'Grade 3',  6, 'GM-G4'),
  level('GM-G4',  'primary', 'Lower Basic', 'Grade 4', 'Grade 4',  7, 'GM-G5'),
  level('GM-G5',  'primary', 'Lower Basic', 'Grade 5', 'Grade 5',  8, 'GM-G6'),
  level('GM-G6',  'primary', 'Lower Basic', 'Grade 6', 'Grade 6',  9, 'GM-G7'),
  level('GM-G7',  'lower_secondary', 'Upper Basic', 'Grade 7', 'Grade 7', 10, 'GM-G8'),
  level('GM-G8',  'lower_secondary', 'Upper Basic', 'Grade 8', 'Grade 8', 11, 'GM-G9'),
  level('GM-G9',  'lower_secondary', 'Upper Basic', 'Grade 9', 'Grade 9', 12, 'GM-G10', { isCompletionExamStage: true, completionExamName: 'GABECE' }),
  level('GM-G10', 'upper_secondary', 'Senior Secondary', 'Grade 10', 'Grade 10', 13, 'GM-G11'),
  level('GM-G11', 'upper_secondary', 'Senior Secondary', 'Grade 11', 'Grade 11', 14, 'GM-G12'),
  level('GM-G12', 'upper_secondary', 'Senior Secondary', 'Grade 12', 'Grade 12', 15, null, { isCompletionExamStage: true, completionExamName: 'WASSCE' }),
];

const THE_GAMBIA: CountryTemplate = {
  countryName: 'The Gambia',
  isoCountryCode: 'GM',
  isoCountryCode3: 'GMB',
  region: 'West Africa',
  subregion: 'West Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: [],
  currency: {
    currencyCode: 'GMD',
    currencySymbol: 'D',
    currencyName: 'Gambian Dalasi',
    currencySubunitName: 'Butut',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'D #,###.##',
  },
  educationSystemType: 'grade_based',
  systemStructureCode: '6-3-3',
  prePrimaryEnabled: true,
  levels: gambiaLevels,
  stageGroups: [
    stageGroup('GM-ECD',        'ECD',               'pre_primary',     ['GM-ECD1','GM-ECD2','GM-ECD3'], 1),
    stageGroup('GM-LOWER-BASIC','Lower Basic',        'primary',         ['GM-G1','GM-G2','GM-G3','GM-G4','GM-G5','GM-G6'], 2),
    stageGroup('GM-UPPER-BASIC','Upper Basic',        'lower_secondary', ['GM-G7','GM-G8','GM-G9'], 3),
    stageGroup('GM-SENIOR-SEC', 'Senior Secondary',   'upper_secondary', ['GM-G10','GM-G11','GM-G12'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2025/2026',
    academicYearStartMonth: 9,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Pupil',
    learnerLabel: 'Pupil',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'Fee Note',
    receiptLabel: 'Receipt',
    classLabel: 'Grade',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Grade',
    formLabel: 'Grade',
    standardLabel: 'Grade',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'needs_validation',
};

// ============================================================================
// 17. LESOTHO (LS)
// ============================================================================

const lesothoLevels: EducationLevel[] = [
  level('LS-REC', 'pre_primary', 'Pre-Primary', 'Reception', 'Reception', 1, 'LS-G1'),
  level('LS-G1', 'primary', 'Primary', 'Grade 1', 'Grade 1', 2,  'LS-G2'),
  level('LS-G2', 'primary', 'Primary', 'Grade 2', 'Grade 2', 3,  'LS-G3'),
  level('LS-G3', 'primary', 'Primary', 'Grade 3', 'Grade 3', 4,  'LS-G4'),
  level('LS-G4', 'primary', 'Primary', 'Grade 4', 'Grade 4', 5,  'LS-G5'),
  level('LS-G5', 'primary', 'Primary', 'Grade 5', 'Grade 5', 6,  'LS-G6'),
  level('LS-G6', 'primary', 'Primary', 'Grade 6', 'Grade 6', 7,  'LS-G7'),
  level('LS-G7', 'primary', 'Primary', 'Grade 7', 'Grade 7', 8,  'LS-FA', { isCompletionExamStage: true, completionExamName: 'PSLE' }),
  level('LS-FA', 'lower_secondary', 'Junior Secondary', 'Form A', 'Form A',  9, 'LS-FB'),
  level('LS-FB', 'lower_secondary', 'Junior Secondary', 'Form B', 'Form B', 10, 'LS-FC'),
  level('LS-FC', 'lower_secondary', 'Junior Secondary', 'Form C', 'Form C', 11, 'LS-FD', { isCompletionExamStage: true, completionExamName: 'JC' }),
  level('LS-FD', 'upper_secondary', 'Senior Secondary', 'Form D', 'Form D', 12, 'LS-FE'),
  level('LS-FE', 'upper_secondary', 'Senior Secondary', 'Form E', 'Form E', 13, null, { isCompletionExamStage: true, completionExamName: 'LGCSE' }),
];

const LESOTHO: CountryTemplate = {
  countryName: 'Lesotho',
  isoCountryCode: 'LS',
  isoCountryCode3: 'LSO',
  region: 'Southern Africa',
  subregion: 'Southern Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['Sesotho'],
  currency: {
    currencyCode: 'LSL',
    currencySymbol: 'M',
    currencyName: 'Lesotho Loti',
    currencySubunitName: 'Lisente',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'M #,###.##',
  },
  educationSystemType: 'grade_form_based',
  systemStructureCode: '7-3-2',
  prePrimaryEnabled: true,
  levels: lesothoLevels,
  stageGroups: [
    stageGroup('LS-PRE-PRIMARY', 'Pre-Primary',       'pre_primary',     ['LS-REC'], 1),
    stageGroup('LS-PRIMARY',     'Primary',            'primary',         ['LS-G1','LS-G2','LS-G3','LS-G4','LS-G5','LS-G6','LS-G7'], 2),
    stageGroup('LS-JUNIOR-SEC',  'Junior Secondary',   'lower_secondary', ['LS-FA','LS-FB','LS-FC'], 3),
    stageGroup('LS-SENIOR-SEC',  'Senior Secondary',   'upper_secondary', ['LS-FD','LS-FE'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 1,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Learner',
    learnerLabel: 'Learner',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Progress Report',
    invoiceLabel: 'Fee Statement',
    receiptLabel: 'Receipt',
    classLabel: 'Grade',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Grade',
    formLabel: 'Form',
    standardLabel: 'Grade',
    headTeacherLabel: 'Principal',
  },
  templateVersion: 1,
  confidence: 'verified',
};

// ============================================================================
// 18. LIBERIA (LR)
// ============================================================================

const liberiaLevels: EducationLevel[] = [
  level('LR-K1', 'pre_primary', 'Kindergarten', 'K1', 'Kindergarten 1', 1, 'LR-K2'),
  level('LR-K2', 'pre_primary', 'Kindergarten', 'K2', 'Kindergarten 2', 2, 'LR-G1'),
  level('LR-G1',  'primary', 'Elementary', 'Grade 1',  'Grade 1',   3, 'LR-G2'),
  level('LR-G2',  'primary', 'Elementary', 'Grade 2',  'Grade 2',   4, 'LR-G3'),
  level('LR-G3',  'primary', 'Elementary', 'Grade 3',  'Grade 3',   5, 'LR-G4'),
  level('LR-G4',  'primary', 'Elementary', 'Grade 4',  'Grade 4',   6, 'LR-G5'),
  level('LR-G5',  'primary', 'Elementary', 'Grade 5',  'Grade 5',   7, 'LR-G6'),
  level('LR-G6',  'primary', 'Elementary', 'Grade 6',  'Grade 6',   8, 'LR-G7'),
  level('LR-G7',  'lower_secondary', 'Junior High', 'Grade 7',  'Grade 7',   9, 'LR-G8'),
  level('LR-G8',  'lower_secondary', 'Junior High', 'Grade 8',  'Grade 8',  10, 'LR-G9'),
  level('LR-G9',  'lower_secondary', 'Junior High', 'Grade 9',  'Grade 9',  11, 'LR-G10'),
  level('LR-G10', 'upper_secondary', 'Senior High', 'Grade 10', 'Grade 10', 12, 'LR-G11'),
  level('LR-G11', 'upper_secondary', 'Senior High', 'Grade 11', 'Grade 11', 13, 'LR-G12'),
  level('LR-G12', 'upper_secondary', 'Senior High', 'Grade 12', 'Grade 12', 14, null, { isCompletionExamStage: true, completionExamName: 'WASSCE' }),
];

const LIBERIA: CountryTemplate = {
  countryName: 'Liberia',
  isoCountryCode: 'LR',
  isoCountryCode3: 'LBR',
  region: 'West Africa',
  subregion: 'West Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: [],
  currency: {
    currencyCode: 'LRD',
    currencySymbol: 'L$',
    currencyName: 'Liberian Dollar',
    currencySubunitName: 'Cent',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'L$ #,###.##',
  },
  educationSystemType: 'grade_based',
  systemStructureCode: '2-6-3-3',
  prePrimaryEnabled: true,
  levels: liberiaLevels,
  stageGroups: [
    stageGroup('LR-KG',          'Kindergarten',  'pre_primary',     ['LR-K1','LR-K2'], 1),
    stageGroup('LR-ELEMENTARY',  'Elementary',    'primary',         ['LR-G1','LR-G2','LR-G3','LR-G4','LR-G5','LR-G6'], 2),
    stageGroup('LR-JUNIOR-HIGH', 'Junior High',   'lower_secondary', ['LR-G7','LR-G8','LR-G9'], 3),
    stageGroup('LR-SENIOR-HIGH', 'Senior High',   'upper_secondary', ['LR-G10','LR-G11','LR-G12'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2025/2026',
    academicYearStartMonth: 9,
    termCount: 2,
    defaultTermNames: ['Semester 1', 'Semester 2'],
    semesterSupport: true,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Student',
    learnerLabel: 'Student',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'Tuition',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'Tuition Invoice',
    receiptLabel: 'Receipt',
    classLabel: 'Grade',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Grade',
    formLabel: 'Grade',
    standardLabel: 'Grade',
    headTeacherLabel: 'Principal',
  },
  templateVersion: 1,
  confidence: 'needs_validation',
};

// ============================================================================
// 19. SEYCHELLES (SC)
// ============================================================================

const seychellesLevels: EducationLevel[] = [
  level('SC-CRE', 'pre_primary', 'Pre-Primary', 'Crèche', 'Crèche', 1, 'SC-P1'),
  level('SC-P1', 'primary', 'Primary', 'P1', 'Primary 1', 2,  'SC-P2'),
  level('SC-P2', 'primary', 'Primary', 'P2', 'Primary 2', 3,  'SC-P3'),
  level('SC-P3', 'primary', 'Primary', 'P3', 'Primary 3', 4,  'SC-P4'),
  level('SC-P4', 'primary', 'Primary', 'P4', 'Primary 4', 5,  'SC-P5'),
  level('SC-P5', 'primary', 'Primary', 'P5', 'Primary 5', 6,  'SC-P6'),
  level('SC-P6', 'primary', 'Primary', 'P6', 'Primary 6', 7,  'SC-S1', { isCompletionExamStage: true, completionExamName: 'National Primary Certificate' }),
  level('SC-S1', 'lower_secondary', 'Secondary', 'S1', 'Secondary 1',  8, 'SC-S2'),
  level('SC-S2', 'lower_secondary', 'Secondary', 'S2', 'Secondary 2',  9, 'SC-S3'),
  level('SC-S3', 'lower_secondary', 'Secondary', 'S3', 'Secondary 3', 10, 'SC-S4'),
  level('SC-S4', 'upper_secondary', 'Secondary', 'S4', 'Secondary 4', 11, 'SC-S5'),
  level('SC-S5', 'upper_secondary', 'Secondary', 'S5', 'Secondary 5', 12, null, { isCompletionExamStage: true, completionExamName: 'IGCSE' }),
];

const SEYCHELLES: CountryTemplate = {
  countryName: 'Seychelles',
  isoCountryCode: 'SC',
  isoCountryCode3: 'SYC',
  region: 'East Africa',
  subregion: 'Indian Ocean',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['French', 'Seselwa Creole'],
  currency: {
    currencyCode: 'SCR',
    currencySymbol: 'SR',
    currencyName: 'Seychellois Rupee',
    currencySubunitName: 'Cent',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'SR #,###.##',
  },
  educationSystemType: 'primary_secondary',
  systemStructureCode: '6-5-2',
  prePrimaryEnabled: true,
  levels: seychellesLevels,
  stageGroups: [
    stageGroup('SC-PRE-PRIMARY', 'Pre-Primary', 'pre_primary',     ['SC-CRE'], 1),
    stageGroup('SC-PRIMARY',     'Primary',      'primary',         ['SC-P1','SC-P2','SC-P3','SC-P4','SC-P5','SC-P6'], 2),
    stageGroup('SC-LOWER-SEC',   'Secondary',    'lower_secondary', ['SC-S1','SC-S2','SC-S3'], 3),
    stageGroup('SC-UPPER-SEC',   'Secondary',    'upper_secondary', ['SC-S4','SC-S5'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 1,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Student',
    learnerLabel: 'Student',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Progress Report',
    invoiceLabel: 'Fee Invoice',
    receiptLabel: 'Receipt',
    classLabel: 'Class',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Primary',
    formLabel: 'Secondary',
    standardLabel: 'Primary',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'needs_validation',
};

// ============================================================================
// 20. SIERRA LEONE (SL)
// ============================================================================

const sierraLeoneLevels: EducationLevel[] = [
  level('SL-ECD', 'pre_primary', 'Pre-Primary', 'ECD', 'Early Childhood Development', 1, 'SL-C1'),
  level('SL-C1', 'primary', 'Primary', 'Class 1', 'Class 1', 2,  'SL-C2'),
  level('SL-C2', 'primary', 'Primary', 'Class 2', 'Class 2', 3,  'SL-C3'),
  level('SL-C3', 'primary', 'Primary', 'Class 3', 'Class 3', 4,  'SL-C4'),
  level('SL-C4', 'primary', 'Primary', 'Class 4', 'Class 4', 5,  'SL-C5'),
  level('SL-C5', 'primary', 'Primary', 'Class 5', 'Class 5', 6,  'SL-C6'),
  level('SL-C6', 'primary', 'Primary', 'Class 6', 'Class 6', 7,  'SL-JSS1', { isCompletionExamStage: true, completionExamName: 'NPSE' }),
  level('SL-JSS1', 'lower_secondary', 'Junior Secondary', 'JSS 1', 'Junior Secondary 1',  8, 'SL-JSS2'),
  level('SL-JSS2', 'lower_secondary', 'Junior Secondary', 'JSS 2', 'Junior Secondary 2',  9, 'SL-JSS3'),
  level('SL-JSS3', 'lower_secondary', 'Junior Secondary', 'JSS 3', 'Junior Secondary 3', 10, 'SL-SSS1', { isCompletionExamStage: true, completionExamName: 'BECE' }),
  level('SL-SSS1', 'upper_secondary', 'Senior Secondary', 'SSS 1', 'Senior Secondary 1', 11, 'SL-SSS2'),
  level('SL-SSS2', 'upper_secondary', 'Senior Secondary', 'SSS 2', 'Senior Secondary 2', 12, 'SL-SSS3'),
  level('SL-SSS3', 'upper_secondary', 'Senior Secondary', 'SSS 3', 'Senior Secondary 3', 13, 'SL-SSS4'),
  level('SL-SSS4', 'upper_secondary', 'Senior Secondary', 'SSS 4', 'Senior Secondary 4', 14, null, { isCompletionExamStage: true, completionExamName: 'WASSCE' }),
];

const SIERRA_LEONE: CountryTemplate = {
  countryName: 'Sierra Leone',
  isoCountryCode: 'SL',
  isoCountryCode3: 'SLE',
  region: 'West Africa',
  subregion: 'West Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['Krio'],
  currency: {
    currencyCode: 'SLE',
    currencySymbol: 'Le',
    currencyName: 'Sierra Leonean Leone (New)',
    currencySubunitName: 'Cent',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'Le #,###.##',
  },
  educationSystemType: 'primary_jss_sss',
  systemStructureCode: '6-3-4',
  prePrimaryEnabled: true,
  levels: sierraLeoneLevels,
  stageGroups: [
    stageGroup('SL-PRE-PRIMARY', 'Pre-Primary',       'pre_primary',     ['SL-ECD'], 1),
    stageGroup('SL-PRIMARY',     'Primary',            'primary',         ['SL-C1','SL-C2','SL-C3','SL-C4','SL-C5','SL-C6'], 2),
    stageGroup('SL-JUNIOR-SEC',  'Junior Secondary',   'lower_secondary', ['SL-JSS1','SL-JSS2','SL-JSS3'], 3),
    stageGroup('SL-SENIOR-SEC',  'Senior Secondary',   'upper_secondary', ['SL-SSS1','SL-SSS2','SL-SSS3','SL-SSS4'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2025/2026',
    academicYearStartMonth: 9,
    termCount: 3,
    defaultTermNames: ['First Term', 'Second Term', 'Third Term'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Pupil',
    learnerLabel: 'Pupil',
    guardianLabel: 'Parent',
    parentLabel: 'Parent',
    payerLabel: 'Parent',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'Fee Note',
    receiptLabel: 'Receipt',
    classLabel: 'Class',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Class',
    formLabel: 'JSS/SSS',
    standardLabel: 'Class',
    headTeacherLabel: 'Principal',
  },
  templateVersion: 1,
  confidence: 'needs_validation',
};

// ============================================================================
// 21. SOUTH SUDAN (SS)
// ============================================================================

const southSudanLevels: EducationLevel[] = [
  level('SS-ECD1', 'pre_primary', 'ECD', 'ECD 1', 'Early Childhood Development 1', 1, 'SS-ECD2'),
  level('SS-ECD2', 'pre_primary', 'ECD', 'ECD 2', 'Early Childhood Development 2', 2, 'SS-ECD3'),
  level('SS-ECD3', 'pre_primary', 'ECD', 'ECD 3', 'Early Childhood Development 3', 3, 'SS-P1'),
  level('SS-P1', 'primary', 'Primary', 'P1', 'Primary 1',  4, 'SS-P2'),
  level('SS-P2', 'primary', 'Primary', 'P2', 'Primary 2',  5, 'SS-P3'),
  level('SS-P3', 'primary', 'Primary', 'P3', 'Primary 3',  6, 'SS-P4'),
  level('SS-P4', 'primary', 'Primary', 'P4', 'Primary 4',  7, 'SS-P5'),
  level('SS-P5', 'primary', 'Primary', 'P5', 'Primary 5',  8, 'SS-P6'),
  level('SS-P6', 'primary', 'Primary', 'P6', 'Primary 6',  9, 'SS-P7'),
  level('SS-P7', 'primary', 'Primary', 'P7', 'Primary 7', 10, 'SS-P8'),
  level('SS-P8', 'primary', 'Primary', 'P8', 'Primary 8', 11, 'SS-S1', { isCompletionExamStage: true, completionExamName: 'PLE' }),
  level('SS-S1', 'lower_secondary', 'Secondary', 'S1', 'Senior 1', 12, 'SS-S2'),
  level('SS-S2', 'lower_secondary', 'Secondary', 'S2', 'Senior 2', 13, 'SS-S3'),
  level('SS-S3', 'upper_secondary', 'Secondary', 'S3', 'Senior 3', 14, 'SS-S4'),
  level('SS-S4', 'upper_secondary', 'Secondary', 'S4', 'Senior 4', 15, null, { isCompletionExamStage: true, completionExamName: 'SSLCE' }),
];

const SOUTH_SUDAN: CountryTemplate = {
  countryName: 'South Sudan',
  isoCountryCode: 'SS',
  isoCountryCode3: 'SSD',
  region: 'East Africa',
  subregion: 'East Africa',
  primaryErpLanguage: 'English',
  additionalSupportedLanguages: ['Arabic'],
  currency: {
    currencyCode: 'SSP',
    currencySymbol: 'SS£',
    currencyName: 'South Sudanese Pound',
    currencySubunitName: 'Piaster',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    defaultDisplayFormat: 'SS£ #,###.##',
  },
  educationSystemType: 'primary_senior_based',
  systemStructureCode: '8-4',
  prePrimaryEnabled: true,
  levels: southSudanLevels,
  stageGroups: [
    stageGroup('SS-ECD',       'ECD',        'pre_primary',     ['SS-ECD1','SS-ECD2','SS-ECD3'], 1),
    stageGroup('SS-PRIMARY',   'Primary',     'primary',         ['SS-P1','SS-P2','SS-P3','SS-P4','SS-P5','SS-P6','SS-P7','SS-P8'], 2),
    stageGroup('SS-LOWER-SEC', 'Secondary',   'lower_secondary', ['SS-S1','SS-S2'], 3),
    stageGroup('SS-UPPER-SEC', 'Secondary',   'upper_secondary', ['SS-S3','SS-S4'], 4),
  ],
  calendar: {
    academicYearLabelStyle: '2026',
    academicYearStartMonth: 2,
    termCount: 3,
    defaultTermNames: ['Term 1', 'Term 2', 'Term 3'],
    semesterSupport: false,
    progressionLogic: 'annual',
    defaultPromotionBoundary: 'end_of_year',
  },
  terminology: {
    studentLabel: 'Pupil',
    learnerLabel: 'Pupil',
    guardianLabel: 'Guardian',
    parentLabel: 'Guardian',
    payerLabel: 'Guardian',
    feeLabel: 'School Fees',
    reportCardLabel: 'Report Card',
    invoiceLabel: 'Fee Statement',
    receiptLabel: 'Receipt',
    classLabel: 'Class',
    streamLabel: 'Stream',
    sectionLabel: 'Section',
    gradeLabel: 'Primary',
    formLabel: 'Senior',
    standardLabel: 'Primary',
    headTeacherLabel: 'Head Teacher',
  },
  templateVersion: 1,
  confidence: 'needs_validation',
};


// ============================================================================
// COUNTRY TEMPLATE REGISTRY
// ============================================================================

/**
 * Master registry of all country templates, keyed by ISO 3166-1 alpha-2 code.
 *
 * Usage:
 *   const template = COUNTRY_TEMPLATES['UG'];
 *   const levels = template.levels;
 *   const currency = template.currency;
 */
export const COUNTRY_TEMPLATES: Record<string, CountryTemplate> = {
  UG: UGANDA,
  KE: KENYA,
  TZ: TANZANIA,
  RW: RWANDA,
  ZA: SOUTH_AFRICA,
  GH: GHANA,
  BW: BOTSWANA,
  NA: NAMIBIA,
  ZM: ZAMBIA,
  MU: MAURITIUS,
  NG: NIGERIA,
  ZW: ZIMBABWE,
  MW: MALAWI,
  CM: CAMEROON,
  SZ: ESWATINI,
  GM: THE_GAMBIA,
  LS: LESOTHO,
  LR: LIBERIA,
  SC: SEYCHELLES,
  SL: SIERRA_LEONE,
  SS: SOUTH_SUDAN,
};

/**
 * Phase 1 countries — high confidence, verified templates.
 * These should be enabled for production use first.
 */
export const PHASE_1_COUNTRY_CODES = ['UG', 'KE', 'TZ', 'RW', 'ZA', 'GH', 'BW', 'NA', 'ZM', 'MU'] as const;

/**
 * Phase 2 countries — require additional validation before production use.
 */
export const PHASE_2_COUNTRY_CODES = ['NG', 'ZW', 'MW', 'CM', 'SL', 'SZ', 'GM', 'LS', 'LR', 'SS', 'SC'] as const;

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

/** Get a country template by ISO code. Returns undefined if not found. */
export function getCountryTemplate(isoCode: string): CountryTemplate | undefined {
  return COUNTRY_TEMPLATES[isoCode.toUpperCase()];
}

/** Get all templates for a given phase. */
export function getPhaseTemplates(phase: 1 | 2): CountryTemplate[] {
  const codes = phase === 1 ? PHASE_1_COUNTRY_CODES : PHASE_2_COUNTRY_CODES;
  return codes.map(code => COUNTRY_TEMPLATES[code]);
}

/** Get sorted country list for dropdown display. */
export function getCountryList(): Array<{ isoCode: string; name: string; currencyCode: string; confidence: string }> {
  return Object.entries(COUNTRY_TEMPLATES)
    .map(([isoCode, t]) => ({
      isoCode,
      name: t.countryName,
      currencyCode: t.currency.currencyCode,
      confidence: t.confidence,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Get the education levels for a country, optionally filtered by stage. */
export function getCountryLevels(
  isoCode: string,
  stage?: EducationLevel['stage']
): EducationLevel[] {
  const template = getCountryTemplate(isoCode);
  if (!template) return [];
  if (!stage) return template.levels;
  return template.levels.filter(l => l.stage === stage);
}

/** Get the next level in the progression chain. */
export function getNextLevel(
  isoCode: string,
  currentLevelId: string
): EducationLevel | null {
  const template = getCountryTemplate(isoCode);
  if (!template) return null;
  const current = template.levels.find(l => l.levelId === currentLevelId);
  if (!current || !current.nextLevelId) return null;
  return template.levels.find(l => l.levelId === current.nextLevelId) ?? null;
}

/**
 * Format a monetary amount using the country template's currency rules.
 *
 * @param amount    The numeric amount
 * @param isoCode   ISO country code
 * @param context   Display context determining symbol vs code usage
 * @returns         Formatted string, e.g. "USh 1,500,000" or "UGX 1,500,000"
 */
export function formatCurrency(
  amount: number,
  isoCode: string,
  context: 'dashboard' | 'invoice' | 'statement' | 'pdf_print' | 'ledger' = 'dashboard'
): string {
  const template = getCountryTemplate(isoCode);
  if (!template) return amount.toFixed(2);

  const { currencyCode, currencySymbol, symbolPosition, decimalPlaces, thousandSeparator } = template.currency;

  // Use symbol for dashboard/statement, code for invoice/pdf/ledger
  const useCode = context === 'invoice' || context === 'pdf_print' || context === 'ledger';
  const prefix = useCode ? currencyCode : currencySymbol;

  // Format number
  const fixed = decimalPlaces === 0 ? Math.round(amount).toString() : amount.toFixed(decimalPlaces);
  const [intPart, decPart] = fixed.split('.');
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  const formatted = decPart ? `${withSeparators}.${decPart}` : withSeparators;

  return symbolPosition === 'before'
    ? `${prefix} ${formatted}`
    : `${formatted} ${prefix}`;
}

/** Resolve a terminology label for a country, with optional institution override. */
export function resolveTerminology(
  isoCode: string,
  key: keyof CountryTemplate['terminology'],
  institutionOverrides?: Record<string, string>
): string {
  // Institution override takes priority
  if (institutionOverrides?.[key]) return institutionOverrides[key];

  const template = getCountryTemplate(isoCode);
  if (!template) return key;

  return template.terminology[key];
}
