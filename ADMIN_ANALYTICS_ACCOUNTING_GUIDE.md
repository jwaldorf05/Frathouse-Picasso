# Admin Analytics & Accounting Implementation Guide

## ✅ What's Been Created

### **New Admin Pages:**
1. **Analytics Page** (`/admin/analytics`) - Site performance metrics
2. **Accounting Page** (`/admin/accounting`) - Financial overview
3. **Navigation Component** - Icon-based navigation between admin sections

### **Navigation:**
- **Orders** 📋 - Manage orders (existing)
- **Analytics** 📊 - Site metrics (new)
- **Accounting** 💰 - Financials (new)

All pages share a consistent header with navigation icons!

---

## 📊 Analytics Page - What You Can Implement

### **Data You Already Have:**

#### **From Orders Table:**
```sql
SELECT * FROM orders;
```
- `order_number` - Unique order ID
- `customer_email` - Customer identifier
- `customer_name` - Customer name
- `amount_total` - Order total (in cents)
- `discount_amount` - Discount applied
- `discount_code` - Promo code used
- `status` - Order status
- `created_at` - Order timestamp
- `stripe_session_id` - Payment session

#### **From Order Items Table:**
```sql
SELECT * FROM order_items;
```
- `sign_id` - Product ID
- `sign_name` - Product name
- `quantity` - Items ordered
- `unit_price` - Price per item

### **Metrics You Can Calculate:**

#### **1. Total Revenue**
```typescript
const totalRevenue = orders.reduce((sum, order) => {
  if (order.status !== 'cancelled') {
    return sum + order.amount_total;
  }
  return sum;
}, 0);
```

#### **2. Total Orders**
```typescript
const totalOrders = orders.filter(o => o.status !== 'cancelled').length;
```

#### **3. Average Order Value (AOV)**
```typescript
const aov = totalRevenue / totalOrders;
```

#### **4. Revenue Over Time**
```typescript
// Group by day/week/month
const revenueByDate = orders.reduce((acc, order) => {
  const date = new Date(order.created_at).toLocaleDateString();
  acc[date] = (acc[date] || 0) + order.amount_total;
  return acc;
}, {});
```

#### **5. Top Products**
```typescript
// From order_items
const productSales = items.reduce((acc, item) => {
  acc[item.sign_name] = (acc[item.sign_name] || 0) + item.quantity;
  return acc;
}, {});
```

#### **6. Conversion Rate**
**Note:** You'd need to track page visits separately (see below)

#### **7. Customer Insights**
```typescript
// New vs returning customers
const uniqueCustomers = new Set(orders.map(o => o.customer_email));
const newCustomers = orders.filter(o => {
  const customerOrders = orders.filter(x => x.customer_email === o.customer_email);
  return customerOrders.length === 1;
});

// Customer Lifetime Value
const clv = orders.reduce((acc, order) => {
  acc[order.customer_email] = (acc[order.customer_email] || 0) + order.amount_total;
  return acc;
}, {});
```

#### **8. Discount Usage**
```typescript
const discountStats = {
  totalDiscounts: orders.filter(o => o.discount_amount > 0).length,
  totalDiscountAmount: orders.reduce((sum, o) => sum + (o.discount_amount || 0), 0),
  topCodes: /* group by discount_code */
};
```

### **What You Need for Full Analytics:**

#### **Missing Data (Optional Additions):**

1. **Page Views / Traffic**
   - **Solution:** Google Analytics 4 (free)
   - **Alternative:** Plausible Analytics, Vercel Analytics
   - **What it gives:** Visitors, page views, bounce rate, traffic sources

2. **Conversion Funnel**
   - Track: Homepage → Product Page → Cart → Checkout → Purchase
   - **Solution:** Custom event tracking or GA4

3. **Cart Abandonment**
   - Track when users add to cart but don't complete checkout
   - **Solution:** Store cart sessions in database

4. **Product Views**
   - Track which products are viewed most
   - **Solution:** Custom analytics or GA4

---

## 💰 Accounting Page - What You Can Implement

### **Data You Already Have:**

#### **Revenue Metrics:**
```typescript
// Gross Revenue
const grossRevenue = orders
  .filter(o => o.status !== 'cancelled')
  .reduce((sum, o) => sum + o.amount_total, 0);

// Discounts Given
const totalDiscounts = orders
  .reduce((sum, o) => sum + (o.discount_amount || 0), 0);

// Net Revenue
const netRevenue = grossRevenue - totalDiscounts;
```

#### **Transaction History:**
- All orders are transactions
- Can show: Date, Order #, Customer, Amount, Status
- Filter by date range, status, etc.

### **What You're Missing (For Full Accounting):**

