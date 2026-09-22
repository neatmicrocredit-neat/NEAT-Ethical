import fs from "node:fs";
import path from "node:path";

const fallbackPath = path.join(process.cwd(), "public", "staff-recipients.json");

export function staffRecipients() {
  const fromEnv = String(process.env.NEAT_STAFF_EMAILS || process.env.RESEND_STAFF_EMAIL || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  if (fromEnv.length) return [...new Set(fromEnv)];
  try {
    const file = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
    return [...new Set((file.emails || []).map((email) => String(email).trim()).filter(Boolean))];
  } catch {
    return [];
  }
}
