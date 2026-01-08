-- =============================================================================
-- interview-narrative: Database Schema
-- =============================================================================
-- Run this SQL in Supabase SQL Editor or via Supabase CLI
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. job_postings: 求人票（JD）情報
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  raw_text TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS を有効化
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

-- ユーザー自身のデータのみアクセス可能
CREATE POLICY "Users can view own job_postings"
  ON job_postings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job_postings"
  ON job_postings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job_postings"
  ON job_postings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own job_postings"
  ON job_postings FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 2. documents: アップロードされたPDF（履歴書、職務経歴書など）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT NOT NULL CHECK (file_type IN ('resume', 'cv', 'narrative', 'other')),
  extracted_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS を有効化
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ユーザー自身のデータのみアクセス可能
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. applications: 応募案件（求人と候補者資料の紐付け）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'analyzing', 'completed', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS を有効化
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- ユーザー自身のデータのみアクセス可能
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON applications FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. analysis_runs: AI分析の実行結果
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  requirements_matrix JSONB,
  interview_qa JSONB,
  reverse_questions JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS を有効化
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;

-- ユーザー自身のデータのみアクセス可能
CREATE POLICY "Users can view own analysis_runs"
  ON analysis_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis_runs"
  ON analysis_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis_runs"
  ON analysis_runs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analysis_runs"
  ON analysis_runs FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. application_documents: 応募案件とドキュメントの中間テーブル
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(application_id, document_id)
);

-- RLS を有効化
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

-- applications と documents の所有者が同じユーザーであることを確認
CREATE POLICY "Users can view own application_documents"
  ON application_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_documents.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own application_documents"
  ON application_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_documents.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own application_documents"
  ON application_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_documents.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 6. Indexes for performance
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_job_postings_user_id ON job_postings(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_posting_id ON applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_user_id ON analysis_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_application_id ON analysis_runs(application_id);
CREATE INDEX IF NOT EXISTS idx_application_documents_application_id ON application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_application_documents_document_id ON application_documents(document_id);

-- -----------------------------------------------------------------------------
-- 7. Updated_at trigger function
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_runs_updated_at
  BEFORE UPDATE ON analysis_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 8. Storage bucket for documents
-- -----------------------------------------------------------------------------
-- Run this in Supabase Dashboard > Storage or via SQL Editor:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('interview-docs', 'interview-docs', false);
--
-- Storage RLS policies (run in SQL Editor):
--
-- CREATE POLICY "Users can upload own documents"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'interview-docs'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );
--
-- CREATE POLICY "Users can view own documents"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'interview-docs'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );
--
-- CREATE POLICY "Users can delete own documents"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'interview-docs'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );
