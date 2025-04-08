import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {

    await dbConnect();
    
    try {
        const { username, code } = await request.json();
        console.log("Username:", username);
        const decodedUsername = decodeURIComponent(username)
        console.log("Decoded username:", decodedUsername);
        const user = await UserModel.findOne({ username });

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found",
            }, { status: 404 });
        }

        const isCodeValid = user.verfyCode === code && new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid) {
            user.isVerified = true;
            await user.save();
            return Response.json({
                success: true,
                message: "User verified successfully",
            }, { status: 200 });
        }
        
        else {
            return Response.json({
                success: false,
                message: "Invalid or expired verification code",
            }, { status: 400 });
        }
        
    } catch (error) {
        console.error("Error verifying code", error);
        return Response.json({
            success: false,
            message: "Error verifying code",
        }, { status: 500 });
    }
}

