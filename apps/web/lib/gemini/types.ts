/**
 * Gemini API レスポンスの型定義
 */

/**
 * 抽出された要件
 */
export interface ExtractedRequirement {
  id: string;
  category:
    | "technical_skills"
    | "soft_skills"
    | "experience"
    | "education"
    | "certifications"
    | "language"
    | "other";
  text: string;
  signals: string[];
}

/**
 * 要件抽出 API のレスポンス
 */
export interface ExtractRequirementsResponse {
  requirements: ExtractedRequirement[];
}

/**
 * Evidence マトリクス項目
 */
export interface EvidenceMatrixItem {
  requirementId: string;
  evidenceSummary: string;
  confidence: number;
  suggestedSources: string[];
}

/**
 * Evidence スタブ API のレスポンス
 */
export interface EvidenceStubResponse {
  matrix: EvidenceMatrixItem[];
}

/**
 * 面接 Q&A
 */
export interface InterviewQA {
  question: string;
  star: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  tips: string[];
}

/**
 * 逆質問
 */
export interface ReverseQuestion {
  question: string;
  purpose: string;
  category: "team" | "growth" | "challenges" | "culture" | "success_metrics";
}

/**
 * 逆質問 API のレスポンス
 */
export interface ReverseQuestionsResponse {
  questions: ReverseQuestion[];
}
