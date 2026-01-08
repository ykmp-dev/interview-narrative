import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  callGeminiJson,
  buildEvidenceStubPrompt,
  type ExtractedRequirement,
  type EvidenceStubResponse,
} from "@/lib/gemini";

export const runtime = "nodejs";

/**
 * POST /api/analysis/evidence-stub
 *
 * 要件に対する Evidence 候補を生成する API（スタブ版）
 * 実際の履歴書/職務経歴書がない状態で、
 * 「どのような Evidence があれば良いか」を提案する。
 *
 * Request body:
 *   { requirements: Array<{ id: string; category: string; text: string }> }
 *
 * Response:
 *   { matrix: EvidenceMatrixItem[] }
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストボディの取得
    const body = await request.json();
    const { requirements } = body as {
      requirements?: Array<{ id: string; category: string; text: string }>;
    };

    if (!requirements || !Array.isArray(requirements)) {
      return NextResponse.json(
        { error: "requirements array is required" },
        { status: 400 }
      );
    }

    if (requirements.length === 0) {
      return NextResponse.json(
        { error: "requirements array cannot be empty" },
        { status: 400 }
      );
    }

    // 各要件のバリデーション
    for (const req of requirements) {
      if (!req.id || !req.category || !req.text) {
        return NextResponse.json(
          { error: "Each requirement must have id, category, and text" },
          { status: 400 }
        );
      }
    }

    // プロンプト生成
    const prompt = buildEvidenceStubPrompt(
      requirements as Array<Pick<ExtractedRequirement, "id" | "category" | "text">>
    );

    // Gemini API 呼び出し
    const result = await callGeminiJson<EvidenceStubResponse>(prompt, {
      maxOutputTokens: 2048,
      temperature: 0.5,
    });

    // バリデーション
    if (!result.matrix || !Array.isArray(result.matrix)) {
      return NextResponse.json(
        { error: "Invalid response from Gemini API" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in evidence-stub:", error);

    // GEMINI_API_KEY が未設定の場合の特別処理
    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "Gemini API is not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate evidence suggestions" },
      { status: 500 }
    );
  }
}
