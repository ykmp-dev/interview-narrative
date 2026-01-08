\# Project: interview-narrative



\## Goal

Build a web app that:

\- Takes a Job Description (JD), resume/work history PDFs, and narrative interview answers

\- Generates a requirements x evidence matrix tailored to that JD

\- Generates interview Q\&A (STAR outlines) and good reverse questions



\## Stack

\- Next.js (App Router) app in `apps/web`

\- Supabase (Auth + Row Level Security)

\- Package manager: pnpm



\## Language

\- Use \*\*Japanese\*\* for explanations, planning, and comments in tasks.

\- Use \*\*English\*\* for code, file names, commit messages, and commands.



\## Quality gates

Before finishing any task, always run:

\- `pnpm -C apps/web lint`

\- `pnpm -C apps/web build`



\## Rules

\- Always: Explore -> Plan -> Implement -> Verify -> Commit.

\- If something is unclear, ask questions instead of guessing.

\- Keep changes small and focused on a single concern.

\- Do not modify database schema or RLS unless explicitly asked.



