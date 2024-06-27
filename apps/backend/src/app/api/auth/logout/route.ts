import { NextRequest, NextResponse } from "next/server";
import { allowCors } from "@/lib/cors";

async function handler(req: NextRequest) {
  try {
    const response = NextResponse.json({
      message: "Logout successful",
      success: true,
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0), // Expire the cookie immediately
    });

    return response;
  } catch (error: any) {
    console.log(error.message);

    const response = NextResponse.json({
      message: "Some error occurred while logging out",
      error: error.message,
      success: false,
    }, { status: 500 });

    return response;
  }
}

export const GET = allowCors(handler);


