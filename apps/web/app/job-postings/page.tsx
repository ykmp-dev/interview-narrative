import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getJobPostings } from "./actions";

export default async function JobPostingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const jobPostings = await getJobPostings();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Job Postings
          </h1>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Dashboard
            </Link>
            <Link
              href="/job-postings/new"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              + New Job Posting
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {jobPostings.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-zinc-900">
            <p className="text-zinc-600 dark:text-zinc-400">
              No job postings yet.
            </p>
            <Link
              href="/job-postings/new"
              className="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400"
            >
              Create your first job posting
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobPostings.map((posting) => (
              <Link
                key={posting.id}
                href={`/job-postings/${posting.id}`}
                className="block rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {posting.job_title}
                    </h2>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {posting.company_name}
                    </p>
                  </div>
                  <time className="text-sm text-zinc-500 dark:text-zinc-500">
                    {new Date(posting.created_at).toLocaleDateString()}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
