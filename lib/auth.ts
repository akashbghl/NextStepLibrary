import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET not defined in environment variables");
}

export interface JwtPayload {
  userId: string;
  role: "SUPER_ADMIN" | "MANAGER" | "STAFF";
  organizationId: string; 
}

/**
 * Generate JWT Token
 */
export function generateToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Verify JWT Token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
