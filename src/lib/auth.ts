import { validateSession } from "./auth-utils";
import { headers } from "next/headers";
import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return null;
  }

  return await validateSession(token);
}

export type Session = Awaited<ReturnType<typeof getSession>>;
export type User = NonNullable<Session>["user"];
