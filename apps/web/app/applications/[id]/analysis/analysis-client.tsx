"use client";

import { useState, useCallback } from "react";
import type {
  ExtractedRequirement,
  EvidenceMatrixItem,
} from "@/lib/gemini/types";

type Props = {
  jdText: string;
};

type AnalysisState = {
  status: "idle" | "extracting" | "matching" | "done" | "error";
  requirements: ExtractedRequirement[];
  evidence: EvidenceMatrixItem[];
  error: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  technical_skills: "Technical Skills",
  soft_skills: "Soft Skills",
  experience: "Experience",
  education: "Education",
  certifications: "Certifications",
  language: "Language",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  technical_skills:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  soft_skills:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  experience:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  education:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  certifications:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  language:
    "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  other: "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300",
};

export default function AnalysisClient({ jdText }: Props) {
  const [state, setState] = useState<AnalysisState>({
    status: "idle",
    requirements: [],
    evidence: [],
    error: null,
  });

  const runAnalysis = useCallback(async () => {
    if (!jdText || jdText.trim().length < 50) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: "Job description is too short for analysis",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      status: "extracting",
      error: null,
    }));

    try {
      // Step 1: Extract requirements from JD
      const reqResponse = await fetch("/api/analysis/extract-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText }),
      });

      if (!reqResponse.ok) {
        const err = await reqResponse.json();
        throw new Error(err.error || "Failed to extract requirements");
      }

      const reqData = await reqResponse.json();
      const requirements: ExtractedRequirement[] = reqData.requirements;

      setState((prev) => ({
        ...prev,
        requirements,
        status: "matching",
      }));

      // Step 2: Get evidence suggestions
      const evResponse = await fetch("/api/analysis/evidence-stub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements: requirements.map((r) => ({
            id: r.id,
            category: r.category,
            text: r.text,
          })),
        }),
      });

      if (!evResponse.ok) {
        const err = await evResponse.json();
        throw new Error(err.error || "Failed to get evidence suggestions");
      }

      const evData = await evResponse.json();
      const evidence: EvidenceMatrixItem[] = evData.matrix;

      setState({
        status: "done",
        requirements,
        evidence,
        error: null,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Analysis failed",
      }));
    }
  }, [jdText]);

  const getEvidenceForRequirement = (reqId: string): EvidenceMatrixItem | undefined => {
    return state.evidence.find((e) => e.requirementId === reqId);
  };

  return (
    <div className="space-y-6">
      {/* Generate Button / Status */}
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              JD Requirements Analysis
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {state.status === "idle" &&
                "Click the button to analyze requirements using Gemini AI"}
              {state.status === "extracting" &&
                "Extracting requirements from job description..."}
              {state.status === "matching" &&
                "Generating evidence suggestions..."}
              {state.status === "done" &&
                `Found ${state.requirements.length} requirements`}
              {state.status === "error" && "Analysis failed"}
            </p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={
              state.status === "extracting" || state.status === "matching"
            }
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {state.status === "extracting" || state.status === "matching" ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : state.status === "done" ? (
              "Re-analyze"
            ) : (
              "Analyze Requirements"
            )}
          </button>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-400">
              {state.error}
            </p>
          </div>
        )}
      </div>

      {/* Requirements Matrix */}
      {state.requirements.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Requirements × Evidence Matrix
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-100">
                    Requirement
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-100">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-100">
                    Signals
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-100">
                    Evidence Suggestion
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-zinc-900 dark:text-zinc-100">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.requirements.map((req) => {
                  const ev = getEvidenceForRequirement(req.id);
                  return (
                    <tr
                      key={req.id}
                      className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {req.text}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            CATEGORY_COLORS[req.category] ||
                            CATEGORY_COLORS.other
                          }`}
                        >
                          {CATEGORY_LABELS[req.category] || req.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {req.signals.map((signal, i) => (
                            <span
                              key={i}
                              className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                            >
                              {signal}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {ev ? (
                          <div>
                            <p>{ev.evidenceSummary}</p>
                            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                              Sources: {ev.suggestedSources.join(", ")}
                            </p>
                          </div>
                        ) : (
                          <span className="italic text-zinc-400">
                            Pending...
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {ev ? (
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              ev.confidence >= 0.7
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : ev.confidence >= 0.4
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {Math.round(ev.confidence * 100)}%
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <span className="font-medium">Categories:</span>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    CATEGORY_COLORS[key]?.split(" ")[0] || "bg-zinc-100"
                  }`}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Note */}
          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            <strong>Note:</strong> Evidence suggestions are generated by Gemini
            AI based on the job requirements. When PDF text extraction is
            implemented, actual evidence from your resume and work history will
            be matched here.
          </p>
        </div>
      )}

      {/* Empty State */}
      {state.status === "idle" && (
        <div className="rounded-lg border-2 border-dashed border-zinc-200 p-8 text-center dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">
            Click &quot;Analyze Requirements&quot; to extract job requirements
            using Gemini AI and get evidence suggestions.
          </p>
        </div>
      )}
    </div>
  );
}
