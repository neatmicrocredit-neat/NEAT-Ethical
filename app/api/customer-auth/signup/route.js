import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendPortalSignupEmail } from "@/lib/portal-email";

function accountNumber() {
  return `NEAT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const firstName = String(body.first_name || "").trim();
    const lastName = String(body.last_name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!firstName || !lastName || !email || password.length < 8) return Response.json({ error: "Names, email, and a password of at least 8 characters are required." }, { status: 400 });

    const supabase = createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (authError) return Response.json({ error: authError.message }, { status: 400 });

    const { data: customer, error } = await supabase.from("customers").insert({
      first_name: firstName, last_name: lastName, email, phone_number: String(body.phone_number || "").trim() || null,
      auth_user_id: authData.user.id, account_number: accountNumber(), has_usable_password: true, source: "customer_portal",
    }).select("id, uuid, first_name, last_name, email, account_number").single();
    if (error) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return Response.json({ error: error.message }, { status: 500 });
    }
    try {
      await sendPortalSignupEmail(customer);
      await supabase.from("customers").update({ onboarding_email_sent_at: new Date().toISOString(), onboarding_email_error: null }).eq("id", customer.id);
    } catch (emailError) {
      console.error("Signup email error:", emailError);
      await supabase.from("customers").update({ onboarding_email_error: emailError.message || "Delivery failed" }).eq("id", customer.id);
    }
    return Response.json({ customer }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message || "Could not create account." }, { status: 500 });
  }
}
