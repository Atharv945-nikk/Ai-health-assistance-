import { symptomService } from '../src/services/symptomService.js';
import { ragService } from '../src/ai/ragService.js';
import { medicineService } from '../src/services/medicineService.js';
import { authService } from '../src/services/authService.js';
import { v4 as uuidv4 } from 'uuid';

export async function runSymptomsAndRAGTests(): Promise<{ passed: number; failed: number }> {
  console.log('\n--- Running Symptom Assessment, "Why This Disease?", & RAG Evidence Tests ---');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  // Register test user to satisfy foreign key constraints
  const testUser = await authService.register({
    email: `symptom_tester_${uuidv4().slice(0, 8)}@test.local`,
    password: 'Password123!',
    fullName: 'Symptom Tester',
  });

  // 1. Symptom Assessment
  const assessment = symptomService.analyzeSymptoms(testUser.user.id, {
    symptoms: 'dry cough, sore throat, mild body aches for 2 days',
    duration: '2 days',
    severityScale: 4,
    age: 32,
  });

  assert(assessment.isEmergency === false, 'Non-emergency symptom cluster marked non-emergency');
  assert(assessment.urgencyLevel === 'routine' || assessment.urgencyLevel === 'prompt', 'Urgency assigned accurately');
  assert(assessment.possibleExplanations.length > 0, 'Differential explanations provided');
  assert(assessment.disclaimer.length > 0, 'Clinical disclaimer attached');

  // 2. "Why This Condition?" Clinical Explanation
  const whyResult = symptomService.explainWhyCondition('Type 2 Diabetes Mellitus', 'fatigue and frequent urination');
  assert(whyResult.conditionName.includes('Diabetes'), 'Condition identified in response');
  assert(whyResult.biologicalMechanism.length > 20, 'Biological mechanism articulated');
  assert(whyResult.riskFactors.length > 0, 'Risk factors provided');
  assert(whyResult.cannotBeConcluded.length > 0, 'Explicit boundaries of what cannot be concluded present');

  // 3. Dual RAG Retrieval over Authoritative Global Corpus
  const ragResult = await ragService.retrieveRelevantContext('hypertension blood pressure guidelines', undefined, { topK: 2 });
  assert(ragResult.chunks.length > 0, 'Retrieved authoritative medical chunks from RAG index');
  assert(ragResult.citations.length > 0, 'Citations populated with metadata');
  assert(Boolean(ragResult.citations[0].organization), 'Citation references official medical organization');

  // 4. Medicine Pharmacopeia Lookup
  const medSearch = medicineService.searchMedicines('amoxicillin');
  assert(medSearch.length > 0, 'Found Amoxicillin in pharmacopeia');
  const monograph = medicineService.getMedicineByName('Paracetamol');
  assert(monograph.genericName.includes('Paracetamol'), 'Retrieved monograph for Paracetamol');
  assert(monograph.sources.length > 0, 'Authoritative citation attached to drug monograph');

  return { passed, failed };
}
