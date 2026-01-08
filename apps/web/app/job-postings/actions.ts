"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { JobPosting } from "@/lib/database.types";

export type CreateJobPostingInput = {
  jobTitle: string;
  companyName: string;
  jdText: string;
  sourceUrl?: string;
};

export async function createJobPosting(input: CreateJobPostingInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("job_postings")
    .insert({
      user_id: user.id,
      job_title: input.jobTitle,
      company_name: input.companyName,
      raw_text: input.jdText,
      source_url: input.sourceUrl || null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/job-postings/${data!.id}`);
}

export async function getJobPostings() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("job_postings")
    .select("id, job_title, company_name, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching job postings:", error);
    return [];
  }

  return data;
}

export async function getJobPosting(id: string): Promise<JobPosting | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching job posting:", error);
    return null;
  }

  return data as JobPosting;
}

export async function deleteJobPosting(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("job_postings")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/job-postings");
}
