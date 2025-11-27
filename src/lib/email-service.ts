import nodemailer from "nodemailer";

// Configure transport
// In production, you would use real credentials from env vars
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER || "test",
    pass: process.env.SMTP_PASS || "test",
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/verify-email?token=${token}`;

  if (process.env.NODE_ENV === "development") {
    console.log("=================================");
    console.log(`📧 Sending verification email to ${email}`);
    console.log(`🔗 Verification URL: ${verificationUrl}`);
    console.log("=================================");
    return;
  }

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || "noreply@sias.edu",
      to: email,
      subject: "Verify your email address - SIAS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to SIAS</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <div style="margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Don't throw error to prevent blocking sign up flow, but log it
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/reset-password?token=${token}`;

  if (process.env.NODE_ENV === "development") {
    console.log("=================================");
    console.log(`📧 Sending password reset email to ${email}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);
    console.log("=================================");
    return;
  }

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || "noreply@sias.edu",
      to: email,
      subject: "Reset your password - SIAS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Password Reset Request</h1>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <div style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}
