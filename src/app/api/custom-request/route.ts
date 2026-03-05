import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const description = formData.get("description") as string;
    const width = formData.get("width") as string | null;
    const length = formData.get("length") as string | null;
    const unit = (formData.get("unit") as string) || "in";
    const files = formData.getAll("files") as File[];

    // Validate required fields
    if (!name || !email || !description) {
      return NextResponse.json(
        { error: "Name, email, and description are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // File size validation (10MB per file)
    const maxFileSize = 10 * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxFileSize) {
        return NextResponse.json(
          { error: `"${file.name}" exceeds the 10MB file size limit. Please compress it and try again.` },
          { status: 400 }
        );
      }
    }

    // Build dimension string
    const dimensionLine =
      width && length
        ? `${width} × ${length} ${unit}`
        : width
        ? `Width: ${width} ${unit}`
        : length
        ? `Length: ${length} ${unit}`
        : null;

    // Convert uploaded files to Resend attachment format
    const attachments = await Promise.all(
      files
        .filter((f) => f.size > 0)
        .map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          return {
            filename: file.name,
            content: Buffer.from(arrayBuffer),
          };
        })
    );

    // HTML email body
    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px 32px; border-radius: 8px;">
        <div style="margin-bottom: 32px; border-bottom: 1px solid #222; padding-bottom: 24px;">
          <h1 style="font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ffffff; margin: 0 0 4px 0;">New Custom Design Request</h1>
          <p style="color: #888; font-size: 13px; margin: 0;">Frathouse Picasso — Custom Order Intake</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; width: 140px;">From</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #fff; font-size: 15px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Reply To</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #fff; font-size: 15px;"><a href="mailto:${email}" style="color: #a78bfa; text-decoration: none;">${email}</a></td>
          </tr>
          ${dimensionLine ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Dimensions</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #fff; font-size: 15px;">${dimensionLine}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Attachments</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #fff; font-size: 15px;">${attachments.length > 0 ? `${attachments.length} file${attachments.length > 1 ? "s" : ""} attached` : "None"}</td>
          </tr>
        </table>

        <div style="margin-bottom: 32px;">
          <p style="color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Description</p>
          <div style="background: #111; border: 1px solid #222; border-radius: 6px; padding: 20px; color: #e5e5e5; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${description}</div>
        </div>

        <div style="border-top: 1px solid #222; padding-top: 20px; color: #555; font-size: 12px;">
          Sent via frathousepicasso.com — Custom Design Form
        </div>
      </div>
    `;

    const { error: resendError } = await resend.emails.send({
      from: "Frathouse Picasso <onboarding@resend.dev>",
      to: ["jonathanwaldorf05@gmail.com"],
      replyTo: email,
      subject: `Custom Design Request — ${name}`,
      html: htmlBody,
      attachments,
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (error) {
    console.error("Custom request error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
