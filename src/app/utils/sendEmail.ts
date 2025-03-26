import nodemailer from 'nodemailer';
import config from '../../config';


export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 2525,
      secure: false, // Use TLS, `false` ensures STARTTLS
      auth: {
        user: config.brevo_email, // Your email address
        pass: config.brevo_pass, // Your app-specific password
      },
    })

    const mailOptions = {
      from: `"Support Team" <${config.email}>`, // Sender's name and email
      to, // Recipient's email
      subject, // Email subject
      text: html.replace(/<[^>]+>/g, ''), // Generate plain text version by stripping HTML tags
      html, // HTML email body
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    // Log the success message
    console.log(`Email sent: ${info.messageId}`);
    return info.messageId;
  } catch (error) {
    // @ts-ignore
    console.error(`Error sending email: ${error.message}`);
    throw new Error('Failed to send email. Please try again later.');
  }
};
