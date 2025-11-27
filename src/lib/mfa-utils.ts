import { authenticator } from "otplib";
import QRCode from "qrcode";
import { randomBytes } from "crypto";

export function generateMFASecret() {
  return authenticator.generateSecret();
}

export async function generateMFAQRCode(email: string, secret: string) {
  const otpauth = authenticator.keyuri(email, "SIAS", secret);
  return await QRCode.toDataURL(otpauth);
}

export function verifyMFAToken(token: string, secret: string) {
  return authenticator.verify({ token, secret });
}

export function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(randomBytes(4).toString("hex").toUpperCase()); // 8 char hex codes
  }
  return codes;
}
