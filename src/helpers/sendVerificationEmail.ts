import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const emailHtml = await render(VerificationEmail({ username, otp: verifyCode }));

    // await transporter.sendMail({
    //   from: `"True Feedback" <${process.env.SMTP_USER}>`,
    //   to: email,
    //   subject: "True Feedback | Verification Code",
    //   html: emailHtml,
    // });

    let transporter = nodemailer.createTransport({
        host:process.env.MAIL_HOST,
        port: 587,
        auth:{
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        }
    })

    let info = await transporter.sendMail({
        from: `"True Feedback" <${process.env.SMTP_USER}>`,
        to:email,
        subject: "True Feedback | Verification Code",
        html: emailHtml,
    })



    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (emailError) {
    console.error("Error sending verification email", emailError);
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}