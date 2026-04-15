1.  *Project Setup:*
    *   Create a monorepo structure with `frontend` (Next.js) and `backend` (Express).
    *   Configure `pnpm-workspace.yaml`.
    *   Set up Prisma in the backend.
2.  *Frontend UI Implementation:*
    *   Implement "High Contrast Mode" as default in `globals.css` with 16px minimum font size.
    *   Create a persistent `Disclaimer` component.
    *   Build the `UploadDocument` component with OCR simulation and loading animations (ensure accessibility for animations).
    *   Build the `MedicationDashboard` component with large interactive elements for tracking medication.
    *   Assemble the main page (`src/app/page.tsx`).
3.  *Backend Setup:*
    *   Create basic Express setup (`index.ts`).
    *   Define PostgreSQL schema with Prisma (User model for MVP magic link prep).
4.  *Pre-commit check:*
    *   Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
5.  *Submit PR:*
    *   Submit the initial skeleton PR.
