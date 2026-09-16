import { runEmergencyTests } from './emergency.test.js';
import { runPromptInjectionTests } from './promptInjection.test.js';
import { runAuthTests } from './auth.test.js';
import { runTenantIsolationTests } from './tenantIsolation.test.js';
import { runSymptomsAndRAGTests } from './symptomsAndRAG.test.js';

async function main() {
  console.log('================================================================');
  console.log(' AI Healthcare Assistant - Automated Verification Test Suite');
  console.log('================================================================');

  let totalPassed = 0;
  let totalFailed = 0;

  // 1. Emergency Rules Tests
  const r1 = runEmergencyTests();
  totalPassed += r1.passed;
  totalFailed += r1.failed;

  // 2. Prompt Injection Guardrail Tests
  const r2 = runPromptInjectionTests();
  totalPassed += r2.passed;
  totalFailed += r2.failed;

  // 3. Auth & Registration Tests
  const r3 = await runAuthTests();
  totalPassed += r3.passed;
  totalFailed += r3.failed;

  // 4. Multi-Tenant Data Isolation Tests
  const r4 = await runTenantIsolationTests();
  totalPassed += r4.passed;
  totalFailed += r4.failed;

  // 5. Symptoms, "Why This Disease?", and RAG Evidence Tests
  const r5 = await runSymptomsAndRAGTests();
  totalPassed += r5.passed;
  totalFailed += r5.failed;

  console.log('\n================================================================');
  console.log(` TEST SUMMARY SCORECARD:`);
  console.log(` Total Passed: ${totalPassed}`);
  console.log(` Total Failed: ${totalFailed}`);
  console.log(` Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  console.log('================================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner execution failure:', err);
  process.exit(1);
});
