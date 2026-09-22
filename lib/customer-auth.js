import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_access_token")?.value;
  if (!token) return { user: null, customer: null };
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser(token);
  if (!userData?.user) return { user: null, customer: null };
  const { data: customer } = await supabase.from("customers").select("*").eq("auth_user_id", userData.user.id).maybeSingle();
  return { user: userData.user, customer };
}

export async function requireCustomer() {
  const session = await getCustomerSession();
  if (!session.customer) throw new Error("Customer authentication required.");
  return session;
}
