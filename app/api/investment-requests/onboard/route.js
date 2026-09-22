import { createSupabaseServerClient } from "@/lib/supabase-server";
import { makeTemporaryPassword } from "@/lib/temporary-password";
import { sendPortalInvestmentEmails } from "@/lib/portal-email";

const value = (form, key) => String(form.get(key) || "").trim() || null;
const accountNumber = () => `NEAT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

export async function POST(request) {
  try {
    const form = await request.formData();
    const email = value(form, "email")?.toLowerCase();
    const firstName = value(form, "first_name");
    const lastName = value(form, "last_name");
    if (!email || !firstName || !lastName || !value(form, "phone_number")) return Response.json({ error: "Name, email, and phone number are required." }, { status: 400 });
    const supabase = createSupabaseServerClient();
    let { data: customer } = await supabase.from("customers").select("id, auth_user_id, account_number, first_name, last_name, email, phone_number").eq("email", email).maybeSingle();
    let temporaryPassword = null;
    if (!customer) {
      temporaryPassword = makeTemporaryPassword();
      const { data: auth, error: authError } = await supabase.auth.admin.createUser({ email, password: temporaryPassword, email_confirm: true });
      if (authError) return Response.json({ error: authError.message }, { status: 400 });
      const { data, error } = await supabase.from("customers").insert({
        first_name: firstName, last_name: lastName, other_names: value(form, "other_names"), email, phone_number: value(form, "phone_number"),
        gender: value(form, "gender"), date_of_birth: value(form, "date_of_birth"), id_type: value(form, "id_type"), id_number: value(form, "id_number"),
        address: value(form, "address"), state: value(form, "state"), lga: value(form, "lga"), nok_name: value(form, "nok_name"), nok_address: value(form, "nok_address"),
        nok_gender: value(form, "nok_gender"), nok_relationship: value(form, "nok_relationship"), nok_phone_number: value(form, "nok_phone_number"),
        auth_user_id: auth.user.id, account_number: accountNumber(), has_usable_password: false, source: "investment_request",
      }).select("id, auth_user_id, account_number, first_name, last_name, email, phone_number").single();
      if (error) { await supabase.auth.admin.deleteUser(auth.user.id); throw error; }
      customer = data;
    }
    const { data: investment, error: investmentError } = await supabase.from("investments").insert({
      customer_id: customer.id, amount: value(form, "amount"), start_date: value(form, "start_date"), end_date: value(form, "end_date"), rollover: form.get("rollover") === "true",
      payout_schedule: value(form, "payout_schedule"), payout_bank_name: value(form, "payout_bank_name"), payout_account_name: value(form, "payout_account_name"), payout_account_number: value(form, "payout_account_number"),
      vehicle: form.get("vehicle") === "funding" ? "funding" : "ethical", other_instructions: value(form, "other_instructions"), status: "pending", submitted_at: new Date().toISOString(),
    }).select("id, uuid, amount, vehicle").single();
    if (investmentError) throw investmentError;
    try { await sendPortalInvestmentEmails({ customer, investment }); } catch (emailError) { console.error("Portal investment email error:", emailError); }
    return Response.json({ customer_id: customer.id, investment_id: investment.id, temporaryPassword }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message || "Could not submit investment request." }, { status: 500 });
  }
}
