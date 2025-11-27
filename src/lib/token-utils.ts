import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.AUTH_SECRET || "default-secret-change-me-in-prod";

export function signToken(payload: string): string {
  const timestamp = Date.now();
  const data = `${payload}.${timestamp}`;
  const signature = createHmac("sha256", SECRET).update(data).digest("hex");
  return `${data}.${signature}`;
}

export function verifyToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [payload, timestamp, signature] = parts;
  const data = `${payload}.${timestamp}`;
  const expectedSignature = createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");

  if (signature !== expectedSignature) return null;

  // Check expiry (e.g., 5 minutes)
  const now = Date.now();
  if (now - parseInt(timestamp) > 5 * 60 * 1000) return null;

  return payload;
}
