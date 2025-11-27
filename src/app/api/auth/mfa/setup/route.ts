import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateMFASecret, generateMFAQRCode } from "@/lib/mfa-utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = generateMFASecret();
    const qrCode = await generateMFAQRCode(session.user.email, secret);

    // Save secret temporarily (or permanently but disabled)
    await db
      .update(users)
      .set({ mfaSecret: secret })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ secret, qrCode });
  } catch (error) {
    console.error("MFA setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
