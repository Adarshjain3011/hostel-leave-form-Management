import { NextRequest, NextResponse } from "next/server";
import { isEmailAlreadyExist } from "@/helper/isEmailExists";
import { sendMail } from "@/helper/sendMail";
import { z } from "zod";
import { allowCors } from '@/lib/cors';

const forgotField = z.object({
  email: z.string().email()
});

async function handler(req: NextRequest) {
  try {
    const body = await req.json();

    try {
      forgotField.parse(body);
    } catch (error: any) {
      console.log(error.message);
      return new NextResponse(JSON.stringify({
        message: "All fields are not fulfilled",
        data: null,
        error: error.message,
      }), { status: 400 });
    }

    const { email } = body;
    const isUserExists = await isEmailAlreadyExist(email);

    if (!isUserExists) {
      return new NextResponse(JSON.stringify({
        message: "No user exists with this email",
        data: null,
        error: null,
      }), { status: 400 });
    }

    if (!isUserExists.isVerified) {
      return new NextResponse(JSON.stringify({
        message: "User is not verified, please verify first",
        data: null,
        error: null,
      }), { status: 400 });
    }

    await sendMail(email, "resetPassword");

    return new NextResponse(JSON.stringify({
      message: "Successfully sent mail to the user for forgot password",
      error: null,
      data: isUserExists,
    }), { status: 200 });

  } catch (error: any) {
    console.log(error.message);
    return new NextResponse(JSON.stringify({
      message: "Some error occurred while sending mail to the user",
      error: error.message,
      data: null,
    }), { status: 500 });
  }
}



export const POST = allowCors(handler);




