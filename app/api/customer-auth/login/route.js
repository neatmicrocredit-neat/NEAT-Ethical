import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request) {
  const { email, password } = await request.json();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) return Response.json({ error: error?.message || "Invalid credentials." }, { status: 401 });
  const store = await cookies();
  store.set("customer_access_token", data.session.access_token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: data.session.expires_in || 3600 });
  return Response.json({ ok: true });
}
