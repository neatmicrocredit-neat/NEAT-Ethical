import { CustomerEmailTemplate } from '@/components/email/customer-mail';
import { StaffEmailTemplate } from '@/components/email/staff-mail';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendStaffMail({
  first_name,
  last_name,
  email,
  phone_number,
  amount,
  vehicle,
  submittedOn,
  referenceId,
  ...props
}){
  const { data, error } = await resend.emails.send({
    from: 'NEAT Ethical Investments <signups@neatmicrocredit.com.ng>',
    to: ['7thogofe@gmail.com'],
    subject: 'Welcome to NEAT Ethical Investments',
    react: StaffEmailTemplate({
      first_name: first_name,
      last_name: last_name,
      phone_number: phone_number,
      email: email
    }),
  });

  if (error) {
    console.log("Error sending mail to staff:", error)
    throw Error("Error sending mail to staff", {
      cause: error
    })
  }
}

async function sendCustomerMail({ first_name, last_name, amount, ...props }) {
  const { data, error } = await resend.emails.send({
    from: 'NEAT Ethical Investments <signups@neatmicrocredit.com.ng>',
    to: [email],
    subject: 'Welcome to NEAT Ethical Investments',
    react: CustomerEmailTemplate({
      first_name,
      last_name,
      amount
    }),
  });
  
  if (error) {
    console.log("Error sending mail to customer:", error);
    throw Error("Error sending mail to customer", {
      cause: error
    })
  }
}


export async function POST(request) {
  try {

    const formData =  await request.json();
    console.log('Sending mail with formData', formData);

    await sendStaffMail(formData);
    await sendCustomerMail(formData);
    
    return Response.json({data, oldData}, { status: 200 });
} catch (error) {
    console.log("Error with mailer:", error);
    return Response.json({ error }, { status: 500 });
  }
}