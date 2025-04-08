import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: Credentials): Promise<IUser | null> {
                await dbConnect();
            
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier },
                        ],
                    });
            
                    if (!user) throw new Error("User not found");
                    if (!user.isVerified) throw new Error("User is not verified");
            
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordValid) throw new Error("Invalid password");
            
                    return user;
            
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        throw new Error(error.message);
                    }
                    throw new Error("Authentication error");
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user}) {
            if (user) {
                token.id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token; 
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session;
        },
    },
    pages: {
        signIn: "/sign-in",
        error: "/sign-in",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,


}


