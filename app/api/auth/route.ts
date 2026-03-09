import { NextRequest, NextResponse } from "next/server";
import { loginUser, registerUser } from "@/lib/server/users";
import { createSessionToken, getSessionCookieName } from "@/lib/server/session";

function withSessionCookie(response: NextResponse, user: { id: string; email: string; role?: "CUSTOMER" | "ADMIN"; name?: string }) {
  const token = createSessionToken({
    id: user.id,
    email: user.email,
    role: user.role ?? "CUSTOMER",
    name: user.name,
  });
  response.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mode = (body.mode as "login" | "register" | undefined) ?? "login";
    const email = body.email?.trim();
    const password = body.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }

    if (mode === "register") {
      const name = String(body.name ?? "").trim();
      if (name.length < 2) {
        return NextResponse.json(
          { error: "A név legalább 2 karakter legyen." },
          { status: 400 }
        );
      }
      const user = await registerUser({ name, email, password });
      const response = NextResponse.json({
        user,
        token: "session",
      });
      return withSessionCookie(response, user);
    }

    const user = await loginUser({ email, password });

    const response = NextResponse.json({
      user,
      token: "session",
    });
    return withSessionCookie(response, user);
  } catch (error) {
    console.error("POST /api/auth error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Hitelesítési hiba" },
      { status: 500 }
    );
  }
}
