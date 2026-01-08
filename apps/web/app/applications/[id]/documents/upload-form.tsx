"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument, type DocumentType } from "../../actions";

type Props = {
  applicationId: string;
};

const FILE_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "resume", label: "Resume (履歴書)" },
  { value: "cv", label: "CV / Work History (職務経歴書)" },
  { value: "narrative", label: "Narrative Answers (面接回答)" },
  { value: "other", label: "Other (その他)" },
];

export default function DocumentUploadForm({ applicationId }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<DocumentType>("resume");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.includes("pdf")) {
        setError("Only PDF files are allowed");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);

    const result = await uploadDocument(applicationId, formData);

    if (!result.success) {
      setError(result.error || "Upload failed");
      setLoading(false);
      return;
    }

    // Reset form
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="fileType"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Document Type
        </label>
        <select
          id="fileType"
          value={fileType}
          onChange={(e) => setFileType(e.target.value as DocumentType)}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        >
          {FILE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="file"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          PDF File
        </label>
        <input
          ref={fileInputRef}
          id="file"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-zinc-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-zinc-400 dark:file:bg-zinc-700 dark:file:text-zinc-200"
        />
        {file && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !file}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
