import { NextRequest, NextResponse } from "next/server";
import { middleware } from "@/middleware";
import { z } from "zod";
import User from "@/models/user.model";
import bcrypt from "bcrypt";
import { allowCors } from "@/lib/cors";

const resetPasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string()
});

interface CustomNextRequest extends NextRequest {
    user: string;
}

async function handler(req: CustomNextRequest) {
    try {
        await middleware(req);

        const userId = req.user;
        const body = await req.json();

        if (!userId) {
            return NextResponse.json(
                {
                    message: "User ID is not provided",
                    error: "",
                    data: null,
                    success: false,
                },
                {
                    status: 401
                }
            );
        }

        try {
            resetPasswordSchema.parse(body);
        } catch (error: any) {
            console.log(error.message);
            return NextResponse.json(
                {
                    message: "Fields are not correct",
                    error: error.message,
                    data: null,
                    success: false,
                },
                {
                    status: 401
                }
            );
        }

        const { newPassword, oldPassword } = body;
        console.log(newPassword, oldPassword);

        const isUserExists = await User.findOne({ _id: userId });

        if (!isUserExists) {
            return NextResponse.json(
                {
                    message: "No user exists with this user ID",
                    error: "",
                    data: null,
                    success: false,
                },
                {
                    status: 401
                }
            );
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, isUserExists.password);

        if (!isPasswordMatch) {
            return NextResponse.json(
                {
                    message: "Your password and existing password do not match",
                    error: "",
                    data: null,
                    success: false,
                },
                {
                    status: 401
                }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateUser = await User.findByIdAndUpdate(isUserExists._id, { password: hashedPassword });

        return NextResponse.json(
            {
                message: "Successfully updated user password",
                error: "",
                data: updateUser,
                success: true,
            },
            {
                status: 200
            }
        );
    } catch (error: any) {
        console.log(error.message);
        return NextResponse.json(
            {
                message: "Error occurred",
                error: error.message,
                data: null,
                success: false,
            },
            {
                status: 400
            }
        );
    }
}

export const POST = allowCors(handler);


