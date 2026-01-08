/**
 * Mock generator for JD requirements matrix
 *
 * This module provides stub implementations for generating requirement analysis.
 * TODO: Replace with Claude API integration for actual AI-powered analysis.
 */

import type { RequirementsMatrix, RequirementItem } from "@/lib/database.types";

/**
 * Extract mock requirements from JD text
 *
 * This is a stub implementation that splits the JD text into fake requirements.
 * In production, this should be replaced with Claude API to:
 * 1. Parse and understand the JD content
 * 2. Extract key requirements with priority levels
 * 3. Match against user's documents for evidence
 */
export function generateMockRequirements(jdText: string): RequirementsMatrix {
  // Simple stub: extract some pseudo-requirements from the JD text
  // In reality, Claude API would analyze this intelligently

  const lines = jdText.split(/\n+/).filter((line) => line.trim().length > 10);

  // Take up to 5 lines as mock "requirements"
  const mockRequirements: RequirementItem[] = [];

  // Priority distribution: first is "must", next two are "preferred", rest are "nice-to-have"
  const priorities: Array<"must" | "preferred" | "nice-to-have"> = [
    "must",
    "preferred",
    "preferred",
    "nice-to-have",
    "nice-to-have",
  ];

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    // Truncate long lines for display
    const requirement =
      line.length > 100 ? line.substring(0, 100) + "..." : line;

    mockRequirements.push({
      requirement,
      priority: priorities[i] || "nice-to-have",
      evidence: [
        {
          source: "TODO: Resume/CV analysis pending",
          excerpt: "Evidence will be extracted from uploaded documents",
          relevance: 0,
        },
      ],
      matchScore: 0, // Will be calculated when evidence is matched
    });
  }

  // If JD text was too short, add some placeholder requirements
  if (mockRequirements.length < 3) {
    const placeholders = [
      "Technical skills and experience",
      "Communication and collaboration",
      "Problem-solving ability",
    ];

    for (
      let i = mockRequirements.length;
      i < 3 && i < placeholders.length;
      i++
    ) {
      mockRequirements.push({
        requirement: placeholders[i],
        priority: priorities[i] || "nice-to-have",
        evidence: [
          {
            source: "TODO: Resume/CV analysis pending",
            excerpt: "Evidence will be extracted from uploaded documents",
            relevance: 0,
          },
        ],
        matchScore: 0,
      });
    }
  }

  return {
    requirements: mockRequirements,
  };
}

/**
 * Format priority for display
 */
export function formatPriority(
  priority: "must" | "preferred" | "nice-to-have"
): string {
  switch (priority) {
    case "must":
      return "Must Have (必須)";
    case "preferred":
      return "Preferred (優遇)";
    case "nice-to-have":
      return "Nice to Have (あれば尚可)";
    default:
      return priority;
  }
}

/**
 * Get priority badge color class
 */
export function getPriorityColor(
  priority: "must" | "preferred" | "nice-to-have"
): string {
  switch (priority) {
    case "must":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "preferred":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "nice-to-have":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300";
  }
}
