import { CustomerEmailTemplate } from '@/components/email/customer-mail';
// import { EmailTemplate } from '@/components/email/customer-mail';
import { Resend } from 'resend';

// const resend = new Resend("re_MZZUHst9_J5hnDFQxPb1fSDz3YRhySuMC");
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function POST(request) {
  try {

    const oldData =  await request.json();

    console.log('Sending mail with oldData', oldData);


    const { data, error } = await resend.emails.send({
    //   from: 'NEAT Ethical Investments <joel.o@neatmicrocredit.com.ng>',
      from: 'NEAT Ethical Investments <tjogofe@gmail.com>',
      to: [oldData.email],
      subject: 'Welcome to NEAT Ethical Investments',
      react: CustomerEmailTemplate({
        first_name: oldData.first_name,
        last_name: oldData.last_name,
        phone_number: oldData.phone_number,
        email: oldData.email
      }),
    });

    if (error) {
        console.log("Error sending mail:", error)
        return Response.json({ error }, { status: 500 });
    }
    
    return Response.json({data, oldData}, { status: 200 });
} catch (error) {
      console.log("Error with mailer:", error)
    return Response.json({ error }, { status: 500 });
  }
}