import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    return NextResponse.json({
      message: "Usuário atualizado com sucesso",
      data: body,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    return NextResponse.json({
      message: `Usuário com id ${id} deletado com sucesso`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao deletar usuário" },
      { status: 500 }
    );
  }
}
