
import { jwtVerify } from "jose";

export async function getUserFromToken(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      console.warn("Token não fornecido no header Authorization");
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return payload.id as string;
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return null;
  }
}
