import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JobPostingForm from "./form";

export default async function NewJobPostingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            New Job Posting
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <JobPostingForm />
      </main>
    </div>
  );
}
