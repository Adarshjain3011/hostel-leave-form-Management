import { z } from "zod";
import Principal from "@/models/principal.model";
import { NextRequest, NextResponse } from "next/server";
import { createUserAndSetSession } from "@/action/userSignup";
import { allowCors } from "@/lib/cors";

const COLLEGES: Record<string, string> = {
  ccsit: "CCSIT",
};

const principalSchema = z.object({
  college: z.string(),
});

async function principalSignUp(principal: { college: string }) {
  try {
    // Validate the request body using Zod schema
    principalSchema.parse(principal);

    const { college } = principal;

    // Check if the college exists
    if (!COLLEGES[college]) {
      throw new Error("College not found");
    }

    // Create a new principal in the database
    const newPrincipal = await Principal.create({ college });

    // Successfully return the response
    return newPrincipal;
  } catch (error: any) {
    console.log(error.message);
    throw new Error("Some error occurred while creating a principal");
  }
}

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { user, principal } = body;

    // Validate the request body using Zod schema
    principalSchema.parse(principal);

    // Check if the college exists
    const { college } = principal;
    if (!COLLEGES[college]) {
      throw new Error("College not found");
    }

    // Create a new principal in the database
    const newPrincipal = await principalSignUp(principal);

    // Create a new user and set the session
    const newUser = await createUserAndSetSession(user, "djd", newPrincipal._id);

    return NextResponse.json(
      {
        message: "Principal sign up successfully",
        data: {
          newUser,
          newPrincipal,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.log(error.message);

    return NextResponse.json(
      {
        message: "Error occurred in principal signup",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export const POST = allowCors(handler);


