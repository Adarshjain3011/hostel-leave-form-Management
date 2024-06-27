"use server";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Warden from "@/models/warden.model";
import { createUserAndSetSession } from "@/action/userSignup";
import { dbConnection } from "@/config/dbConfig";
import { allowCors } from "@/lib/cors";

// Database connection
dbConnection();

// Define Hostel List
const HOSTELS = ["New Boys Hostel", "Mala Bhawan", "Gyan Bhawan", "Girls Hostel"];

const wardenSchema = z.object({
  hostel: z.string(),
});

// Function to handle warden signup
async function wardenSignUp(warden: any) {
  try {
    const validatedWarden = wardenSchema.parse(warden);

    if (!HOSTELS.includes(validatedWarden.hostel)) {
      throw new Error("No hostel exists with the given name");
    }

    const { hostel } = validatedWarden;
    const newWarden = await Warden.create({ hostel });

    return newWarden;
  } catch (error: any) {
    console.error('Error creating warden:', error.message);
    throw new Error("Error creating warden");
  }
}

// Handler function for POST request
async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { warden, user } = body;

    if (!warden || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are not fulfilled",
          message: "All fields are required",
          data: null,
        },
        { status: 400 }
      );
    }

    let newWarden;
    let newUser;

    try {
      newWarden = await wardenSignUp(warden);
      newUser = await createUserAndSetSession(user, "dkhd", newWarden?._id);
    } catch (error: any) {
      console.error('Error during signup:', error.message);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          message: "Error occurred during signup",
          data: null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      error: null,
      message: "Warden signup done successfully",
      data: { newWarden, newUser },
    });

  } catch (error: any) {
    console.error('Error parsing request:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Error occurred during request parsing",
        data: null,
      },
      { status: 400 }
    );
  }
}

export const POST = allowCors(handler);


