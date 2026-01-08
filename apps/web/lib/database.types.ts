/**
 * Database types for Supabase
 *
 * To regenerate this file automatically using Supabase CLI:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
 *
 * Or with linked project:
 *   npx supabase gen types typescript --linked > lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      job_postings: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          job_title: string;
          description: string | null;
          requirements: string | null;
          raw_text: string | null;
          source_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          job_title: string;
          description?: string | null;
          requirements?: string | null;
          raw_text?: string | null;
          source_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          job_title?: string;
          description?: string | null;
          requirements?: string | null;
          raw_text?: string | null;
          source_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          original_name: string;
          file_path: string;
          file_size: number | null;
          file_type: "resume" | "cv" | "narrative" | "other";
          extracted_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          original_name: string;
          file_path: string;
          file_size?: number | null;
          file_type: "resume" | "cv" | "narrative" | "other";
          extracted_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          original_name?: string;
          file_path?: string;
          file_size?: number | null;
          file_type?: "resume" | "cv" | "narrative" | "other";
          extracted_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          job_posting_id: string;
          status: "draft" | "analyzing" | "completed" | "archived";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_posting_id: string;
          status?: "draft" | "analyzing" | "completed" | "archived";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_posting_id?: string;
          status?: "draft" | "analyzing" | "completed" | "archived";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      analysis_runs: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          status: "pending" | "running" | "completed" | "failed";
          requirements_matrix: RequirementsMatrix | null;
          interview_qa: InterviewQA[] | null;
          reverse_questions: string[] | null;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          status?: "pending" | "running" | "completed" | "failed";
          requirements_matrix?: RequirementsMatrix | null;
          interview_qa?: InterviewQA[] | null;
          reverse_questions?: string[] | null;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string;
          status?: "pending" | "running" | "completed" | "failed";
          requirements_matrix?: RequirementsMatrix | null;
          interview_qa?: InterviewQA[] | null;
          reverse_questions?: string[] | null;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      application_documents: {
        Row: {
          id: string;
          application_id: string;
          document_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          document_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          document_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// =============================================================================
// Domain-specific types for JSONB columns
// =============================================================================

/**
 * 要件 x 経験マトリクス
 */
export interface RequirementsMatrix {
  requirements: RequirementItem[];
}

export interface RequirementItem {
  requirement: string;
  priority: "must" | "preferred" | "nice-to-have";
  evidence: EvidenceItem[];
  matchScore: number;
}

export interface EvidenceItem {
  source: string;
  excerpt: string;
  relevance: number;
}

/**
 * 面接Q&A (STAR format)
 */
export interface InterviewQA {
  question: string;
  category: string;
  star: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  tips: string[];
}

// =============================================================================
// Utility types
// =============================================================================

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience aliases
export type JobPosting = Tables<"job_postings">;
export type Document = Tables<"documents">;
export type Application = Tables<"applications">;
export type AnalysisRun = Tables<"analysis_runs">;
export type ApplicationDocument = Tables<"application_documents">;
