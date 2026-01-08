import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getApplicationWithJobPosting,
  getApplicationDocuments,
} from "../../actions";
import { generateMockRequirements } from "@/lib/analysis/mockGenerator";
import RequirementsMatrix from "./requirements-matrix";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AnalysisPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const application = await getApplicationWithJobPosting(id);

  if (!application) {
    notFound();
  }

  const documents = await getApplicationDocuments(id);

  // Generate mock requirements from JD text
  const jdText = application.job_posting.raw_text || "";
  const matrix = generateMockRequirements(jdText);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/applications/${id}`}
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            &larr; Back to Application
          </Link>
          <h1 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Requirements Analysis
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {application.job_posting.job_title} at{" "}
            {application.job_posting.company_name}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Stub Mode - AI Analysis Pending
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  This is a mock analysis. Requirements are extracted as stubs
                  from the JD text. Claude API integration will provide
                  intelligent analysis of requirements and evidence matching.
                </p>
              </div>
            </div>
          </div>

          {/* Document Status */}
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Uploaded Documents
            </h2>
            {documents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-zinc-500 dark:text-zinc-400">
                  No documents uploaded yet.
                </p>
                <Link
                  href={`/applications/${id}/documents`}
                  className="mt-2 inline-block text-blue-600 hover:underline dark:text-blue-400"
                >
                  Upload documents &rarr;
                </Link>
              </div>
            ) : (
              <div>
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {doc.original_name}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {doc.file_type}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  TODO: PDF text extraction will be implemented to match evidence
                  against requirements.
                </p>
              </div>
            )}
          </div>

          {/* Requirements Matrix */}
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              JD Requirements × Evidence Matrix
            </h2>
            <RequirementsMatrix matrix={matrix} />
          </div>
        </div>
      </main>
    </div>
  );
}
