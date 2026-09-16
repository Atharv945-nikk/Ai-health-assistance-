import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb, queryOne, execute, runInTransaction } from './connection.js';
import { runMigrations } from './migrations.js';

export function seedDatabase(): void {
  runMigrations();
  const db = getDb();
  console.log('[SEED] Seeding initial authoritative medical knowledge & demo accounts...');

  runInTransaction(() => {
    // 1. Seed Demo Patient User & Admin User
    const existingPatient = queryOne<{ id: string }>('SELECT id FROM users WHERE email = ?', ['patient@demo.local']);
    let patientId = existingPatient?.id;
    if (!existingPatient) {
      patientId = uuidv4();
      const passwordHash = bcrypt.hashSync('Patient123!', 10);
      const now = new Date().toISOString();
      execute(
        `INSERT INTO users (id, email, password_hash, role, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [patientId, 'patient@demo.local', passwordHash, 'patient', 1, now, now]
      );
      // Profile
      execute(
        `INSERT INTO user_profiles (id, user_id, full_name, date_of_birth, gender, phone, preferred_language, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), patientId, 'Demo Patient', '1990-05-15', 'Female', '+1-555-0199', 'en', 'Sarah Jenkins', '+1-555-0188', 'Sister', now, now]
      );
      // Health Profile
      const healthProfileId = uuidv4();
      execute(
        `INSERT INTO health_profiles (id, user_id, blood_type, height_cm, weight_kg, smoking_status, alcohol_status, dietary_preferences, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [healthProfileId, patientId, 'O+', 168.0, 65.5, 'non-smoker', 'occasional', 'balanced', now, now]
      );
      // Allergy
      execute(
        `INSERT INTO allergies (id, health_profile_id, allergen, reaction, severity, diagnosed_year) VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), healthProfileId, 'Penicillin', 'Urticaria and facial rash', 'moderate', 2018]
      );
      // Condition
      execute(
        `INSERT INTO health_conditions (id, health_profile_id, condition_name, status, diagnosed_date, notes) VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), healthProfileId, 'Mild Asthma', 'managed', '2015-08-10', 'Intermittent exercise-induced symptoms; responds to albuterol']
      );
      // Medication
      execute(
        `INSERT INTO medications (id, health_profile_id, medicine_name, dosage, frequency, start_date, is_current) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), healthProfileId, 'Albuterol HFA Inhaler', '90 mcg/actuation', '2 puffs PRN before exercise', '2020-01-15', 1]
      );
    }

    const existingAdmin = queryOne<{ id: string }>('SELECT id FROM users WHERE email = ?', ['admin@healthcare.local']);
    if (!existingAdmin) {
      const adminId = uuidv4();
      const adminPass = bcrypt.hashSync('AdminSecure2026!', 10);
      const now = new Date().toISOString();
      execute(
        `INSERT INTO users (id, email, password_hash, role, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [adminId, 'admin@healthcare.local', adminPass, 'admin', 1, now, now]
      );
      execute(
        `INSERT INTO user_profiles (id, user_id, full_name, preferred_language, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), adminId, 'Clinical Administrator', 'en', now, now]
      );
    }

    // 2. Seed Authoritative Medical RAG Corpus
    const existingDocsCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM rag_documents');
    if (!existingDocsCount || existingDocsCount.count === 0) {
      const medicalKnowledge = [
        {
          title: 'WHO Clinical Management Guidelines: Acute Respiratory Infections and Dyspnea',
          org: 'World Health Organization (WHO)',
          url: 'https://www.who.int/publications/i/item/clinical-management-respiratory-infections',
          pubDate: '2024-03-15',
          evidence: 'A',
          chunks: [
            {
              text: 'Acute onset of dyspnea with stridor, intercostal retractions, or inability to vocalize complete phrases indicates severe upper airway compromise or acute respiratory failure. Immediate oxygenation and emergency transport are mandatory.',
              keywords: 'dyspnea, shortness of breath, respiratory distress, stridor, asthma, wheezing, emergency'
            },
            {
              text: 'In adults presenting with low-grade fever, rhinorrhea, sore throat, and mild dry cough without signs of tachypnea or hypoxemia (SpO2 >= 95%), supportive outpatient self-care including hydration, saline gargles, and antipyretics is recommended.',
              keywords: 'fever, cough, sore throat, cold, viral infection, upper respiratory, self-care'
            }
          ]
        },
        {
          title: 'AHA / ACC Guideline for the Evaluation and Diagnosis of Acute Chest Pain',
          org: 'American Heart Association / American College of Cardiology',
          url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001029',
          pubDate: '2023-11-01',
          evidence: 'A',
          chunks: [
            {
              text: 'Chest pain described as substernal pressure, tightness, squeezing, or heaviness radiating to the left shoulder, arm, neck, or jaw, particularly when accompanied by diaphoresis, dyspnea, nausea, or lightheadedness, must be treated as presumptive Acute Coronary Syndrome (ACS) requiring immediate emergency medical dispatch.',
              keywords: 'chest pain, heart attack, myocardial infarction, left arm pain, jaw pain, diaphoresis, emergency, cardiac'
            },
            {
              text: 'Pleuritic chest pain characterized by sharp, stabbing sensation worsened strictly by inspiration or coughing, in young patients without cardiovascular risk factors and with normal vital signs, is more frequently associated with costochondritis, pleurisy, or benign musculoskeletal strain.',
              keywords: 'sharp chest pain, pleuritic, costochondritis, breathing pain, musculoskeletal'
            }
          ]
        },
        {
          title: 'ADA Standards of Care in Diabetes: Glycemic Targets and Laboratory Assessment',
          org: 'American Diabetes Association (ADA)',
          url: 'https://diabetesjournals.org/care/issue/47/Supplement_1',
          pubDate: '2024-01-01',
          evidence: 'A',
          chunks: [
            {
              text: 'A fasting plasma glucose level of 126 mg/dL (7.0 mmol/L) or greater, a 2-hour plasma glucose of 200 mg/dL or greater during OGTT, or an HbA1c of 6.5% or greater confirms the diagnosis of diabetes mellitus when repeated or in the presence of classic hyperglycemia symptoms (polyuria, polydipsia, unexplained weight loss).',
              keywords: 'diabetes, fasting glucose, hba1c, hyperglycemia, blood sugar, lab values, reference range'
            },
            {
              text: 'Pre-diabetes is classified by an HbA1c between 5.7% and 6.4%, or fasting plasma glucose between 100 and 125 mg/dL. First-line intervention consists of intensive lifestyle modification including 150 minutes per week of moderate-intensity physical activity and Mediterranean-style nutrition.',
              keywords: 'prediabetes, blood sugar, diet, exercise, lifestyle, prevention'
            }
          ]
        },
        {
          title: 'CDC Guidelines on Hypertension Screening and Cardiovascular Risk Stratification',
          org: 'Centers for Disease Control and Prevention (CDC)',
          url: 'https://www.cdc.gov/bloodpressure/guidelines.htm',
          pubDate: '2023-09-20',
          evidence: 'B',
          chunks: [
            {
              text: 'Stage 1 Hypertension is defined as systolic BP 130-139 mm Hg or diastolic BP 80-89 mm Hg. Stage 2 Hypertension is defined as systolic BP >= 140 mm Hg or diastolic BP >= 90 mm Hg. Blood pressure readings above 180/120 mm Hg constitute a hypertensive crisis; if accompanied by chest pain, headache, numbness, or visual changes, immediate emergency department evaluation is required.',
              keywords: 'hypertension, blood pressure, high BP, systolic, diastolic, hypertensive crisis'
            }
          ]
        },
        {
          title: 'ACOG Practice Bulletin: Anemia and Complete Blood Count (CBC) Interpretation',
          org: 'American College of Obstetricians and Gynecologists (ACOG)',
          url: 'https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2021/08/anemia-in-pregnancy',
          pubDate: '2023-06-10',
          evidence: 'B',
          chunks: [
            {
              text: 'In non-pregnant adult females, hemoglobin below 12.0 g/dL, and in adult males below 13.5 g/dL signifies anemia. Microcytic hypochromic indices (low MCV < 80 fL, low MCH) strongly correlate with iron deficiency anemia or thalassemia trait. Serum ferritin is the most accurate diagnostic test for total body iron depletion.',
              keywords: 'anemia, hemoglobin, CBC, complete blood count, MCV, ferritin, fatigue, iron deficiency'
            }
          ]
        }
      ];

      for (const doc of medicalKnowledge) {
        const docId = uuidv4();
        const now = new Date().toISOString();
        execute(
          `INSERT INTO rag_documents (id, title, source_organization, source_url, publication_date, evidence_level, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [docId, doc.title, doc.org, doc.url, doc.pubDate, doc.evidence, now]
        );

        for (const chunk of doc.chunks) {
          const chunkId = uuidv4();
          execute(
            `INSERT INTO rag_chunks (id, document_id, chunk_text, embedding_json, keywords) VALUES (?, ?, ?, ?, ?)`,
            [chunkId, docId, chunk.text, null, chunk.keywords]
          );
        }
      }
    }
  });

  console.log('[SEED] Database seeded successfully.');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
