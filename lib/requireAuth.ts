import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function requireAuth() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const payload = verifyToken(token);

  return {
    userId: payload.userId,
    organizationId: payload.organizationId,
    role: payload.role,
  };
}
