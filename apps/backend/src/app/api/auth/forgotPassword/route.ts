import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { allowCors } from "@/lib/cors";
import { sendMail } from "@/helper/sendMail";

const forgotPasswordSchema = z.object({
  newPassword: z.string(),
  confirmPassword: z.string(),
  token: z.string(),
});

async function handler(req: NextRequest) {
  try {
    const body = await req.json();

    try {
      forgotPasswordSchema.parse(body);
    } catch (error: any) {
      console.log(error.message);
      return new NextResponse(JSON.stringify({
        message: "All fields are not fulfilled",
        data: null,
        error: error.message,
      }), { status: 400 });
    }

    const { newPassword, confirmPassword, token } = body;

    if (newPassword !== confirmPassword) {
      return new NextResponse(JSON.stringify({
        message: "Passwords do not match",
        data: null,
        error: null,
      }), { status: 400 });
    }

    const userExists = await User.findOne({ token });

    if (!userExists) {
      return new NextResponse(JSON.stringify({
        message: "No user exists with this token",
        data: null,
        error: null,
      }), { status: 400 });
    }

    if (!userExists.isVerified) {
      return new NextResponse(JSON.stringify({
        message: "User is not verified, please verify first",
        data: null,
        error: null,
      }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 8);

    const updatedPassword = await User.findByIdAndUpdate(userExists._id, {
      password: hashedPassword,
    }, { new: true });

    return new NextResponse(JSON.stringify({
      message: "Your password has been updated",
      error: null,
      data: updatedPassword,
    }), { status: 200 });

  } catch (error: any) {
    console.log(error.message);
    return new NextResponse(JSON.stringify({
      message: "Some error occurred while updating the password",
      data: null,
      error: error.message,
    }), { status: 500 });
  }
}

export const POST = allowCors(handler);
