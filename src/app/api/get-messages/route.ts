import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET() {

    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !user) {
        return Response.json({
            success: false,
            message: "Unauthorized",
        }, { status: 401 });
    }
    
    const userId = new mongoose.Types.ObjectId(user.id);

    try {
        const userDoc = await UserModel.findById(userId).lean();

        if (!userDoc) {
        return Response.json({
            success: false,
            message: "User not found",
        }, { status: 404 });
        }

        // Sort messages by createdAt in descending order
        const sortedMessages = (userDoc.messages || []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );


        if (sortedMessages.length === 0) {
            return Response.json({
                success: false,
                message: "No messages found",
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            messages: sortedMessages,
        }, { status: 200 });

    } catch (error) {

        console.error("Error getting messages", error);
        return Response.json({
            success: false,
            message: "Error getting messages",
        }, { status: 500 });
    }


}
