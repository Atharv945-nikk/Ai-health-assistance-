/**
 * Shared Type Definitions for AI Healthcare Assistant
 * Used across Frontend, Backend, and Test Suites
 */

export type UserRole = 'patient' | 'doctor' | 'admin';

export type LanguageCode = 'en' | 'hi' | 'mr';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  preferredLanguage: LanguageCode;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Allergy {
  id: string;
  healthProfileId: string;
  allergen: string;
  reaction?: string;
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylactic';
  diagnosedYear?: number;
}

export interface HealthCondition {
  id: string;
  healthProfileId: string;
  conditionName: string;
  status: 'active' | 'managed' | 'resolved';
  diagnosedDate?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  healthProfileId: string;
  medicineName: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  isCurrent: boolean;
}

export interface HealthProfile {
  id: string;
  userId: string;
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
  smokingStatus?: string;
  alcoholStatus?: string;
  dietaryPreferences?: string;
  allergies: Allergy[];
  conditions: HealthCondition[];
  medications: Medication[];
  createdAt: string;
  updatedAt: string;
}

export interface Citation {
  id: string;
  title: string;
  organization: string;
  sourceUrl?: string;
  publicationDate?: string;
  evidenceLevel: 'A' | 'B' | 'C';
  snippet: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages?: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export type UrgencyLevel = 'self_care' | 'routine' | 'prompt' | 'urgent' | 'emergency';

export interface SymptomAssessmentResult {
  symptomsUnderstood: string[];
  possibleExplanations: Array<{
    name: string;
    description: string;
    likelihood: 'low' | 'moderate' | 'high';
    supportingFactors: string[];
  }>;
  supportingFactors: string[];
  factorsRequiringAttention: string[];
  missingInformation: string[];
  generalNextSteps: string[];
  whenToSeekCare: string;
  emergencyWarningSigns: string[];
  disclaimer: string;
  urgencyLevel: UrgencyLevel;
  isEmergency: boolean;
}

export interface WhyConditionResult {
  conditionName: string;
  simpleExplanation: string;
  biologicalMechanism: string;
  contributingFactors: string[];
  riskFactors: string[];
  supportingFindings: string[];
  findingsRequiringEvaluation: string[];
  cannotBeConcluded: string[];
  disclaimer: string;
}

export interface LabValue {
  name: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
  interpretation?: string;
}

export interface ReportSummary {
  shortSummary: string;
  detailedSummary: string;
  patientInfo?: {
    name?: string;
    date?: string;
    facility?: string;
  };
  testName: string;
  labValues: LabValue[];
  normalFindings: string[];
  abnormalFindings: string[];
  impression: string;
  questionsForDoctor: string[];
  explainedMedicalTerms: Array<{ term: string; explanation: string }>;
  disclaimer: string;
}

export interface MedicalReport {
  id: string;
  userId: string;
  filename: string;
  fileType: string;
  fileSizeBytes: number;
  status: 'processing' | 'analyzed' | 'failed';
  extractedText?: string;
  summary?: ReportSummary;
  createdAt: string;
}

export interface MedicalImageAnalysis {
  id: string;
  imageId: string;
  modality: 'xray' | 'mri' | 'ct' | 'dermatology' | 'ultrasound' | 'other';
  bodyPart: string;
  observations: string[];
  possibleAbnormalities: string[];
  confidenceScore: number;
  limitations: string[];
  urgency: UrgencyLevel;
  recommendations: string[];
  disclaimer: string;
  createdAt: string;
}

export interface MedicalImage {
  id: string;
  userId: string;
  filename: string;
  fileType: string;
  fileSizeBytes: number;
  modality: string;
  bodyPart?: string;
  analysis?: MedicalImageAnalysis;
  createdAt: string;
}

export interface MedicineInfo {
  id: string;
  genericName: string;
  brandNames: string[];
  commonUses: string[];
  mechanismOfAction: string;
  commonSideEffects: string[];
  seriousSideEffects: string[];
  precautions: string[];
  commonInteractions: string[];
  storageAdvice: string;
  generalWarnings: string[];
  whenToContactDoctor: string[];
  sources: Citation[];
  updatedAt: string;
}

export interface HealthMemory {
  id: string;
  userId: string;
  category: 'symptom_history' | 'medication_reaction' | 'preference' | 'clinical_note';
  memoryText: string;
  sourceReference?: string;
  createdAt: string;
}

export interface SystemAuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface SystemMetrics {
  uptimeSeconds: number;
  totalUsers: number;
  totalReports: number;
  totalImages: number;
  totalConversations: number;
  totalEmergenciesDetected: number;
  aiProviderActive: string;
  databaseStatus: 'connected' | 'degraded' | 'error';
  vectorStoreStatus: 'connected' | 'degraded' | 'error';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    requestId?: string;
    timestamp: string;
  };
}
