import { createHash, createHmac, randomInt, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { sendPasswordChangeCodeEmail } from "@/lib/portal-email";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const cookieName = "customer_password_change";
const secret = () => process.env.PASSWORD_CHANGE_CODE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
const hash = (value) => createHash("sha256").update(value).digest("hex");
const sign = (value) => createHmac("sha256", secret()).update(value).digest("hex");
function validChallenge(raw, userId, code) { try { const [payload, signature] = raw.split("."); if (!payload || !signature || !timingSafeEqual(Buffer.from(sign(payload)), Buffer.from(signature))) return false; const data = JSON.parse(Buffer.from(payload, "base64url").toString()); return data.userId === userId && data.expiresAt > Date.now() && timingSafeEqual(Buffer.from(data.codeHash), Buffer.from(hash(code))); } catch { return false; } }

export async function POST(request) {
  const body = await request.json(); const store = await cookies(); const token = store.get("customer_access_token")?.value;
  if (!token) return Response.json({ error: "Sign in first." }, { status: 401 });
  const supabase = createSupabaseServerClient(); const { data } = await supabase.auth.getUser(token);
  if (!data?.user?.email) return Response.json({ error: "Your session has expired." }, { status: 401 });
  const { data: customer } = await supabase.from("customers").select("has_usable_password").eq("auth_user_id", data.user.id).maybeSingle();
  if (body.action === "first-password") {
    if (customer?.has_usable_password !== false) return Response.json({ error: "Your password has already been set." }, { status: 400 });
    if (!body.password || body.password.length < 8) return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    const { error } = await supabase.auth.admin.updateUserById(data.user.id, { password: body.password });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    await supabase.from("customers").update({ has_usable_password: true, password_changed_at: new Date().toISOString() }).eq("auth_user_id", data.user.id);
    return Response.json({ ok: true });
  }
  const { error: currentPasswordError } = await supabase.auth.signInWithPassword({ email: data.user.email, password: body.current_password });
  if (currentPasswordError) return Response.json({ error: "Your current password is incorrect." }, { status: 401 });
  if (body.action === "send") { const code = String(randomInt(100000, 1000000)); const payload = Buffer.from(JSON.stringify({ userId: data.user.id, codeHash: hash(code), expiresAt: Date.now() + 10 * 60 * 1000 })).toString("base64url"); store.set(cookieName, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 }); await sendPasswordChangeCodeEmail({ email: data.user.email }, code); return Response.json({ ok: true }); }
  if (!body.password || body.password.length < 8) return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  if (!body.code || !validChallenge(store.get(cookieName)?.value || "", data.user.id, String(body.code))) return Response.json({ error: "That confirmation code is invalid or has expired." }, { status: 401 });
  const { error } = await supabase.auth.admin.updateUserById(data.user.id, { password: body.password }); if (error) return Response.json({ error: error.message }, { status: 400 });
  store.set(cookieName, "", { httpOnly: true, path: "/", maxAge: 0 }); await supabase.from("customers").update({ has_usable_password: true, password_changed_at: new Date().toISOString() }).eq("auth_user_id", data.user.id); return Response.json({ ok: true });
}
