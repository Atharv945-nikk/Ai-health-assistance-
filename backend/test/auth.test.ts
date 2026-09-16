import { authService } from '../src/services/authService.js';
import { runMigrations } from '../src/database/migrations.js';
import { v4 as uuidv4 } from 'uuid';

export async function runAuthTests(): Promise<{ passed: number; failed: number }> {
  console.log('\n--- Running Authentication & Identity Tests ---');
  runMigrations();

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

  const testEmail = `testuser_${uuidv4().slice(0, 8)}@healthcare.test`;
  const testPassword = 'StrongPassword2026!';

  // 1. Register User
  const regResult = await authService.register({
    email: testEmail,
    password: testPassword,
    fullName: 'Test Participant',
    preferredLanguage: 'en',
  });

  assert(Boolean(regResult.user.id), 'User ID generated');
  assert(regResult.user.email === testEmail, 'Email stored in lowercase');
  assert(Boolean(regResult.token), 'JWT token generated');
  assert(regResult.profile.fullName === 'Test Participant', 'Profile attached');

  // 2. Duplicate registration rejection
  let dupThrew = false;
  try {
    await authService.register({
      email: testEmail,
      password: testPassword,
      fullName: 'Duplicate Participant',
    });
  } catch (err: any) {
    dupThrew = true;
    assert(err.code === 'EMAIL_EXISTS', 'Rejects duplicate registration with EMAIL_EXISTS');
  }
  assert(dupThrew, 'Duplicate email registration throws error');

  // 3. Login with correct credentials
  const loginResult = await authService.login({
    email: testEmail,
    password: testPassword,
  });
  assert(loginResult.user.id === regResult.user.id, 'Login returns matched user');
  assert(Boolean(loginResult.token), 'Login returns valid token');

  // 4. Login with incorrect password rejection
  let badPassThrew = false;
  try {
    await authService.login({
      email: testEmail,
      password: 'WrongPassword!',
    });
  } catch (err: any) {
    badPassThrew = true;
    assert(err.code === 'INVALID_CREDENTIALS', 'Rejects bad password with INVALID_CREDENTIALS');
  }
  assert(badPassThrew, 'Bad password throws error');

  return { passed, failed };
}