#### **1. Cost of Goods Sold (COGS)**
**What you need:**
- Cost per product (what you pay supplier)
- Shipping costs to you
- Production costs

**Where to store:**
- Add `cost_price` column to products table
- Or create `product_costs` table

**Example:**
```sql
ALTER TABLE order_items ADD COLUMN cost_price INTEGER;
```

Then calculate:
```typescript
const cogs = items.reduce((sum, item) => {
  return sum + (item.cost_price * item.quantity);
}, 0);

const grossProfit = netRevenue - cogs;
```

#### **2. Operating Expenses**
**What you need to track:**
- Stripe fees (2.9% + $0.30 per transaction)
- Resend email costs
- Hosting costs (Vercel, Supabase)
- Domain registration
- Marketing spend
- Software subscriptions

**Solution:**
Create an `expenses` table:
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  date DATE,
  category TEXT, -- 'payment_processing', 'hosting', 'marketing', etc.
  description TEXT,
  amount INTEGER, -- in cents
  vendor TEXT,
  created_at TIMESTAMP
);
```

#### **3. Stripe Fees (Automatic)**
```typescript
// Calculate Stripe fees
const stripeFees = orders.reduce((sum, order) => {
  const percentFee = order.amount_total * 0.029; // 2.9%
  const fixedFee = 30; // $0.30 in cents
  return sum + percentFee + fixedFee;
}, 0);
```

#### **4. Refunds**
**What you need:**
- Track refunded orders
- Add `refunded_at` column to orders
- Or create `refunds` table

```sql
ALTER TABLE orders ADD COLUMN refunded_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN refund_amount INTEGER;
```

---

## 🔧 Implementation Roadmap

### **Phase 1: Basic Analytics (Using Existing Data)**

**What to implement:**
1. ✅ Total Revenue
2. ✅ Total Orders
3. ✅ Average Order Value
4. ✅ Revenue chart (by day/week/month)
5. ✅ Top products
6. ✅ Customer count
7. ✅ Discount usage stats

**How:**
- Fetch orders and order_items from Supabase
- Calculate metrics in the page component
- Display in the placeholder cards/charts

**Effort:** 2-4 hours

---

### **Phase 2: Add Charting Library**

**Recommended:** Recharts (free, React-friendly)
```bash
npm install recharts
```

**Example:**
```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

<LineChart data={revenueData}>
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="revenue" stroke="#ff4d4d" />
</LineChart>
```

**Effort:** 1-2 hours

---

### **Phase 3: Add Google Analytics**

**Why:** Track page views, traffic sources, conversion rate

**Setup:**
1. Create GA4 account (free)
2. Install `@next/third-parties`
3. Add tracking code

**Example:**
```typescript
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </html>
  )
}
```

**Effort:** 30 minutes

---

### **Phase 4: Basic Accounting**

**What to implement:**
1. ✅ Gross Revenue
2. ✅ Net Revenue (after discounts)
3. ✅ Stripe Fees (calculated)
4. ✅ Transaction list
5. ✅ Monthly breakdown

**How:**
- Use existing order data
- Calculate Stripe fees automatically
- Group by month/quarter

**Effort:** 2-3 hours

---

### **Phase 5: Advanced Accounting (Optional)**

**What to add:**
1. Expenses table
2. COGS tracking
3. Profit margins
4. Cash flow projections
5. Export to CSV/Excel

**Effort:** 4-8 hours

---

## 🔒 Security Considerations

### **Should You Have Accounting Online?**

**✅ Pros:**
- Real-time access anywhere
- Automated calculations
- No manual data entry
- Integration with existing systems

**❌ Cons:**
- Security risk if breached
- Requires strong authentication
- Compliance considerations (if you grow)

### **Best Practices:**

#### **1. Authentication**
✅ Already implemented:
- Admin login required
- Session-based auth
- Protected routes

#### **2. Additional Security (Recommended):**

**Two-Factor Authentication (2FA):**
```bash
npm install @supabase/auth-helpers-nextjs
```

**IP Whitelisting:**
- Only allow access from your IP
- Configure in Vercel/hosting settings

**Audit Logs:**
- Track who accessed what and when
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_email TEXT,
  action TEXT,
  resource TEXT,
  timestamp TIMESTAMP
);
```

#### **3. Data Sensitivity:**

**Low Risk (OK to store online):**
- ✅ Order totals
- ✅ Product sales
- ✅ Customer counts
- ✅ Revenue trends

**Medium Risk (Be careful):**
- ⚠️ Customer emails
- ⚠️ Detailed expenses
- ⚠️ Profit margins

