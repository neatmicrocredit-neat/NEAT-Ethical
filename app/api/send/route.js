import { sendInvestmentEmails } from "@/lib/email";


export async function POST(request) {
  try {

    const formData = await request.json();
    console.log("Sending mail with formData", formData);

    await sendInvestmentEmails({
      customer: formData.customer || {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
      },
      investment: formData.investment || {
        id: formData.referenceId,
        amount: formData.amount,
        vehicle: formData.vehicle,
      },
    });

    return Response.json({ message: "Email Sent Successfully" }, { status: 200 });
  } catch (error) {
    console.log("Error with mailer:", error);
    return Response.json({ error: error.message || "Could not send email." }, { status: 500 });
  }
}