import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  callGeminiJson,
  buildExtractRequirementsPrompt,
  type ExtractRequirementsResponse,
} from "@/lib/gemini";

export const runtime = "nodejs";

/**
 * POST /api/analysis/extract-requirements
 *
 * JD テキストから要件を抽出する API
 *
 * Request body:
 *   { jdText: string }
 *
 * Response:
 *   { requirements: ExtractedRequirement[] }
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
    const { jdText } = body as { jdText?: string };

    if (!jdText || typeof jdText !== "string") {
      return NextResponse.json(
        { error: "jdText is required and must be a string" },
        { status: 400 }
      );
    }

    if (jdText.trim().length < 50) {
      return NextResponse.json(
        { error: "jdText is too short. Please provide a more detailed job description." },
        { status: 400 }
      );
    }

    // プロンプト生成
    const prompt = buildExtractRequirementsPrompt(jdText);

    // Gemini API 呼び出し
    const result = await callGeminiJson<ExtractRequirementsResponse>(prompt, {
      maxOutputTokens: 2048,
      temperature: 0.3,
    });

    // バリデーション
    if (!result.requirements || !Array.isArray(result.requirements)) {
      return NextResponse.json(
        { error: "Invalid response from Gemini API" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in extract-requirements:", error);

    // GEMINI_API_KEY が未設定の場合の特別処理
    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "Gemini API is not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to extract requirements" },
      { status: 500 }
    );
  }
}
