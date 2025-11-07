import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/utils/mongodb";
import Service from "@/models/Service";
import mongoose from "mongoose"; 


interface ServiceQuery {
  category?: { $regex: RegExp };
  title?: { $regex: RegExp };
  
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const searchTerm = searchParams.get("search");

    const query: ServiceQuery = {};

    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (searchTerm) {
      query.title = { $regex: new RegExp(searchTerm, 'i') };
    }

    const projection = '_id title price category providerId averageRating ratingsCount';

    const services = await Service.find(
        query,
        projection
    )
    .populate('providerId', 'name -_id')
    .sort({ createdAt: -1 });

    return NextResponse.json(services, { status: 200 });

  
  } catch (error: unknown) { 
    console.error("Erro ao buscar serviços públicos:", error);
    let errorMessage = "Erro interno ao buscar os serviços.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}