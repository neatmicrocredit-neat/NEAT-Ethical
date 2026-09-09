import { createSupabaseServerClient } from "@/lib/supabase-server";

export const DOCUMENTS_BUCKET =
  process.env.SUPABASE_CUSTOMER_DOCUMENTS_BUCKET ||
  process.env.NEXT_PUBLIC_SUPABASE_CUSTOMER_DOCUMENTS_BUCKET ||
  "id-uploads";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

const SAFE = /[^a-z0-9.-]+/gi;

/**
 * Object keys are derived, never taken from the upload.
 *
 * A browser-supplied filename can contain path separators, and the storage API
 * treats those as folders — so the name is slugged and the directory comes from
 * a value the server chose.
 */
export function objectPath(folder, filename) {
  const clean = String(filename || "file").replace(SAFE, "-").replace(/^-+|-+$/g, "").slice(-80) || "file";
  return `${String(folder).replace(SAFE, "-")}/${Date.now()}-${clean}`;
}

/**
 * Put one file in the documents bucket and hand back a public URL.
 * Returns null for an empty field so callers can treat "no file" as normal.
 */
export async function uploadDocument(file, folder, supabase = createSupabaseServerClient()) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${file.name || "That file"} is larger than ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.`);
  }

  const path = objectPath(folder, file.name);
  const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(`Could not upload ${file.name || "the file"}: ${error.message}`);

  const { data } = supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path, mimeType: file.type || null, size: file.size, name: file.name || "file" };
}
