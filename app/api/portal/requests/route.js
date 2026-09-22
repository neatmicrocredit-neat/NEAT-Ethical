import { requireCustomer } from "@/lib/customer-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendPortalFundingEmails, sendPortalInvestmentEmails, sendPortalLoanEmails } from "@/lib/portal-email";

const number = (value) => Number(String(value || "").replace(/[^0-9.]/g, ""));

export async function POST(request) {
  try {
    const { customer } = await requireCustomer();
    const body = await request.json();
    const type = body.type;
    const supabase = createSupabaseServerClient();
    let result;
    if (type === "funding") {
      const amount = number(body.amount);
      if (!amount) return Response.json({ error: "Enter a funding amount." }, { status: 400 });
      const { data, error } = await supabase.from("funding_requests").insert({ customer_id: customer.id, amount, note: body.note || null }).select("*").single();
      if (error) throw error;
      result = data;
      try { await sendPortalFundingEmails({ customer, request: data }); } catch (emailError) { console.error(emailError); }
    } else if (type === "loan") {
      const amount = number(body.amount);
      const termMonths = Number(body.term_months);
      if (!amount || !termMonths || !body.purpose) return Response.json({ error: "Loan amount, purpose, and term are required." }, { status: 400 });
      const { data, error } = await supabase.from("loan_requests").insert({ customer_id: customer.id, amount, purpose: body.purpose, term_months: termMonths }).select("*").single();
      if (error) throw error;
      result = data;
      try { await sendPortalLoanEmails({ customer, request: data }); } catch (emailError) { console.error(emailError); }
    } else if (type === "investment") {
      const amount = number(body.amount);
      if (!amount) return Response.json({ error: "Enter an investment amount." }, { status: 400 });
      const { data, error } = await supabase.from("investments").insert({ customer_id: customer.id, amount, vehicle: body.vehicle === "funding" ? "funding" : "ethical", status: "pending", submitted_at: new Date().toISOString(), other_instructions: body.note || null }).select("*").single();
      if (error) throw error;
      result = data;
      try { await sendPortalInvestmentEmails({ customer, investment: data }); } catch (emailError) { console.error(emailError); }
    } else return Response.json({ error: "Unknown request type." }, { status: 400 });
    return Response.json({ request: result }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message || "Could not submit request." }, { status: 500 });
  }
}
