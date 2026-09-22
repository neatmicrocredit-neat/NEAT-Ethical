import { Resend } from "resend";
import { staffRecipients } from "@/lib/notification-config";

const from = process.env.RESEND_FROM || "NEAT Ethical Investments <info@neatethical.com>";

function mailer() {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured.");
  return new Resend(process.env.RESEND_API_KEY);
}

async function send({ to, subject, text }) {
  const { error } = await mailer().emails.send({ from, to, subject, text, html: `<p>${text.replace(/\n/g, "<br />")}</p>` });
  if (error) throw new Error(error.message || "Email could not be sent.");
}

export async function sendPortalSignupEmail(customer) {
  await send({ to: [customer.email], subject: "Welcome to NEAT Ethical Investments", text: `Welcome ${customer.first_name}. Your customer account is ready. Your account number is ${customer.account_number}.` });
}

export async function sendPortalInvestmentEmails({ customer, investment }) {
  const text = `${customer.first_name} ${customer.last_name} requested an investment of ₦${Number(investment.amount).toLocaleString()} (${investment.vehicle || "ethical"}). Please provide investment advice/confirmation within 24 hours.`;
  await Promise.all([
    send({ to: staffRecipients(), subject: `Investment advice needed: ${customer.first_name} ${customer.last_name}`, text }),
    send({ to: [customer.email], subject: "Investment request received", text: "Your investment request has been received. Our team will send investment advice and confirmation within 24 hours." }),
  ]);
}

export async function sendPortalFundingEmails({ customer, request }) {
  const text = `${customer.first_name} ${customer.last_name} requested funding of ₦${Number(request.amount).toLocaleString()} for account ${customer.account_number}.`;
  await Promise.all([
    send({ to: staffRecipients(), subject: `Funding request: ${customer.first_name} ${customer.last_name}`, text }),
    send({ to: [customer.email], subject: "Funding request received", text: `Your funding request has been received. Your account number is ${customer.account_number}.` }),
  ]);
}

export async function sendPortalLoanEmails({ customer, request }) {
  const text = `${customer.first_name} ${customer.last_name} requested a loan of ₦${Number(request.amount).toLocaleString()} for ${request.term_months} months. Purpose: ${request.purpose}. Please respond within 48 hours.`;
  await Promise.all([
    send({ to: staffRecipients(), subject: `Loan request: ${customer.first_name} ${customer.last_name}`, text }),
    send({ to: [customer.email], subject: "Loan request received", text: "Your loan request has been received. NEAT Ethical will respond within 48 hours." }),
  ]);
}