**High Risk (Consider offline):**
- ❌ Bank account details
- ❌ Tax documents
- ❌ Personal financial info

### **Recommendation:**
**For a small business like yours:**
- ✅ **Analytics:** Totally fine online
- ✅ **Basic Accounting:** Revenue, orders, basic expenses - OK
- ❌ **Full Accounting:** Tax prep, bank details - use QuickBooks/Xero

---

## 🆓 Free Tools & Services

### **Analytics:**
1. **Google Analytics 4** - Free, comprehensive
2. **Vercel Analytics** - Free tier, simple
3. **Plausible** - Privacy-focused (paid but cheap)

### **Accounting Software:**
1. **Wave** - FREE accounting software
   - Invoicing, expenses, reports
   - Bank connections
   - Receipt scanning
   
2. **QuickBooks Self-Employed** - $15/month
   - Tax deductions
   - Mileage tracking
   - Quarterly tax estimates

3. **Xero** - $13/month
   - Full accounting features
   - Bank reconciliation
   - Inventory tracking

### **Charting:**
1. **Recharts** - Free, React-based
2. **Chart.js** - Free, simple
3. **Victory** - Free, customizable

### **Export/Reporting:**
1. **Papa Parse** - CSV export (free)
2. **ExcelJS** - Excel export (free)
3. **jsPDF** - PDF generation (free)

---

## 📋 Implementation Checklist

### **Analytics - Phase 1:**
- [ ] Fetch orders from Supabase
- [ ] Calculate total revenue
- [ ] Calculate total orders
- [ ] Calculate AOV
- [ ] Group revenue by date
- [ ] Find top products
- [ ] Count unique customers
- [ ] Display in UI

### **Analytics - Phase 2:**
- [ ] Install Recharts
- [ ] Create revenue line chart
- [ ] Create product bar chart
- [ ] Add date range selector
- [ ] Add export to CSV

### **Accounting - Phase 1:**
- [ ] Calculate gross revenue
- [ ] Calculate discounts
- [ ] Calculate Stripe fees
- [ ] Show transaction list
- [ ] Group by month
- [ ] Display profit/loss

### **Accounting - Phase 2:**
- [ ] Create expenses table
- [ ] Add expense entry form
- [ ] Calculate COGS
- [ ] Calculate net profit
- [ ] Generate reports

---

## 🎯 Recommended Approach

### **For Your Business Size:**

**Do This:**
1. ✅ Implement basic analytics (Phase 1)
2. ✅ Add charts (Phase 2)
3. ✅ Use Google Analytics for traffic
4. ✅ Implement basic accounting dashboard
5. ✅ Use **Wave** (free) for full accounting
6. ✅ Export order data to CSV for tax prep

**Don't Do This:**
1. ❌ Build a full accounting system from scratch
2. ❌ Store sensitive financial data online
3. ❌ Try to replace professional accounting software

**Why:**
- Building full accounting = 100+ hours
- Professional tools (Wave, QuickBooks) are cheap/free
- They handle taxes, compliance, reporting
- Your time is better spent on business growth

---

## 💡 Quick Wins

### **Implement These First (2-3 hours total):**

1. **Total Revenue Card**
```typescript
const totalRevenue = orders
  .filter(o => o.status !== 'cancelled')
  .reduce((sum, o) => sum + o.amount_total, 0) / 100;
```

2. **Orders This Month**
```typescript
const thisMonth = orders.filter(o => {
  const orderDate = new Date(o.created_at);
  const now = new Date();
  return orderDate.getMonth() === now.getMonth();
});
```

3. **Top 5 Products**
```typescript
const productCounts = items.reduce((acc, item) => {
  acc[item.sign_name] = (acc[item.sign_name] || 0) + item.quantity;
  return acc;
}, {});

const top5 = Object.entries(productCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
```

4. **Revenue Chart (Simple)**
```typescript
const last30Days = Array.from({length: 30}, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  return date.toLocaleDateString();
}).reverse();

const revenueByDay = last30Days.map(date => ({
  date,
  revenue: orders
    .filter(o => new Date(o.created_at).toLocaleDateString() === date)
    .reduce((sum, o) => sum + o.amount_total, 0) / 100
}));
```

---

## 📞 Next Steps

1. **Implement basic analytics** using existing order data
2. **Add Google Analytics** for traffic tracking
3. **Sign up for Wave** (free) for full accounting
4. **Export orders to CSV** monthly for records
5. **Consider QuickBooks** when you hit $50k+ revenue

**Questions to Consider:**
- Do you need real-time financial data?
- Are you comfortable with online accounting?
- Do you have an accountant/bookkeeper?
- What's your monthly transaction volume?

Let me know which features you want to implement first and I can help build them out!
