import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./sign-out-button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            User Information
          </h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Email
              </dt>
              <dd className="text-zinc-900 dark:text-zinc-50">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                User ID
              </dt>
              <dd className="font-mono text-sm text-zinc-900 dark:text-zinc-50">
                {user.id}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Created At
              </dt>
              <dd className="text-zinc-900 dark:text-zinc-50">
                {new Date(user.created_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}
