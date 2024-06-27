import { dbConnection } from "@/config/dbConfig";
import { NextRequest, NextResponse } from "next/server";

import { middleware } from "@/middleware";
import User from "@/models/user.model";
import { ImageUploader } from "@/helper/imageUploader";
import { allowCors } from "@/lib/cors";  // Import allowCors

dbConnection();

interface CustomNextRequest extends NextRequest {
    user: string;
}

async function getUserDetails(req: CustomNextRequest) {
    try {
        await middleware(req);

        let userId = req.user;

        if (!userId) {
            return NextResponse.json(
                {
                    message: "user id is not provided",
                    error: "",
                    data: null,
                    success: false,
                },
                {
                    status: 401
                }
            );
        }

        const userDetails = await User.findById(userId);

        if (!userDetails) {
            return NextResponse.json(
                {
                    message: "no user found with id '" + userId,
                    error: "",
                    data: null,
                    success: false,
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json(
            {
                message: "Successfully found user details with id '" + userId,
                error: "",
                data: userDetails,
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
                message: "some error occurred while fetching user details",
                error: error.message,
                data: null,
                success: false,
            },
            {
                status: 500
            }
        );
    }
}

async function updateUserProfileImage(req: CustomNextRequest) {
    try {
        await middleware(req);

        let userId = req.user;

        if (!userId) {
            return NextResponse.json(
                {
                    message: "user id is not provided",
                    error: "",
                    data: null,
                    success: false,
                },
                {
                    status: 401
                }
            );
        }

        const { body } = await req.json();
        const { imageFile } = body;

        if (!imageFile) {
            return NextResponse.json(
                {
                    message: "No image file uploaded",
                    error: "",
                    data: null,
                    success: false,
                }
            );
        }

        // Upload image to cloudinary
        let response: any = await ImageUploader(imageFile);

        console.log("uploaded image", response);

        // Update user profile image
        const updatedUser = await User.findByIdAndUpdate(userId, {
            profileImage: response.secure_url,
        });

        return NextResponse.json(
            {
                message: "User profile image updated successfully",
                error: "",
                data: updatedUser,
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
                message: "some error occurred while updating user profile image",
                error: error.message,
                data: null,
                success: false,
            },
            {
                status: 500
            }
        );
    }
}

// Wrap the handlers with allowCors and export them
export const GET = allowCors<CustomNextRequest>(getUserDetails);
export const POST = allowCors<CustomNextRequest>(updateUserProfileImage);


