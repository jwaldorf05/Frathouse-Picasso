import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, getClientIdentifier, formatTimeRemaining, RATE_LIMITS } from "@/lib/rateLimit";

export const dynamic = 'force-dynamic';

function getResendInstance(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }
  
  return new Resend(apiKey);
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "Frathouse Picasso <onboarding@resend.dev>";
}

function getOwnerEmail(): string {
  return process.env.RESEND_OWNER_EMAIL || process.env.RESEND_FROM_EMAIL || "";
}

export async function POST(request: NextRequest) {
  // Rate limiting - 10 requests per hour
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await rateLimit(clientId, RATE_LIMITS.CUSTOM_REQUEST);

  if (!rateLimitResult.success) {
    const timeRemaining = formatTimeRemaining(rateLimitResult.resetTime);
    return NextResponse.json(
      { 
        error: `Too many form submissions. Please try again in ${timeRemaining}.`,
        retryAfter: rateLimitResult.resetTime,
      },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const signAddress = formData.get("signAddress") as string;
    const coordinates = formData.get("coordinates") as string | null;
    const description = formData.get("description") as string | null; // For custom design page
    const width = formData.get("width") as string | null;
    const length = formData.get("length") as string | null;
    const unit = (formData.get("unit") as string) || "in";
    const files = formData.getAll("files") as File[];

    // Validate required fields - support both procurement (signAddress) and custom design (description)
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // For procurement page, require address or coordinates
    if (signAddress !== null && !signAddress && !coordinates) {
      return NextResponse.json(
        { error: "Name, email, and address/coordinates are required" },
        { status: 400 }
      );
    }

    // For custom design page, require description
    if (description !== null && !description && !signAddress) {
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

    // Determine request type
    const isProcurement = signAddress !== null;
    const requestType = isProcurement ? "Procurement" : "Custom Design";

    // HTML email body
    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px 32px; border-radius: 8px;">
        <div style="margin-bottom: 32px; border-bottom: 1px solid #222; padding-bottom: 24px;">
          <h1 style="font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ffffff; margin: 0 0 4px 0;">New ${requestType} Request</h1>
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
          ${signAddress ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Sign Address</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #fff; font-size: 15px;">${signAddress}</td>
          </tr>` : ""}
          ${coordinates ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Coordinates</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #fff; font-size: 15px;">${coordinates}</td>
          </tr>` : ""}
          ${dimensionLine ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Dimensions</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #fff; font-size: 15px;">${dimensionLine}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Attachments</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; color: #fff; font-size: 15px;">${attachments.length > 0 ? `${attachments.length} file${attachments.length > 1 ? "s" : ""}  attached` : "None"}</td>
          </tr>
        </table>

        ${description ? `
        <div style="margin-bottom: 32px;">
          <p style="color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Description</p>
          <div style="background: #111; border: 1px solid #222; border-radius: 6px; padding: 20px; color: #e5e5e5; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${description}</div>
        </div>` : ""}

        <div style="border-top: 1px solid #222; padding-top: 20px; color: #555; font-size: 12px;">
          Sent via frathousepicasso.com — ${requestType} Form
        </div>
      </div>
    `;

    const resend = getResendInstance();
    const from = getFromEmail();
    const ownerEmail = getOwnerEmail();

    if (!ownerEmail) {
      throw new Error("Missing RESEND_OWNER_EMAIL (or RESEND_FROM_EMAIL) environment variable");
    }

    const { error: resendError } = await resend.emails.send({
      from,
      to: [ownerEmail],
      replyTo: email,
      subject: `${requestType} Request — ${name}`,
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
