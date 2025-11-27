import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const token = await createPasswordResetToken(email);

    if (token) {
      await sendPasswordResetEmail(email, token);
    }

    // Always return success to prevent user enumeration
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
