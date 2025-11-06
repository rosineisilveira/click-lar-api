import { NextResponse, NextRequest } from "next/server"; 
import { connectDB } from "@/utils/mongodb";
import Service from "@/models/Service";
import User from "@/models/User"; 

export async function GET(request: NextRequest) { 
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const searchTerm = searchParams.get("search"); 
 
    const query: any = {}; 

    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') }; 
    }

    if (searchTerm) {
      query.title = { $regex: new RegExp(searchTerm, 'i') }; 
    }

    const services = await Service.find(
        query, 
        '_id title price category providerId averageRating ratingsCount' 
    ).populate('providerId', 'name -_id')
    .sort({ createdAt: -1 });; 
    return NextResponse.json(services, { status: 200 });

  } catch (error) {
    console.error("Erro ao buscar serviços públicos:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar serviços." },
      { status: 500 }
    );
  }
}
