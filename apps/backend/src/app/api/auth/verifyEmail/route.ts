import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { dbConnection } from "@/config/dbConfig";
import { allowCors } from "@/lib/cors";

dbConnection();

interface CustomNextRequest extends NextRequest {
    user: string;
}

async function handler(req: CustomNextRequest) {
    try {
        const body = await req.json();
        const { token } = body;

        console.log("token is ", token);

        // Find the user using the token
        const isUserExists = await User.findOne({
            token: token as string,
            tokenExpiry: { $gt: new Date() } // Check if the token has not expired
        });

        console.log(isUserExists);

        if (!isUserExists) {
            return NextResponse.json(
                {
                    message: "No user exists with this token or token has expired",
                    error: "",
                    data: null,
                    success: false,
                },
                {
                    status: 401,
                }
            );
        }

        // User exists, proceed with verification
        isUserExists.isVerified = true;
        isUserExists.token = "";
        isUserExists.tokenExpiry = null;

        await isUserExists.save();

        return NextResponse.json(
            {
                message: "User successfully verified",
                error: "",
                data: null,
                success: true,
            },
            {
                status: 200,
            }
        );
    } catch (error: any) {
        console.log(error.message);

        return NextResponse.json(
            {
                message: "Some error occurred while verifying the user",
                error: error.message,
                data: null,
                success: false,
            },
            {
                status: 400,
            }
        );
    }
}

export const POST = allowCors(handler);


