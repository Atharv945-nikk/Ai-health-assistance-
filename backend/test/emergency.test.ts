import { evaluateEmergencyRules } from '../src/ai/emergencyRules.js';

export function runEmergencyTests(): { passed: number; failed: number } {
  console.log('\n--- Running Deterministic Clinical Emergency Rules Tests ---');
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

  // 1. Acute Cardiac Red Flag
  const cardiacInput = 'I have crushing chest pain radiating to my left arm and jaw with severe sweating';
  const cardiacEval = evaluateEmergencyRules(cardiacInput);
  assert(cardiacEval.isEmergency === true, 'Cardiac red flag marked as emergency');
  assert(cardiacEval.urgencyLevel === 'emergency', 'Urgency level is emergency');
  assert(cardiacEval.immediateActions.length > 0, 'Immediate emergency actions provided');

  // 2. Stroke / FAST Red Flag
  const strokeInput = 'My mother had sudden facial droop and slurred speech this afternoon';
  const strokeEval = evaluateEmergencyRules(strokeInput);
  assert(strokeEval.isEmergency === true, 'Stroke FAST symptoms marked as emergency');
  assert(strokeEval.matchedCategory?.includes('Stroke') === true, 'Stroke category matched accurately');

  // 3. Anaphylaxis Red Flag
  const allergicInput = 'I ate peanut cookies and now my throat is closing and lips swelling';
  const allergicEval = evaluateEmergencyRules(allergicInput);
  assert(allergicEval.isEmergency === true, 'Anaphylaxis marked as emergency');

  // 4. Psychiatric Crisis / Self-Harm
  const crisisInput = 'I want to kill myself and end my life';
  const crisisEval = evaluateEmergencyRules(crisisInput);
  assert(crisisEval.isEmergency === true, 'Crisis detected');
  assert(crisisEval.immediateActions.some(a => a.includes('988')), 'Crisis hotline 988 recommended');

  // 5. Mild Non-Emergency Symptoms
  const benignInput = 'I have a mild tension headache and stiff neck after working on laptop for 8 hours';
  const benignEval = evaluateEmergencyRules(benignInput);
  assert(benignEval.isEmergency === false, 'Tension headache correctly not flagged as emergency');

  return { passed, failed };
}
