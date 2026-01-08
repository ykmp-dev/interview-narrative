"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  Application,
  Document,
  JobPosting,
} from "@/lib/database.types";

// Extended type for document with file metadata
export type DocumentWithMeta = Document;

export async function getApplication(id: string): Promise<Application | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching application:", error);
    return null;
  }

  return data as Application;
}

export type ApplicationWithJobPosting = Application & {
  job_posting: JobPosting;
};

export async function getApplicationWithJobPosting(
  id: string
): Promise<ApplicationWithJobPosting | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get application
  const { data: appData, error: appError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (appError || !appData) {
    console.error("Error fetching application:", appError);
    return null;
  }

  const app = appData as Application;

  // Get job posting
  const { data: jobPosting, error: jpError } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", app.job_posting_id)
    .single();

  if (jpError || !jobPosting) {
    console.error("Error fetching job posting:", jpError);
    return null;
  }

  return {
    ...app,
    job_posting: jobPosting as JobPosting,
  };
}

export async function getApplicationDocuments(
  applicationId: string
): Promise<Document[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get document IDs from junction table
  const { data: junctionData, error: junctionError } = await supabase
    .from("application_documents")
    .select("document_id")
    .eq("application_id", applicationId);

  if (junctionError || !junctionData || junctionData.length === 0) {
    return [];
  }

  const documentIds = junctionData.map((j) => j.document_id);

  // Get documents
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .in("id", documentIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }

  return (data as Document[]) || [];
}

export type DocumentType = "resume" | "cv" | "narrative" | "other";

export async function uploadDocument(
  applicationId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  const fileType = formData.get("fileType") as DocumentType;

  if (!file || !fileType) {
    return { success: false, error: "File and file type are required" };
  }

  // Validate file type
  if (!file.type.includes("pdf")) {
    return { success: false, error: "Only PDF files are allowed" };
  }

  // Generate unique file name
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = `${user.id}/${applicationId}/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("interview-docs")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { success: false, error: uploadError.message };
  }

  // Insert document record
  const { data: docData, error: docError } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      file_name: fileName,
      original_name: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: fileType,
      // TODO: Extract text from PDF for analysis
      extracted_text: null,
    })
    .select("id")
    .single();

  if (docError) {
    console.error("Document insert error:", docError);
    // Try to clean up uploaded file
    await supabase.storage.from("interview-docs").remove([filePath]);
    return { success: false, error: docError.message };
  }

  // Link document to application
  const { error: linkError } = await supabase
    .from("application_documents")
    .insert({
      application_id: applicationId,
      document_id: docData!.id,
    });

  if (linkError) {
    console.error("Link error:", linkError);
    return { success: false, error: linkError.message };
  }

  return { success: true };
}

export async function deleteDocument(
  applicationId: string,
  documentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify application belongs to user
  const { data: app, error: appError } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .single();

  if (appError || !app) {
    return { success: false, error: "Application not found" };
  }

  // Get document to find file path
  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", documentId)
    .single();

  if (fetchError || !doc) {
    return { success: false, error: "Document not found" };
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("interview-docs")
    .remove([doc.file_path]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
  }

  // Delete document record (cascade will remove junction table entry)
  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  return { success: true };
}

export async function getDocumentDownloadUrl(
  applicationId: string,
  documentId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify application belongs to user
  const { data: app, error: appError } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .single();

  if (appError || !app) {
    return { success: false, error: "Application not found" };
  }

  // Get document to find file path
  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", documentId)
    .single();

  if (fetchError || !doc) {
    return { success: false, error: "Document not found" };
  }

  const { data, error } = await supabase.storage
    .from("interview-docs")
    .createSignedUrl(doc.file_path, 60 * 60); // 1 hour expiry

  if (error) {
    console.error("Error creating signed URL:", error);
    return { success: false, error: error.message };
  }

  return { success: true, url: data.signedUrl };
}
