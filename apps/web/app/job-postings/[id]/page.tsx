import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getJobPosting } from "../actions";
import DeleteButton from "./delete-button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobPostingDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const jobPosting = await getJobPosting(id);

  if (!jobPosting) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <Link
              href="/job-postings"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              &larr; Back to list
            </Link>
            <h1 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {jobPosting.job_title}
            </h1>
          </div>
          <DeleteButton id={id} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Details
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Company
                </dt>
                <dd className="mt-1 text-zinc-900 dark:text-zinc-50">
                  {jobPosting.company_name}
                </dd>
              </div>
              {jobPosting.source_url && (
                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Source URL
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={jobPosting.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {jobPosting.source_url}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Created
                </dt>
                <dd className="mt-1 text-zinc-900 dark:text-zinc-50">
                  {new Date(jobPosting.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Job Description
            </h2>
            <div className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
              {jobPosting.raw_text || "No description provided."}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Actions
            </h2>
            <div className="flex gap-4">
              <button
                disabled
                className="rounded-md bg-green-600 px-4 py-2 text-white opacity-50 cursor-not-allowed"
              >
                Analyze Requirements (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
