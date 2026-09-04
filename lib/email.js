import { Resend } from "resend";

import CustomerWelcomeEmail from "@/components/email/customer-mail";
import { StaffEmailTemplate } from "@/components/email/staff-mail";

const FROM_ADDRESS = process.env.RESEND_FROM || "NEAT Ethical Investments <info@neatethical.com>";
const STAFF_ADDRESS = process.env.RESEND_STAFF_EMAIL || "7thogofe@gmail.com";

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

async function sendEmail(payload) {
  const { data, error } = await getResend().emails.send(payload);
  if (error) throw new Error(error.message || "Resend could not send the email.");
  return data;
}

function formatMessageEmail(html, body) {
  const plainText = String(body || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");
  const content = html || `<p>${plainText}</p>`;
  const contentWithInlineStyles = content
    .replace(/<p(?![^>]*style=)/gi, '<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#152238;"')
    .replace(/<strong(?![^>]*style=)/gi, '<strong style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#152238;font-weight:700;"')
    .replace(/<b(?![^>]*style=)/gi, '<b style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#152238;font-weight:700;"')
    .replace(/<em(?![^>]*style=)/gi, '<em style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#152238;font-style:italic;"')
    .replace(/<i(?![^>]*style=)/gi, '<i style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#152238;font-style:italic;"')
    .replace(/<u(?![^>]*style=)/gi, '<u style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#152238;text-decoration:underline;"')
    .replace(/<(ul|ol)(?![^>]*style=)/gi, '<$1 style="margin:8px 0 10px 20px;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#152238;"')
    .replace(/<li(?![^>]*style=)/gi, '<li style="margin:3px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#152238;"')
    .replace(/<blockquote(?![^>]*style=)/gi, '<blockquote style="margin:10px 0;padding-left:12px;border-left:3px solid #b9cee5;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#152238;"');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
      <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;font-family:Arial,Helvetica,sans-serif;">
          <tr><td style="padding:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#7c8798;">NEAT Ethical Investments</td></tr>
          <tr><td align="right">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width:85%;margin-left:auto;background:#e8f1fb;border-radius:16px;font-family:Arial,Helvetica,sans-serif;">
              <tr><td style="padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#152238;overflow-wrap:anywhere;">${contentWithInlineStyles}</td></tr>
            </table>
          </td></tr>
          <tr><td align="right" style="padding:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#7c8798;">Sent by the NEAT team</td></tr>
        </table>
      </td></tr>
    </table>`;
}

export async function sendInvestmentEmails({ customer, investment }) {
  const submittedOn = new Date().toLocaleDateString("en-US", {
    dateStyle: "long",
  });
  const templateProps = {
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    phone_number: customer.phone_number,
    amount: investment.amount,
    vehicle: investment.vehicle,
    referenceId: investment.uuid || investment.id,
    requestId: investment.uuid || investment.id,
    submittedOn,
  };

  const [staff, customerEmail] = await Promise.all([
    sendEmail({
      from: FROM_ADDRESS,
      to: [STAFF_ADDRESS],
      subject: `New investment request from ${customer.first_name} ${customer.last_name}`,
      react: StaffEmailTemplate(templateProps),
    }),
    sendEmail({
      from: FROM_ADDRESS,
      to: [customer.email],
      subject: "Welcome to NEAT Ethical Investments",
      react: CustomerWelcomeEmail({
        ...templateProps,
        phone: customer.phone_number,
      }),
    }),
  ]);

  return { staff, customer: customerEmail };
}

export async function sendCustomerMessage({ to, subject, body, html, attachments = [] }) {
  return sendEmail({
    from: FROM_ADDRESS,
    to: [to],
    subject: subject || "Message from NEAT Ethical Investments",
    text: body,
    html: formatMessageEmail(html, body),
    attachments: attachments.length ? attachments : undefined,
  });
}

export async function listReceivedEmails() {
  const { data, error } = await getResend().emails.receiving.list({ limit: 100 });
  if (error) throw new Error(error.message || "Resend could not list received emails.");
  return data?.data || [];
}

export async function getReceivedEmail(id) {
  const { data, error } = await getResend().emails.receiving.get(id);
  if (error) throw new Error(error.message || "Resend could not retrieve the received email.");
  return data;
}

export function cleanReceivedText(value) {
  const normalized = String(value || "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((line) => !/^\s*>/.test(line))
    .join("\n")
    .replace(/^\s*-{2,}\s*Original Message\s*-{2,}[\s\S]*$/im, "");
  const quotedHeader = normalized.search(/(?:^|\n)\s*On[\s\S]*?\bwrote:\s*/i);

  return (quotedHeader >= 0 ? normalized.slice(0, quotedHeader) : normalized)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function plainTextToHtml(value) {
  return `<p>${String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />")}</p>`;
}