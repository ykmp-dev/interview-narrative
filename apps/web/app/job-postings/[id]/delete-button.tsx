"use client";

import { useState } from "react";
import { deleteJobPosting } from "../actions";

type Props = {
  id: string;
};

export default function DeleteButton({ id }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job posting?")) {
      return;
    }

    setLoading(true);
    try {
      await deleteJobPosting(id);
    } catch (error) {
      console.error("Error deleting job posting:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
