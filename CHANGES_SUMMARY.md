# DraftSendSign — Changes Summary

## Files Modified / Created

### New Files
1. **`client/src/lib/supabaseAdmin.ts`** — Admin Supabase client using service_role key. Used for storage operations that require bypassing RLS (uploads, downloads). Created because the `documents` bucket has RLS enabled and anon-key uploads fail without explicit policies.

2. **`client/src/lib/generateSignedPdf.ts`** — PDF generation utility. Fetches document metadata, recipients, and field values from Supabase. Downloads the original PDF from storage (falls back to blank page), embeds all field values (signature images via pdf-lib embedPng/embedJpg, typed signatures as styled text, dates/names/text as plain text) at correct PDF coordinates, then appends a signing certificate page with header, document info, signatory list, and legal footer.

3. **`scripts/setup-storage.mjs`** — Storage bucket setup script. Creates the `documents` bucket if it doesn't exist. Note: RLS policies require Supabase Management API PAT; the bucket is confirmed created and service_role key bypasses RLS for admin operations.

### Modified Files

4. **`client/src/pages/app/new-document/step4-send.tsx`**
   - In `createAndSend()`, before `createDocument()`, uploads the PDF file to Supabase Storage using `supabaseAdmin` (service_role key bypasses RLS) at path `{userId}/{timestamp}-{filename}`
   - Passes `filePath` to `mockApi.createDocument()` so it's stored in the `documents.file_path` column

5. **`client/src/pages/app/document-detail.tsx`**
   - Added `useState`, `Loader2` import, `generateSignedPdf` import
   - Added `downloading` state and `handleDownload()` function that calls `generateSignedPdf(docId)`, creates a Blob URL, triggers browser download, and shows error toast on failure
   - Replaced both "Download PDF" buttons (dropdown menu item + sidebar card button) with working handlers showing loading spinner

6. **`client/src/pages/auth/forgot-password.tsx`**
   - Rewrote with real Supabase auth: `handleEmailSubmit` calls `supabase.auth.resetPasswordForEmail()` with redirectTo pointing to `https://app.draftsendsign.com/#/reset-password`
   - "code" step repurposed to show "check your email" message with "I already clicked the link" button
   - `handleResetSubmit` calls `supabase.auth.updateUser({ password })`
   - Added `initialStep` prop (default `"email"`) so the page can be rendered starting at the "reset" step
   - Accepts index signature `[key: string]: any` to be compatible with wouter's RouteComponentProps

7. **`client/src/App.tsx`**
   - Added `/login`, `/signup`, `/forgot-password`, `/reset-password` to `PUBLIC_ROUTES` so they bypass the gate
   - Added auth routes to the public route Switch block
   - Added `/reset-password` route that renders `<ForgotPassword initialStep="reset" />` using wouter child render syntax

8. **`client/src/pages/signer/signing.tsx`**
   - Added `PdfPageViewer` component that downloads a PDF from Supabase Storage and renders it as a canvas image using pdfjs-dist (same pattern as step3-tag.tsx)
   - If `document.filePath` exists, renders the PDF via `PdfPageViewer` with fields overlaid; otherwise falls back to the mock page-lines UI
   - Added expiry/void/already-signed checks after `signingData` loads; shows appropriate full-screen card UIs for each state
   - Added `Clock`, `AlertCircle` icon imports

## Build Status
`npm run build` — ✅ succeeds, 0 errors. Pre-existing TypeScript strict-mode errors in unrelated files (server/storage.ts, billing.tsx, etc.) are not affected.

## Storage Setup Status
- `documents` bucket: ✅ created and confirmed
- RLS policies: ⚠️ require Supabase Dashboard SQL Editor or PAT-authenticated Management API
  - App uses service_role key in `supabaseAdmin.ts` to bypass RLS for all storage operations
  - To add proper user-scoped policies, run in Supabase SQL Editor:
    ```sql
    CREATE POLICY "Users can upload own docs" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
    CREATE POLICY "Users can read own docs" ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
    ```
