import { cookies } from "next/headers";
import { createSupabaseServerClient, isMissingTable } from "@/lib/supabase-server";

export async function POST(request) {
  try {
    const { access_token: accessToken, redirectTo } = await request.json();
    if (!accessToken) return Response.json({ error: "Missing authentication token." }, { status: 400 });
    const supabase = createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !userData?.user) return Response.json({ error: "Could not verify your account." }, { status: 401 });

    const { data: customer } = await supabase.from("customers").select("id, has_usable_password").eq("auth_user_id", userData.user.id).maybeSingle();
    const store = await cookies();
    if (customer) {
      store.set("customer_access_token", accessToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 });
      store.set("auth", "", { httpOnly: true, path: "/", maxAge: 0 });
      return Response.json({ destination: customer.has_usable_password === false ? "/auth/reset-password" : "/portal", role: "customer" });
    }

    const { data: member, error: memberError } = await supabase.from("team_members").select("email, status").ilike("email", userData.user.email || "").maybeSingle();
    if (memberError && !isMissingTable(memberError)) return Response.json({ error: "Could not verify staff access." }, { status: 500 });
    if (memberError || !member || member.status !== "active") return Response.json({ error: "This account is not registered for staff access." }, { status: 403 });

    store.set("auth", "true", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 });
    store.set("admin_email", userData.user.email || "", { sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 });
    return Response.json({ destination: redirectTo?.startsWith("/dashboard") ? redirectTo : "/dashboard", role: "staff" });
  } catch (error) {
    return Response.json({ error: error.message || "Could not resolve account." }, { status: 500 });
  }
}
