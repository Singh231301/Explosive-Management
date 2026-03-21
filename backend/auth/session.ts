import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "development-secret");

export type TokenUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function signAccessToken(user: TokenUser) {
  return new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
}

export async function verifyAccessToken(token: string) {
  const verified = await jwtVerify<TokenUser>(token, secret);
  return verified.payload;
}
