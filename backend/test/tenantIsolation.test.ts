import { authService } from '../src/services/authService.js';
import { chatService } from '../src/services/chatService.js';
import { reportService } from '../src/services/reportService.js';
import { imageService } from '../src/services/imageService.js';
import { memoryService } from '../src/services/memoryService.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export async function runTenantIsolationTests(): Promise<{ passed: number; failed: number }> {
  console.log('\n--- Running Multi-Tenant Data Isolation & Security Tests (IDOR) ---');

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

  // Create User A
  const userA = await authService.register({
    email: `usera_${uuidv4().slice(0, 8)}@test.local`,
    password: 'PasswordA123!',
    fullName: 'Alice Patient A',
  });

  // Create User B
  const userB = await authService.register({
    email: `userb_${uuidv4().slice(0, 8)}@test.local`,
    password: 'PasswordB123!',
    fullName: 'Bob Patient B',
  });

  // 1. Conversation Isolation: User A creates a conversation
  const convA = chatService.createConversation(userA.user.id, "Alice's Private Health Chat");
  await chatService.sendMessage(userA.user.id, convA.id, 'I have chronic back pain');

  // User B attempts to access User A's conversation
  let userBCanAccessConvA = false;
  try {
    chatService.getConversation(userB.user.id, convA.id);
    userBCanAccessConvA = true;
  } catch (err: any) {
    assert(err.code === 'NOT_FOUND', 'User B cannot fetch User A conversation (404/Access Denied)');
  }
  assert(!userBCanAccessConvA, 'User B was blocked from viewing User A conversation');

  // User B attempts to post message to User A's conversation
  let userBCanPostToConvA = false;
  try {
    await chatService.sendMessage(userB.user.id, convA.id, 'Injected message from Bob');
    userBCanPostToConvA = true;
  } catch (err: any) {
    assert(err.code === 'NOT_FOUND', 'User B cannot append message to User A conversation');
  }
  assert(!userBCanPostToConvA, 'User B was blocked from posting into User A conversation');

  // 2. Medical Report Isolation: User A uploads a mock report
  const mockReportPath = path.resolve(process.cwd(), `test_report_${uuidv4().slice(0, 6)}.txt`);
  fs.writeFileSync(mockReportPath, 'Confidential Laboratory Results for Alice. Fasting Glucose: 95 mg/dL.');

  const reportA = await reportService.processUploadedReport(userA.user.id, {
    originalname: 'alice_lab_report.txt',
    mimetype: 'text/plain',
    size: 65,
    path: mockReportPath,
  });

  // User B attempts to view User A's report details
  let userBCanAccessReportA = false;
  try {
    reportService.getReportById(userB.user.id, reportA.id);
    userBCanAccessReportA = true;
  } catch (err: any) {
    assert(err.code === 'NOT_FOUND', 'User B cannot fetch User A medical report');
  }
  assert(!userBCanAccessReportA, 'User B was blocked from accessing User A report');

  // User B attempts to ask questions about User A's report
  let userBCanQueryReportA = false;
  try {
    reportService.askQuestionAboutReport(userB.user.id, reportA.id, 'What are the glucose results?');
    userBCanQueryReportA = true;
  } catch (err: any) {
    assert(err.code === 'NOT_FOUND', 'User B cannot query User A report');
  }
  assert(!userBCanQueryReportA, 'User B was blocked from querying User A report');

  // Clean up mock file
  if (fs.existsSync(mockReportPath)) fs.unlinkSync(mockReportPath);

  // 3. Health Memory Isolation
  const userBMemories = memoryService.getUserMemories(userB.user.id);
  assert(
    !userBMemories.some(m => m.userId === userA.user.id),
    'User B memory list contains zero records belonging to User A'
  );

  return { passed, failed };
}
