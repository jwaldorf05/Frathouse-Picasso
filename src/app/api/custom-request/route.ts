import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const description = formData.get("description") as string;
    const width = formData.get("width") as string | null;
    const length = formData.get("length") as string | null;
    const unit = formData.get("unit") as string;
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
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    for (const file of files) {
      if (file.size > maxFileSize) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 10MB limit` },
          { status: 400 }
        );
      }
    }

    // In a production environment, you would:
    // 1. Use a service like SendGrid, Mailgun, or AWS SES to send emails
    // 2. Store files in cloud storage (S3, Cloudinary, etc.)
    // 3. Save the request to a database
    
    // For now, we'll log the request and return success
    console.log("Custom Design Request Received:");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Description:", description);
    if (width || length) {
      console.log("Dimensions:", width && length ? `${width} x ${length} ${unit}` : width ? `Width: ${width} ${unit}` : `Length: ${length} ${unit}`);
    }
    console.log("Files:", files.map(f => ({ name: f.name, size: f.size, type: f.type })));

    // TODO: Implement email sending
    // Example with a hypothetical email service:
    // await sendEmail({
    //   to: "jonathanwaldorf05@gmail.com",
    //   subject: `Custom Design Request from ${name}`,
    //   html: `
    //     <h2>New Custom Design Request</h2>
    //     <p><strong>Name:</strong> ${name}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Description:</strong></p>
    //     <p>${description}</p>
    //     ${width || length ? `<p><strong>Dimensions:</strong> ${width && length ? `${width} x ${length} ${unit}` : width ? `Width: ${width} ${unit}` : `Length: ${length} ${unit}`}</p>` : ''}
    //     <p><strong>Files:</strong> ${files.length} file(s) attached</p>
    //   `,
    //   attachments: files
    // });

    return NextResponse.json(
      { 
        success: true,
        message: "Request submitted successfully. We'll get back to you soon!"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing custom request:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
