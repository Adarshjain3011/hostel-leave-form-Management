import { NextRequest, NextResponse } from 'next/server';
import { z } from "zod";
import Coordinator from "@/models/coordinator.model";
import { middleware } from "@/middleware";
import { createUserAndSetSession } from "@/action/userSignup";
import { allowCors } from '@/lib/cors';

const coordinatorSchema = z.object({
    college: z.string(),
    branch: z.array(z.string()),
    programe: z.string(),
});

interface CustomNextRequest extends NextRequest {

    user?: string;

}

async function CoordinatorSignUp(coordinator: any) {
    try {
        coordinatorSchema.parse(coordinator);
        const { college, branch, programe } = coordinator;

        const newUser = await Coordinator.create({
            college: college,
            branches: branch,
            programe: programe,
        });

        return newUser;
    } catch (error: any) {
        console.log(error.message);

        return new NextResponse(
            JSON.stringify({
                message: "some error occurred while creating a Coordinator",
                error: error.message,
                data: null,
                success: false,
            }),
            { status: 500 }
        );
    }
}

async function handler1(req: NextRequest) {
    try {
        const body = await req.json();
        const { user, coordinator } = body;

        let newCoordinator, newUser;

        try {
            newCoordinator = await CoordinatorSignUp(coordinator);
            newUser = await createUserAndSetSession(user, "kdj", newCoordinator._id);
        } catch (error: any) {
            return new NextResponse(
                JSON.stringify({
                    message: "Error creating coordinator",
                    error: error.message,
                    data: null,
                }),
                { status: 400 }
            );
        }

        return new NextResponse(
            JSON.stringify({
                message: "coordinator created successfully",
                data: {
                    newCoordinator,
                    newUser,
                },
            }),
            { status: 200 }
        );
    } catch (error: any) {
        console.log(error.message);

        return new NextResponse(
            JSON.stringify({
                message: "Failed to create coordinator",
                data: null,
                error: error.message,
            }),
            { status: 500 }
        );
    }
}

async function handler2(req: CustomNextRequest) {
    try {
        await middleware(req);

        const userId = req.user;

        if (!userId) {
            return new NextResponse(
                JSON.stringify({
                    message: "user id is not provided",
                    error: "",
                    data: null,
                    success: false,
                }),
                { status: 401 }
            );
        }

        const coordinator = await Coordinator.findOne({ user: userId });

        if (!coordinator) {
            return new NextResponse(
                JSON.stringify({
                    message: "no coordinator found with id '" + userId,
                    error: "",
                    data: null,
                    success: false,
                }),
                { status: 401 }
            );
        }

        return new NextResponse(
            JSON.stringify({
                message: "Successfully found coordinator details '" + userId,
                error: "",
                data: coordinator,
                success: true,
            }),
            { status: 200 }
        );
    } catch (error: any) {
        console.log(error.message);

        return new NextResponse(
            JSON.stringify({
                message: "some error occurred while fetching coordinator",
                error: error.message,
                data: null,
                success: false,
            }),
            { status: 500 }
        );
    }
}



export const POST = allowCors(handler1);
export const GET = allowCors(handler2);


