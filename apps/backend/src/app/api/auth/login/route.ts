import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { isEmailAlreadyExist } from "@/helper/isEmailExists";
import { dbConnection } from "@/config/dbConfig";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Student from "@/models/student.model";
import { getDataFromToken } from "@/helper/getDataFromToken";
import User from "@/models/user.model";
import { allowCors } from "@/lib/cors";

// Define the login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Connect to the database
dbConnection();

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    try {
      loginSchema.parse(body);
    } catch (error: any) {
      console.log(error.message);
      return new NextResponse(
        JSON.stringify({
          message: "All fields are not fulfilled",
          data: null,
          error: error.message,
        }),
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Check if user exists
    const isUserExists = await isEmailAlreadyExist(email);
    console.log("is user exists", isUserExists);

    if (!isUserExists) {
      return new NextResponse(
        JSON.stringify({
          message: "This user does not exist with this email address",
          data: null,
          error: null,
          success: false,
        }),
        { status: 400 }
      );
    }

    // Check if user is verified
    if (!isUserExists.isVerified) {
      return new NextResponse(
        JSON.stringify({
          message: "User is not verified",
          data: null,
          error: null,
          success: false,
        }),
        { status: 400 }
      );
    }

    // Check if password matches
    const isPasswordMatch = await bcrypt.compare(password, isUserExists.password);

    if (!isPasswordMatch) {
      return new NextResponse(
        JSON.stringify({
          message: "Password does not match",
          data: null,
          error: null,
          success: false,
        }),
        { status: 400 }
      );
    }

    // Create token
    const tokenValue = {
      id: isUserExists._id,
      email: isUserExists.email,
      profileImage: isUserExists.profileImage,
      role: isUserExists.role,
    };

    const token = jwt.sign(
      tokenValue,
      process.env.NEXT_PUBLIC_JWT_SECRET_KEY as string,
      {
        expiresIn: "24h",
      }
    );

    const user = await User.findById(isUserExists._id).select("_id email profileImage fullName");

    const response = new NextResponse(
      JSON.stringify({
        message: "User logged in successfully",
        status: 200,
        data: user,
        error: null,
      }),
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    return response;
  } catch (error: any) {
    console.log(error.message);
    return new NextResponse(
      JSON.stringify({
        message: "Some error occurred while logging in",
        data: null,
        error: error.message,
        success: false,
      }),
      { status: 400 }
    );
  }
}

async function handleGet(req: NextRequest) {
  try {
    const studentId = getDataFromToken(req);

    const isStudentExists = await Student.findById(studentId);

    if (!isStudentExists) {
      return new NextResponse(
        JSON.stringify({
          message: "No user exists with this user ID",
          data: null,
          error: "",
          success: false,
        }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Successfully found the user",
        data: isStudentExists,
        error: "",
        success: true,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error.message);
    return new NextResponse(
      JSON.stringify({
        message: "Some error occurred while fetching user data",
        data: null,
        error: error.message,
        success: false,
      }),
      { status: 400 }
    );
  }
}

export const POST = allowCors(handlePost);
export const GET = allowCors(handleGet);


