import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request) {
  const { password } = await request.json();
  if (!password || password.length < 8) return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  const store = await cookies();
  const token = store.get("customer_access_token")?.value;
  if (!token) return Response.json({ error: "Sign in first." }, { status: 401 });
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser(token);
  if (!data?.user) return Response.json({ error: "Your session has expired." }, { status: 401 });
  const { error } = await supabase.auth.admin.updateUserById(data.user.id, { password });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await supabase.from("customers").update({ has_usable_password: true, password_changed_at: new Date().toISOString() }).eq("auth_user_id", data.user.id);
  return Response.json({ ok: true });
}
