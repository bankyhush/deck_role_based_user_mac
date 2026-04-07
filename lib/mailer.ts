import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="font-size: 20px; font-weight: 600; color: #18181b;">
          Verify your email
        </h2>
        <p style="color: #71717a; font-size: 14px; line-height: 1.6;">
          Click the button below to verify your email address.
          This link expires in <strong>24 hours</strong>.
        </p>
        <a href="${verifyUrl}"
          style="display: inline-block; margin-top: 16px; padding: 10px 24px;
          background: #18181b; color: white; border-radius: 8px;
          text-decoration: none; font-size: 14px; font-weight: 500;">
          Verify email
        </a>
        <p style="color: #a1a1aa; font-size: 12px; margin-top: 24px;">
          If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  });
}
