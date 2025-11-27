import crypto from "crypto";

// Use environment variable or generate a key (in production, use env var)
const ENCRYPTION_KEY =
  process.env.LOG_ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const ALGORITHM = "aes-256-gcm";

// Convert hex string to buffer
function getKeyBuffer(): Buffer {
  return Buffer.from(ENCRYPTION_KEY.slice(0, 64), "hex");
}

export function encryptLogData(data: any): string {
  try {
    const iv = crypto.randomBytes(16);
    const key = getKeyBuffer();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const jsonData = JSON.stringify(data);
    const encrypted = Buffer.concat([
      cipher.update(jsonData, "utf8"),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Return as JSON string with iv, encrypted data, and auth tag
    return JSON.stringify({
      iv: iv.toString("hex"),
      data: encrypted.toString("hex"),
      tag: authTag.toString("hex"),
    });
  } catch (error) {
    console.error("Encryption error:", error);
    // Fallback to unencrypted if encryption fails
    return JSON.stringify(data);
  }
}

export function decryptLogData(encryptedString: string | any): any {
  // If it's already an object (old logs before encryption), return as-is
  if (typeof encryptedString === "object" && encryptedString !== null) {
    return encryptedString;
  }

  // If it's not a string, return empty object
  if (typeof encryptedString !== "string") {
    return {};
  }

  try {
    const { iv, data, tag } = JSON.parse(encryptedString);
    const key = getKeyBuffer();

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(tag, "hex"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data, "hex")),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString("utf8"));
  } catch (error) {
    console.error("Decryption error:", error);
    // Try to parse as plain JSON (backwards compatibility)
    try {
      return JSON.parse(encryptedString);
    } catch {
      return {};
    }
  }
}
