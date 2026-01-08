import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getApplication, getApplicationDocuments } from "../../actions";
import DocumentUploadForm from "./upload-form";
import DocumentList from "./document-list";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDocumentsPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  const documents = await getApplicationDocuments(id);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/applications/${id}`}
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            &larr; Back to Application
          </Link>
          <h1 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Documents
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Upload Document
            </h2>
            <DocumentUploadForm applicationId={id} />
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Uploaded Documents ({documents.length})
            </h2>
            <DocumentList documents={documents} applicationId={id} />
          </div>
        </div>
      </main>
    </div>
  );
}
