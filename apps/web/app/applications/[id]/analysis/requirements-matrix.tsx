"use client";

import type { RequirementsMatrix as MatrixType } from "@/lib/database.types";
import { formatPriority, getPriorityColor } from "@/lib/analysis/mockGenerator";

type Props = {
  matrix: MatrixType;
};

export default function RequirementsMatrix({ matrix }: Props) {
  if (!matrix.requirements || matrix.requirements.length === 0) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">
        No requirements extracted from the job description.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-100">
              Requirement
            </th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-100">
              Priority
            </th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-100">
              Evidence
            </th>
            <th className="px-4 py-3 text-center font-semibold text-zinc-900 dark:text-zinc-100">
              Match
            </th>
          </tr>
        </thead>
        <tbody>
          {matrix.requirements.map((req, index) => (
            <tr
              key={index}
              className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
            >
              <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                {req.requirement}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(req.priority)}`}
                >
                  {formatPriority(req.priority)}
                </span>
              </td>
              <td className="px-4 py-3">
                {req.evidence.map((ev, evIndex) => (
                  <div
                    key={evIndex}
                    className="mb-1 last:mb-0"
                  >
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {ev.source}
                    </span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                      {ev.excerpt}
                    </p>
                  </div>
                ))}
              </td>
              <td className="px-4 py-3 text-center">
                {req.matchScore === 0 ? (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    —
                  </span>
                ) : (
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      req.matchScore >= 0.7
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : req.matchScore >= 0.4
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {Math.round(req.matchScore * 100)}%
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-red-100 dark:bg-red-900/30"></span>
          <span>Must Have</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30"></span>
          <span>Preferred</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-green-100 dark:bg-green-900/30"></span>
          <span>Nice to Have</span>
        </div>
      </div>

      {/* Note */}
      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 pt-4 dark:border-zinc-700">
        <strong>Note:</strong> This is a stub implementation. When Claude API is
        integrated, the requirements will be intelligently extracted from the JD,
        and evidence will be matched from your uploaded resume and work history
        documents.
      </p>
    </div>
  );
}
