import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";

import { users, sessions, accounts, verifications } from "@/db/schema";

export const auth = betterAuth({
  adapter: drizzleAdapter(db, {
    provider: "pg",
    schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications
    }
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
      },
      department: {
        type: "string",
        required: false,
      },
      securityLevel: {
        type: "string",
        required: false,
        defaultValue: "public",
      },
    },
  },
  plugins: [
    nextCookies(),
    twoFactor({
        otpOptions: {
            async sendOTP({ user, otp }: { user: { email: string }, otp: string }) {
                // In a real app, send email. For dev, log it.
                console.log(`[MFA] OTP for ${user.email}: ${otp}`);
            }
        }
    })
  ]
});

export type Session = typeof auth.$Infer.Session;
export type Auth = typeof auth;
