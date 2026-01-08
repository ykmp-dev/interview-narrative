/**
 * Gemini API Client
 *
 * 共通の Gemini API クライアント。
 * 全ての Gemini 呼び出しはこのモジュールを経由する。
 */

import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";

// Gemini モデル設定
// gemini-1.5-flash: コストと性能のバランスが良い推奨モデル
const DEFAULT_MODEL = "gemini-1.5-flash";

export type GeminiOptions = {
  model?: string;
  maxOutputTokens?: number;
  temperature?: number;
};

const DEFAULT_OPTIONS: Required<GeminiOptions> = {
  model: DEFAULT_MODEL,
  maxOutputTokens: 4096,
  temperature: 0.7,
};

/**
 * Gemini API キーを取得
 * 未設定の場合はエラーを投げる
 */
function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Please set it in your environment variables."
    );
  }
  return apiKey;
}

/**
 * Gemini クライアントインスタンスを取得
 */
function getClient(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(getApiKey());
}

/**
 * Gemini API を呼び出してテキストを生成
 *
 * @param prompt - 入力プロンプト
 * @param options - オプション設定
 * @returns 生成されたテキスト
 */
export async function callGemini(
  prompt: string,
  options?: GeminiOptions
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const client = getClient();

  const model = client.getGenerativeModel({
    model: opts.model,
    generationConfig: {
      maxOutputTokens: opts.maxOutputTokens,
      temperature: opts.temperature,
    },
  });

  const result: GenerateContentResult = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  return text;
}

/**
 * JSON 形式での応答を期待する Gemini 呼び出し
 *
 * @param prompt - 入力プロンプト（JSON 形式での応答を指示すること）
 * @param options - オプション設定
 * @returns パース済み JSON オブジェクト
 */
export async function callGeminiJson<T>(
  prompt: string,
  options?: GeminiOptions
): Promise<T> {
  // JSON 出力を強制するための設定
  const opts: GeminiOptions = {
    ...options,
    temperature: options?.temperature ?? 0.3, // JSON 出力時は低めの temperature
  };

  const text = await callGemini(prompt, opts);

  // Markdown コードブロックを除去
  const jsonText = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(jsonText) as T;
  } catch (error) {
    // パース失敗時は再試行（1回のみ）
    console.error("JSON parse failed, retrying...", error);

    const retryPrompt = `${prompt}

IMPORTANT: Your previous response was not valid JSON. Please respond with ONLY valid JSON, no markdown formatting, no explanation, just the JSON object.`;

    const retryText = await callGemini(retryPrompt, opts);
    const retryJsonText = retryText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      return JSON.parse(retryJsonText) as T;
    } catch {
      throw new Error(
        `Failed to parse Gemini response as JSON after retry: ${retryJsonText.substring(0, 200)}...`
      );
    }
  }
}
