import { NextResponse } from "next/server";
import { CATEGORIES } from "@/utils/categories";

export async function GET() {
  try {
    return NextResponse.json(CATEGORIES, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar as categorias." },
      { status: 500 }
    );
  }
}