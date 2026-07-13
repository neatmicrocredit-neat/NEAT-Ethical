import { createSupabaseServerClient } from "@/lib/supabase-server";

const emptyToNull = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

async function uploadFile(supabase, formData, fieldName, customerKey) {
  const file = formData.get(fieldName);
  if (!file || typeof file === "string" || file.size === 0) return null;

  const bucket = process.env.SUPABASE_CUSTOMER_DOCUMENTS_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_CUSTOMER_DOCUMENTS_BUCKET || "id-uploads";
  const extension = file.name?.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `${customerKey}/${fieldName}-${Date.now()}.${extension}`;
  
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw new Error(`Could not upload ${fieldName}: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const supabase = createSupabaseServerClient();
    const firstName = emptyToNull(formData.get("first_name"));
    const lastName = emptyToNull(formData.get("last_name"));
    const email = emptyToNull(formData.get("email"));
    const phoneNumber = emptyToNull(formData.get("phone_number"));

    if (!firstName || !lastName || !email || !phoneNumber) {
      return Response.json({ error: "First name, last name, email, and phone number are required." }, { status: 400 });
    }

    const customerKey = `${Date.now()}-${email.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
    const [imageUrl, idFrontUrl, idBackUrl] = await Promise.all([
      uploadFile(supabase, formData, "image", customerKey),
      uploadFile(supabase, formData, "id_front", customerKey),
      uploadFile(supabase, formData, "id_back", customerKey),
    ]);

    const customerPayload = {
      first_name: firstName,
      last_name: lastName,
      other_names: emptyToNull(formData.get("other_names")),
      email,
      phone_number: phoneNumber,
      gender: emptyToNull(formData.get("gender")),
      date_of_birth: emptyToNull(formData.get("date_of_birth")),
      id_type: emptyToNull(formData.get("id_type")),
      id_number: emptyToNull(formData.get("id_number")),
      address: emptyToNull(formData.get("address")),
      state: emptyToNull(formData.get("state")),
      lga: emptyToNull(formData.get("lga")),
      id_front_url: idFrontUrl,
      id_back_url: idBackUrl,
      image_url: imageUrl,
      nok_name: emptyToNull(formData.get("nok_name")),
      nok_address: emptyToNull(formData.get("nok_address")),
      nok_gender: emptyToNull(formData.get("nok_gender")),
      nok_relationship: emptyToNull(formData.get("nok_relationship")),
      nok_phone_number: emptyToNull(formData.get("nok_phone_number")),
    };

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert(customerPayload)
      .select("id")
      .single();

    if (customerError) {
      console.error("Customer insert error:", customerError);
      return Response.json({ error: `Failed to create customer: ${customerError.message}` }, { status: 500 });
    }

    const investmentPayload = {
      customer_id: customer.id,
      amount: emptyToNull(formData.get("amount")),
      start_date: emptyToNull(formData.get("start_date")),
      end_date: emptyToNull(formData.get("end_date")),
      rollover: formData.get("rollover") === "true",
      payout_schedule: emptyToNull(formData.get("payout_schedule")),
      payout_bank_name: emptyToNull(formData.get("payout_bank_name")),
      payout_account_name: emptyToNull(formData.get("payout_account_name")),
      payout_account_number: emptyToNull(formData.get("payout_account_number")),
      other_instructions: emptyToNull(
        [
          `Vehicle: ${formData.get("vehicle") === "funding" ? "Neat Funding" : "Neat Ethical"}`,
          emptyToNull(formData.get("other_instructions")),
        ].filter(Boolean).join("\n")
      ),
    };

    const { data: investment, error: investmentError } = await supabase
      .from("investments")
      .insert(investmentPayload)
      .select("id")
      .single();

    if (investmentError) {
      console.error("Investment insert error:", investmentError);
      return Response.json({ error: `Failed to create investment: ${investmentError.message}` }, { status: 500 });
    }

    return Response.json({ customer_id: customer.id, investment_id: investment.id }, { status: 201 });
  } catch (error) {
    console.error("Investment request error:", error);
    return Response.json({ error: error.message || "Could not submit investment request." }, { status: 500 });
  }
}
