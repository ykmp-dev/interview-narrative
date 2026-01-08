"use client";

import { useState } from "react";
import Link from "next/link";
import { createJobPosting } from "../actions";

export default function JobPostingForm() {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jdText, setJdText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createJobPosting({
        jobTitle,
        companyName,
        jdText,
        sourceUrl: sourceUrl || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-900">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="jobTitle"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              id="jobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              placeholder="e.g. Senior Software Engineer"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              placeholder="e.g. Acme Inc."
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div>
            <label
              htmlFor="sourceUrl"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Source URL
            </label>
            <input
              id="sourceUrl"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/job/123"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div>
            <label
              htmlFor="jdText"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Job Description (Full Text) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="jdText"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              required
              rows={15}
              placeholder="Paste the full job description here..."
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Job Posting"}
          </button>
          <Link
            href="/job-postings"
            className="rounded-md border border-zinc-300 px-4 py-2 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
