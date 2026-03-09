import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/api-auth";
import { createSessionToken, getSessionCookieName, type SessionUser } from "@/lib/server/session";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Nincs aktív session." }, { status: 401 });
  }

  const configuredAdmin = normalizeEmail(process.env.ADMIN_EMAIL ?? "admin@babyonline.hu");
  const shouldBeAdmin = normalizeEmail(user.email) === configuredAdmin;

  if (shouldBeAdmin && user.role !== "ADMIN") {
    const upgradedUser: SessionUser = { ...user, role: "ADMIN" };
    const forwardedProto = request.headers.get("x-forwarded-proto")?.toLowerCase();
    const isSecureRequest = forwardedProto === "https" || request.nextUrl.protocol === "https:";
    const response = NextResponse.json({ user: upgradedUser });
    response.cookies.set(getSessionCookieName(), createSessionToken(upgradedUser), {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureRequest,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  return NextResponse.json({ user });
}

