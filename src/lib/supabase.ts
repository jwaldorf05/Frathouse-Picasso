import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

// Service-role client — never expose to the browser.
// Used only in server-side code (API routes, webhook, server components).
export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  _supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  return _supabase;
}


export interface Order {
  id: string;
  stripe_session_id: string;
  order_number: string;
  status: "new" | "processing" | "sent_to_supplier" | "shipped" | "delivered" | "cancelled" | "test_order";
  customer_email: string;
  customer_name: string | null;
  shipping_name: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  amount_total: number;
  discount_amount: number | null;
  discount_code: string | null;
  supplier_order_id: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  sign_id: string | null;
  sign_name: string | null;
  dimensions: string | null;
  selected_color: string | null;
  selected_format: string | null;
  design_file_url: string | null;
  quantity: number;
  unit_price: number;
}
