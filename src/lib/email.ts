import type { Order, OrderItem } from "@/lib/supabase";

interface EmailSendOptions {
  idempotencyKey?: string;
}

interface ResendEmailPayload {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
}

interface ResendEmailResponse {
  id?: string;
}

function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY || null;
}

function getFromEmail(): string {
  const configuredFrom = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return configuredFrom.includes("<") ? configuredFrom : `Frathouse Picasso <${configuredFrom}>`;
}

function getOwnerEmail(): string | string[] {
  const ownerEmail = process.env.RESEND_OWNER_EMAIL || "";
  
  // If no owner email is set, log a warning
  if (!ownerEmail) {
    console.warn("⚠️ RESEND_OWNER_EMAIL not set. Emails will not be delivered to owner.");
    console.warn("   Add RESEND_OWNER_EMAIL=your-email@gmail.com to your environment variables.");
    return "";
  }
  
  // Support comma-separated list of emails
  if (ownerEmail.includes(",")) {
    return ownerEmail.split(",").map(e => e.trim()).filter(Boolean);
  }
  
  return ownerEmail;
}

function formatAddress(order: Order): string {
  const parts = [
    order.shipping_name,
    order.shipping_address_line1,
    order.shipping_address_line2,
    [order.shipping_city, order.shipping_state, order.shipping_postal_code]
      .filter(Boolean)
      .join(", "),
    order.shipping_country,
  ].filter(Boolean);
  return parts.join("\n");
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function isDeliverableEmail(email: string | null | undefined): email is string {
  if (!email) return false;

  const normalized = email.trim().toLowerCase();
  if (!normalized || normalized.endsWith("@no-email.invalid")) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

async function sendResendEmail(
  payload: ResendEmailPayload,
  options?: EmailSendOptions
): Promise<ResendEmailResponse> {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options?.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend send failed (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as ResendEmailResponse;
}

function itemsTable(items: OrderItem[]): string {
  return items
    .map((item) => {
      const details = [
        item.dimensions ? `Size: ${item.dimensions}` : null,
        item.selected_color ? `Color: ${item.selected_color}` : null,
        item.selected_format ? `Format: ${item.selected_format}` : null,
      ]
        .filter(Boolean)
        .join(" • ");

      const name = [item.sign_name, details].filter(Boolean).join(" — ");
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #222;">${name || "Item"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:right;">${formatCents(item.unit_price)}</td>
      </tr>`;
    })
    .join("");
}

function baseHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'DM Sans',Arial,sans-serif;color:#cccccc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#111;padding:24px 32px;border-bottom:2px solid #ff4d4d;">
            <span style="font-size:22px;font-weight:700;color:#ededed;letter-spacing:1px;">FRATHOUSE PICASSO</span>
          </td>
        </tr>
        <tr><td style="padding:32px;">${body}</td></tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #222;font-size:12px;color:#666;">
            Frathouse Picasso &mdash; Custom Street Signs &amp; More
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendCustomerConfirmation(
  order: Order,
  items: OrderItem[],
  options?: EmailSendOptions
): Promise<string | undefined> {
  const apiKey = getResendApiKey();
  const from = getFromEmail();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!isDeliverableEmail(order.customer_email)) {
    throw new Error(`Customer confirmation recipient is invalid: ${order.customer_email || "missing"}`);
  }

  const addressHtml = formatAddress(order).replace(/\n/g, "<br>");

  const body = `
    <h2 style="color:#ededed;margin:0 0 8px;">Order Confirmed!</h2>
    <p style="color:#999;margin:0 0 24px;">Hi ${order.customer_name || "there"}, thanks for your order.</p>

    <div style="background:#111;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:13px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Order Number</div>
      <div style="font-size:24px;font-weight:700;color:#ff4d4d;">${order.order_number}</div>
    </div>

    <h3 style="color:#ededed;margin:0 0 12px;font-size:15px;">Your Items</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background:#111;">
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;text-transform:uppercase;">Item</th>
          <th style="padding:8px 12px;text-align:center;font-size:12px;color:#666;text-transform:uppercase;">Qty</th>
          <th style="padding:8px 12px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsTable(items)}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:12px 12px 4px;text-align:right;font-weight:600;color:#ededed;">Total</td>
          <td style="padding:12px 12px 4px;text-align:right;font-weight:600;color:#ededed;">${formatCents(order.amount_total)}</td>
        </tr>
      </tfoot>
    </table>

    <h3 style="color:#ededed;margin:0 0 12px;font-size:15px;">Shipping To</h3>
    <div style="background:#111;border-radius:6px;padding:16px 20px;margin-bottom:24px;color:#ccc;line-height:1.7;">
      ${addressHtml}
    </div>

    <div style="background:#1a1a1a;border-left:3px solid #ff4d4d;padding:16px 20px;border-radius:0 6px 6px 0;margin-bottom:24px;">
      <p style="margin:0;color:#ccc;">
        <strong style="color:#ededed;">Estimated delivery:</strong> 5-7 business days.
        We'll send you another email with tracking info once your order ships.
      </p>
    </div>

    <p style="color:#666;font-size:13px;">Questions? Reply to this email and we'll get back to you.</p>
  `;

  const result = await sendResendEmail({
    from,
    to: order.customer_email,
    subject: `Order Confirmed – ${order.order_number}`,
    html: baseHtml(`Order Confirmed – ${order.order_number}`, body),
  }, options);

  return result.id;
}

export async function sendOwnerOrderNotification(
  order: Order,
  items: OrderItem[],
  options?: EmailSendOptions
): Promise<string | undefined> {
  const apiKey = getResendApiKey();
  const from = getFromEmail();
  const ownerEmail = getOwnerEmail();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  // Validate owner email(s)
  if (!ownerEmail || (Array.isArray(ownerEmail) && ownerEmail.length === 0)) {
    throw new Error("Owner notification recipient is not configured (RESEND_OWNER_EMAIL missing)");
  }

  // Validate each email if it's an array
  if (Array.isArray(ownerEmail)) {
    const invalidEmails = ownerEmail.filter(email => !isDeliverableEmail(email));
    if (invalidEmails.length > 0) {
      throw new Error(`Invalid owner email addresses: ${invalidEmails.join(", ")}`);
    }
  } else if (!isDeliverableEmail(ownerEmail)) {
    throw new Error(`Owner notification recipient is invalid: ${ownerEmail}`);
  }

  const addressText = formatAddress(order);
  const addressHtml = addressText.replace(/\n/g, "<br>");

  const body = `
    <h2 style="color:#ededed;margin:0 0 8px;">New Order Received</h2>
    <p style="color:#999;margin:0 0 24px;">A new order has been placed.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0;color:#666;font-size:13px;width:140px;">Order Number</td>
        <td style="padding:8px 0;color:#ff4d4d;font-weight:700;font-size:18px;">${order.order_number}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#666;font-size:13px;">Customer</td>
        <td style="padding:8px 0;color:#ededed;">${order.customer_name || "—"}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#666;font-size:13px;">Email</td>
        <td style="padding:8px 0;color:#ededed;">${order.customer_email}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#666;font-size:13px;">Total</td>
        <td style="padding:8px 0;color:#ededed;">${formatCents(order.amount_total)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#666;font-size:13px;">Stripe Session</td>
        <td style="padding:8px 0;color:#666;font-size:12px;word-break:break-all;">${order.stripe_session_id}</td>
      </tr>
    </table>

    <h3 style="color:#ededed;margin:0 0 12px;font-size:15px;">Items Ordered</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background:#111;">
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;text-transform:uppercase;">Item</th>
          <th style="padding:8px 12px;text-align:center;font-size:12px;color:#666;text-transform:uppercase;">Qty</th>
          <th style="padding:8px 12px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;">Unit Price</th>
        </tr>
      </thead>
      <tbody>${itemsTable(items)}</tbody>
    </table>

    <h3 style="color:#ededed;margin:0 0 12px;font-size:15px;">📦 Ship To (copy-paste ready)</h3>
    <div style="background:#111;border:1px solid #333;border-radius:6px;padding:20px;margin-bottom:24px;font-family:monospace;font-size:14px;color:#ccc;line-height:1.8;white-space:pre-wrap;">${addressText}</div>
  `;

  const result = await sendResendEmail({
    from,
    to: ownerEmail,
    subject: `New Order – ${order.order_number} from ${order.customer_name || order.customer_email}`,
    html: baseHtml(`New Order – ${order.order_number}`, body),
  }, options);

  return result.id;
}

export async function sendShippingNotification(
  order: Order,
  options?: EmailSendOptions,
): Promise<string | undefined> {
  const apiKey = getResendApiKey();
  const from = getFromEmail();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!isDeliverableEmail(order.customer_email)) {
    throw new Error(`Shipping notification recipient is invalid: ${order.customer_email || "missing"}`);
  }

  const trackingSection = order.tracking_number
    ? `
      <div style="margin-bottom:24px;">
        <h3 style="color:#ededed;margin:0 0 12px;font-size:15px;">Track Your Order</h3>
        <div style="background:#111;border-radius:6px;padding:16px 20px;">
          <div style="margin-bottom:8px;">
            <span style="color:#666;font-size:13px;">Tracking Number: </span>
            <span style="color:#ccc;font-family:monospace;">${order.tracking_number}</span>
          </div>
          ${order.tracking_url
            ? `<a href="${order.tracking_url}" style="display:inline-block;background:#ff4d4d;color:#fff;text-decoration:none;padding:10px 20px;border-radius:4px;font-weight:600;margin-top:8px;">Track Package →</a>`
            : ""}
        </div>
      </div>
    `
    : "";

  const body = `
    <h2 style="color:#ededed;margin:0 0 8px;">Your Order Has Shipped! 🚀</h2>
    <p style="color:#999;margin:0 0 24px;">Great news, ${order.customer_name || "there"} — your order is on its way.</p>

    <div style="background:#111;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:13px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Order Number</div>
      <div style="font-size:20px;font-weight:700;color:#ff4d4d;">${order.order_number}</div>
    </div>

    ${trackingSection}

    <p style="color:#666;font-size:13px;">Questions about your shipment? Reply to this email and we'll help you out.</p>
  `;

  const result = await sendResendEmail({
    from,
    to: order.customer_email,
    subject: `Your Order ${order.order_number} Has Shipped!`,
    html: baseHtml(`Your Order ${order.order_number} Has Shipped!`, body),
  }, options);

  return result.id;
}

export async function sendDeliveryNotification(
  order: Order,
  options?: EmailSendOptions,
): Promise<string | undefined> {
  const apiKey = getResendApiKey();
  const from = getFromEmail();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!isDeliverableEmail(order.customer_email)) {
    throw new Error(`Delivery notification recipient is invalid: ${order.customer_email || "missing"}`);
  }

  const body = `
    <h2 style="color:#ededed;margin:0 0 8px;">Your Order Has Been Delivered! 🎉</h2>
    <p style="color:#999;margin:0 0 24px;">Hey ${order.customer_name || "there"} — your order has been delivered!</p>

    <div style="background:#111;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:13px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Order Number</div>
      <div style="font-size:20px;font-weight:700;color:#ff4d4d;">${order.order_number}</div>
    </div>

    <div style="background:#1a1a1a;border-left:3px solid #10b981;padding:16px 20px;border-radius:0 6px 6px 0;margin-bottom:24px;">
      <p style="margin:0;color:#ccc;">
        <strong style="color:#10b981;">✓ Delivered</strong><br/>
        We hope you love your order! If you have any issues or questions, don't hesitate to reach out.
      </p>
    </div>

    <p style="color:#666;font-size:13px;">Enjoy your new gear! If you have any concerns about your order, reply to this email and we'll make it right.</p>
  `;

  const result = await sendResendEmail({
    from,
    to: order.customer_email,
    subject: `Your Order ${order.order_number} Has Been Delivered!`,
    html: baseHtml(`Your Order ${order.order_number} Has Been Delivered!`, body),
  }, options);

  return result.id;
}
