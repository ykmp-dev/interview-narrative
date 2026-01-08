/**
 * Gemini API 用プロンプトテンプレート
 *
 * 各機能のプロンプトを一元管理し、差し替えやすくする。
 */

/**
 * JD から要件を抽出するプロンプト
 */
export function buildExtractRequirementsPrompt(jdText: string): string {
  return `You are an expert HR analyst and job description parser.

Analyze the following job description and extract the key requirements.

For each requirement, identify:
1. A unique short ID (e.g., "req_1", "req_2")
2. A category (one of: "technical_skills", "soft_skills", "experience", "education", "certifications", "language", "other")
3. The requirement text (concise, 1-2 sentences)
4. Signals - keywords or phrases from the JD that indicate this requirement (2-4 signals)

Return ONLY a valid JSON object in this exact format:
{
  "requirements": [
    {
      "id": "req_1",
      "category": "technical_skills",
      "text": "Proficiency in TypeScript and React",
      "signals": ["TypeScript", "React", "frontend development"]
    }
  ]
}

Rules:
- Extract 3-8 requirements (focus on the most important ones)
- If the JD is in Japanese, keep the requirement text in Japanese
- If the JD is vague, infer reasonable requirements
- Do NOT include any markdown formatting or explanation, just the JSON

Job Description:
---
${jdText}
---

JSON Response:`;
}

/**
 * 要件に対する Evidence 候補を生成するプロンプト（スタブ用）
 *
 * 実際の履歴書/職務経歴書がない状態で、
 * 「どのような Evidence があれば良いか」を提案する。
 */
export function buildEvidenceStubPrompt(
  requirements: Array<{ id: string; category: string; text: string }>
): string {
  const requirementsList = requirements
    .map((r) => `- ${r.id}: [${r.category}] ${r.text}`)
    .join("\n");

  return `You are a career coach helping candidates prepare for job interviews.

Given the following job requirements, suggest what kind of evidence from a resume or work history would best demonstrate each requirement.

Requirements:
${requirementsList}

For each requirement, provide:
1. requirementId - the ID of the requirement
2. evidenceSummary - a brief description of ideal evidence (1-2 sentences)
3. confidence - how confident you are that typical candidates would have this evidence (0.0-1.0)
4. suggestedSources - where to find this evidence (e.g., "resume", "work_history", "project_portfolio")

Return ONLY a valid JSON object:
{
  "matrix": [
    {
      "requirementId": "req_1",
      "evidenceSummary": "Look for projects using TypeScript and React in work experience",
      "confidence": 0.7,
      "suggestedSources": ["work_history", "project_portfolio"]
    }
  ]
}

Rules:
- Return one entry per requirement
- Keep evidenceSummary concise but actionable
- confidence should reflect realistic expectations
- Do NOT include any markdown formatting, just the JSON

JSON Response:`;
}

/**
 * 面接 Q&A 生成プロンプト（将来実装用のテンプレート）
 */
export function buildInterviewQAPrompt(
  requirement: { text: string; category: string },
  evidenceText: string
): string {
  return `You are an interview coach helping candidates prepare STAR-format answers.

Requirement: ${requirement.text}
Category: ${requirement.category}

Candidate's relevant experience:
${evidenceText}

Generate a potential interview question and a STAR-format answer outline.

Return ONLY valid JSON:
{
  "question": "Tell me about a time when...",
  "star": {
    "situation": "Brief context",
    "task": "What was required",
    "action": "What the candidate did",
    "result": "Outcome with metrics if possible"
  },
  "tips": ["Tip 1", "Tip 2"]
}

JSON Response:`;
}

/**
 * 逆質問生成プロンプト（将来実装用のテンプレート）
 */
export function buildReverseQuestionsPrompt(
  jdText: string,
  companyName: string
): string {
  return `You are a career advisor helping candidates prepare thoughtful questions for interviews.

Company: ${companyName}
Job Description:
${jdText}

Generate 5 insightful reverse questions that:
1. Show genuine interest in the role and company
2. Help the candidate evaluate if this is the right fit
3. Demonstrate strategic thinking

Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "The question text",
      "purpose": "Why this question is effective",
      "category": "team" | "growth" | "challenges" | "culture" | "success_metrics"
    }
  ]
}

JSON Response:`;
}
