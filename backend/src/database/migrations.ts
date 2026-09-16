import { getDb } from './connection.js';

export function runMigrations(): void {
  const db = getDb();
  console.log('[MIGRATIONS] Applying database schema migrations...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'patient' NOT NULL,
      is_verified INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      date_of_birth TEXT,
      gender TEXT,
      phone TEXT,
      preferred_language TEXT DEFAULT 'en',
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      emergency_contact_relation TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS health_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      blood_type TEXT,
      height_cm REAL,
      weight_kg REAL,
      smoking_status TEXT,
      alcohol_status TEXT,
      dietary_preferences TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS allergies (
      id TEXT PRIMARY KEY,
      health_profile_id TEXT NOT NULL,
      allergen TEXT NOT NULL,
      reaction TEXT,
      severity TEXT NOT NULL,
      diagnosed_year INTEGER,
      FOREIGN KEY (health_profile_id) REFERENCES health_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS health_conditions (
      id TEXT PRIMARY KEY,
      health_profile_id TEXT NOT NULL,
      condition_name TEXT NOT NULL,
      status TEXT NOT NULL,
      diagnosed_date TEXT,
      notes TEXT,
      FOREIGN KEY (health_profile_id) REFERENCES health_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      health_profile_id TEXT NOT NULL,
      medicine_name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      start_date TEXT,
      is_current INTEGER DEFAULT 1,
      FOREIGN KEY (health_profile_id) REFERENCES health_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      citations_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS symptom_assessments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      reported_symptoms TEXT NOT NULL,
      duration TEXT,
      severity_scale INTEGER,
      urgency_level TEXT NOT NULL,
      is_emergency_override INTEGER DEFAULT 0,
      assessment_result_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medical_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size_bytes INTEGER NOT NULL,
      status TEXT DEFAULT 'processing',
      extracted_text TEXT,
      summary_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS report_chunks (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      chunk_text TEXT NOT NULL,
      embedding_json TEXT,
      FOREIGN KEY (report_id) REFERENCES medical_reports(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medical_images (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size_bytes INTEGER NOT NULL,
      modality TEXT,
      body_part TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS image_analyses (
      id TEXT PRIMARY KEY,
      image_id TEXT UNIQUE NOT NULL,
      findings_json TEXT NOT NULL,
      confidence_score REAL,
      urgency TEXT,
      disclaimer_acknowledged INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (image_id) REFERENCES medical_images(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS health_memories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      memory_text TEXT NOT NULL,
      source_reference TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rag_documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      source_organization TEXT NOT NULL,
      source_url TEXT,
      publication_date TEXT,
      evidence_level TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rag_chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      chunk_text TEXT NOT NULL,
      embedding_json TEXT,
      keywords TEXT,
      FOREIGN KEY (document_id) REFERENCES rag_documents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      details_json TEXT,
      created_at TEXT NOT NULL
    );

    -- Performance and Tenant Isolation Indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_reports_user ON medical_reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_report_chunks_user ON report_chunks(user_id);
    CREATE INDEX IF NOT EXISTS idx_report_chunks_report ON report_chunks(report_id);
    CREATE INDEX IF NOT EXISTS idx_images_user ON medical_images(user_id);
    CREATE INDEX IF NOT EXISTS idx_memories_user ON health_memories(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc ON rag_chunks(document_id);
  `);

  console.log('[MIGRATIONS] Database schema migrations completed successfully.');
}

// Auto-execute if run directly via CLI
if (process.argv[1]?.endsWith('migrations.ts') || process.argv[1]?.endsWith('migrations.js')) {
  runMigrations();
}
