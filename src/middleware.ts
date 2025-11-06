import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Token de autenticação não fornecido." },
      { status: 401 }
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);

    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { error: "Token inválido ou expirado." },
      { status: 401 } 
    );
  }
}

export const config = {
  matcher: [
    "/api/services/private/:path*",
    "/api/users/private/:path*",
  ],
};
