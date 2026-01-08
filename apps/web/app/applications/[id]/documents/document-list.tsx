"use client";

import { useState } from "react";
import {
  deleteDocument,
  getDocumentDownloadUrl,
  type DocumentWithMeta,
} from "../../actions";

type Props = {
  documents: DocumentWithMeta[];
  applicationId: string;
};

const FILE_TYPE_LABELS: Record<string, string> = {
  resume: "Resume (履歴書)",
  cv: "CV / Work History (職務経歴書)",
  narrative: "Narrative Answers (面接回答)",
  other: "Other (その他)",
};

export default function DocumentList({ documents, applicationId }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (documentId: string, fileName: string) => {
    setDownloading(documentId);
    try {
      const result = await getDocumentDownloadUrl(applicationId, documentId);
      if (result.success && result.url) {
        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = result.url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(result.error || "Download failed");
      }
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setDeleting(documentId);
    try {
      const result = await deleteDocument(applicationId, documentId);
      if (!result.success) {
        alert(result.error || "Delete failed");
      }
      // Page will refresh via router.refresh() in the action
    } finally {
      setDeleting(null);
    }
  };

  if (documents.length === 0) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
              {doc.original_name}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {FILE_TYPE_LABELS[doc.file_type] || doc.file_type}
              {doc.file_size && (
                <span className="ml-2">
                  ({(doc.file_size / 1024).toFixed(1)} KB)
                </span>
              )}
            </p>
          </div>
          <div className="ml-4 flex gap-2">
            <button
              onClick={() => handleDownload(doc.id, doc.original_name)}
              disabled={downloading === doc.id}
              className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
            >
              {downloading === doc.id ? "..." : "Download"}
            </button>
            <button
              onClick={() => handleDelete(doc.id)}
              disabled={deleting === doc.id}
              className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              {deleting === doc.id ? "..." : "Delete"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
