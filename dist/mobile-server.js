var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/email-service.ts
var email_service_exports = {};
__export(email_service_exports, {
  sendOrderConfirmationEmail: () => sendOrderConfirmationEmail
});
import sgMail2 from "@sendgrid/mail";
async function sendOrderConfirmationEmail(orderData) {
  try {
    const {
      orderNumber,
      customerName,
      customerEmail,
      items,
      subtotal,
      deliveryFee,
      smallOrderFee,
      serviceFee,
      totalAmount,
      orderType,
      deliveryAddress,
      estimatedDeliveryTime
    } = orderData;
    const itemsHtml = items.map((item) => {
      const toppingsHtml = item.toppings && item.toppings.length > 0 ? `<br>Toppings: ${item.toppings.map((t) => `${t.name} (\u20AC${t.price.toFixed(2)})`).join(", ")}` : "";
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${item.name} x${item.quantity}${toppingsHtml}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            \u20AC${item.totalPrice.toFixed(2)}
          </td>
        </tr>
      `;
    }).join("");
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #e53e3e; text-align: center;">Order Confirmation</h1>
        <p>Dear ${customerName},</p>
        <p>Thank you for your order! Here are your order details:</p>
        
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Order Number:</strong> #${orderNumber}<br>
          <strong>Order Type:</strong> ${orderType.charAt(0).toUpperCase() + orderType.slice(1)}<br>
          ${deliveryAddress ? `<strong>Delivery Address:</strong> ${deliveryAddress}<br>` : ""}
          ${estimatedDeliveryTime ? `<strong>Estimated Time:</strong> ${estimatedDeliveryTime}<br>` : ""}
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f7fafc;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr>
              <td style="padding: 10px; text-align: right;" colspan="2">
                <strong>Subtotal:</strong> \u20AC${subtotal.toFixed(2)}<br>
                ${deliveryFee > 0 ? `<strong>Delivery Fee:</strong> \u20AC${deliveryFee.toFixed(2)}<br>` : ""}
                ${smallOrderFee && smallOrderFee > 0 ? `<strong>Small Order Fee:</strong> \u20AC${smallOrderFee.toFixed(2)}<br>` : ""}
                ${serviceFee && serviceFee > 0 ? `<strong>Service Fee:</strong> \u20AC${serviceFee.toFixed(2)}<br>` : ""}
                <strong>Total:</strong> \u20AC${totalAmount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${orderType === "pickup" ? "<p>You can pick up your order in approximately 15-20 minutes.</p>" : "<p>We will call you before delivering your order.</p>"}
        </div>

        <div style="text-align: center; margin-top: 30px; color: #666;">
          <p>Thank you for choosing Ravintola Babylon!</p>
          <p>For any questions, please contact us at +358-3781-2222</p>
          <p>Vapaudenkatu 28, 15140 Lahti</p>
        </div>
      </div>
    `;
    const msg = {
      to: customerEmail,
      from: process.env.SENDGRID_FROM_EMAIL || "orders@ravintolababylon.fi",
      subject: `Order Confirmation #${orderNumber} - Ravintola Babylon`,
      html: emailContent
    };
    await sgMail2.send(msg);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}
var init_email_service = __esm({
  "server/email-service.ts"() {
    "use strict";
    sgMail2.setApiKey(process.env.SENDGRID_API_KEY || "");
  }
});

// server/mobile-server.ts
import dotenv2 from "dotenv";
import express4 from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import { createServer as createServer2 } from "http";
import { WebSocketServer as WebSocketServer2 } from "ws";

// server/db.ts
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  branches: () => branches,
  categories: () => categories,
  categoryToppingGroups: () => categoryToppingGroups,
  customers: () => customers,
  insertBranchSchema: () => insertBranchSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertCategoryToppingGroupSchema: () => insertCategoryToppingGroupSchema,
  insertMenuItemSchema: () => insertMenuItemSchema,
  insertMenuItemToppingGroupSchema: () => insertMenuItemToppingGroupSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPrinterSchema: () => insertPrinterSchema,
  insertRestaurantConfigSchema: () => insertRestaurantConfigSchema,
  insertRestaurantSettingsSchema: () => insertRestaurantSettingsSchema,
  insertToppingGroupItemSchema: () => insertToppingGroupItemSchema,
  insertToppingGroupSchema: () => insertToppingGroupSchema,
  insertToppingSchema: () => insertToppingSchema,
  insertUserSchema: () => insertUserSchema,
  menuItemToppingGroups: () => menuItemToppingGroups,
  menuItems: () => menuItems,
  orderItems: () => orderItems,
  orders: () => orders,
  paymentAnalytics: () => paymentAnalytics,
  paymentAttempts: () => paymentAttempts,
  paymentReceipts: () => paymentReceipts,
  printers: () => printers,
  restaurantConfig: () => restaurantConfig,
  restaurantSettings: () => restaurantSettings,
  savedPaymentMethods: () => savedPaymentMethods,
  toppingGroupItems: () => toppingGroupItems,
  toppingGroups: () => toppingGroups,
  toppings: () => toppings,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, decimal, numeric, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true)
});
var branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  openingHours: jsonb("opening_hours"),
  serviceCities: text("service_cities"),
  // Comma-separated list of cities this branch serves
  // Monthly report settings
  monthlyReportEmail: text("monthly_report_email"),
  monthlyReportEnabled: boolean("monthly_report_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  description: text("description"),
  descriptionEn: text("description_en"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  isVegetarian: boolean("is_vegetarian").default(false),
  isVegan: boolean("is_vegan").default(false),
  isGlutenFree: boolean("is_gluten_free").default(false),
  displayOrder: integer("display_order").default(0),
  isAvailable: boolean("is_available").default(true),
  offerPrice: decimal("offer_price", { precision: 10, scale: 2 }),
  offerPercentage: integer("offer_percentage"),
  offerStartDate: timestamp("offer_start_date"),
  offerEndDate: timestamp("offer_end_date"),
  // Conditional pricing fields for customizable items (e.g., "Your Choice Pizza")
  hasConditionalPricing: boolean("has_conditional_pricing").default(false),
  includedToppingsCount: integer("included_toppings_count").default(0),
  // Number of free toppings included in base price
  branchId: integer("branch_id").references(() => branches.id)
  // NULL = available at all branches
});
var customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var savedPaymentMethods = pgTable("saved_payment_methods", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  stripePaymentMethodId: text("stripe_payment_method_id").notNull().unique(),
  type: text("type").notNull(),
  cardBrand: text("card_brand"),
  cardLast4: text("card_last4"),
  cardExpMonth: integer("card_exp_month"),
  cardExpYear: integer("card_exp_year"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var paymentAttempts = pgTable("payment_attempts", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull(),
  // TEXT to support both integer and uuid
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("eur"),
  status: text("status").notNull(),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  paymentMethodType: text("payment_method_type"),
  attemptNumber: integer("attempt_number").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var paymentAnalytics = pgTable("payment_analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().unique(),
  totalAttempts: integer("total_attempts").default(0),
  successfulPayments: integer("successful_payments").default(0),
  failedPayments: integer("failed_payments").default(0),
  canceledPayments: integer("canceled_payments").default(0),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0"),
  refundedAmount: decimal("refunded_amount", { precision: 10, scale: 2 }).default("0"),
  paymentMethodBreakdown: jsonb("payment_method_breakdown").default({}),
  averageTransactionAmount: decimal("average_transaction_amount", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var paymentReceipts = pgTable("payment_receipts", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull(),
  // TEXT to support both integer and uuid
  receiptNumber: text("receipt_number").notNull().unique(),
  receiptUrl: text("receipt_url"),
  pdfUrl: text("pdf_url"),
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  deliveryAddress: text("delivery_address"),
  orderType: text("order_type").notNull(),
  // 'delivery', 'pickup'
  branchId: integer("branch_id").references(() => branches.id),
  customerId: integer("customer_id").references(() => customers.id),
  status: text("status").notNull().default("pending"),
  // 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0"),
  smallOrderFee: decimal("small_order_fee", { precision: 10, scale: 2 }).default("0"),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").default("cash"),
  // 'cash', 'card', 'stripe'
  paymentStatus: text("payment_status").default("pending"),
  // 'pending', 'processing', 'paid', 'failed', 'canceled', 'refunded', 'partially_refunded'
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  savedPaymentMethodId: integer("saved_payment_method_id").references(() => savedPaymentMethods.id),
  paymentMethodDetails: jsonb("payment_method_details"),
  paymentRetryCount: integer("payment_retry_count").default(0),
  lastPaymentError: jsonb("last_payment_error"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  refundReason: text("refund_reason"),
  refundedAt: timestamp("refunded_at"),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  menuItemId: integer("menu_item_id").references(() => menuItems.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  specialInstructions: text("special_instructions")
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login")
});
var toppings = pgTable("toppings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  category: text("category").notNull().default("pizza"),
  // pizza, kebab, chicken, wings, burger, drink, salad, kids
  type: text("type").notNull().default("topping"),
  // topping, sauce, extra, size, base, spice, drink
  isRequired: boolean("is_required").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var toppingGroups = pgTable("topping_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  isRequired: boolean("is_required").default(false),
  maxSelections: integer("max_selections").default(1),
  minSelections: integer("min_selections").default(0),
  displayOrder: integer("display_order").default(0)
});
var toppingGroupItems = pgTable("topping_group_items", {
  id: serial("id").primaryKey(),
  toppingGroupId: integer("topping_group_id").references(() => toppingGroups.id).notNull(),
  toppingId: integer("topping_id").references(() => toppings.id).notNull(),
  displayOrder: integer("display_order").default(0)
});
var menuItemToppingGroups = pgTable("menu_item_topping_groups", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id").references(() => menuItems.id).notNull(),
  toppingGroupId: integer("topping_group_id").references(() => toppingGroups.id).notNull()
});
var categoryToppingGroups = pgTable("category_topping_groups", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  toppingGroupId: integer("topping_group_id").references(() => toppingGroups.id).notNull()
});
var printers = pgTable("printers", {
  id: text("id").primaryKey(),
  // UUID from device
  name: text("name").notNull(),
  address: text("address").notNull(),
  port: integer("port").notNull(),
  printerType: text("printer_type").notNull(),
  // 'star' or 'escpos'
  isActive: boolean("is_active").default(true),
  fontSettings: jsonb("font_settings").default({
    restaurantName: { width: 3, height: 3 },
    header: { width: 2, height: 2 },
    orderNumber: { width: 3, height: 3 },
    menuItems: { width: 2, height: 2 },
    toppings: { width: 2, height: 2 },
    totals: { width: 2, height: 2 },
    finalTotal: { width: 4, height: 4 },
    characterSpacing: 0
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var restaurantSettings = pgTable("restaurant_settings", {
  id: serial("id").primaryKey(),
  isOpen: boolean("is_open").default(true),
  openingHours: text("opening_hours").notNull(),
  pickupHours: text("pickup_hours").notNull(),
  deliveryHours: text("delivery_hours").notNull(),
  lunchBuffetHours: text("lunch_buffet_hours").notNull(),
  specialMessage: text("special_message"),
  // Monthly report settings
  monthlyReportEmail: text("monthly_report_email"),
  monthlyReportEnabled: boolean("monthly_report_enabled").default(false),
  // Printer settings
  defaultPrinterId: text("default_printer_id"),
  printerAutoReconnect: boolean("printer_auto_reconnect").default(true),
  printerTabSticky: boolean("printer_tab_sticky").default(true),
  receiptFormat: text("receipt_format").default("text"),
  directPrintEnabled: boolean("direct_print_enabled").default(true),
  // Payment methods
  paymentMethods: jsonb("payment_methods").default([
    { "id": "cash", "nameFi": "K\xE4teinen", "nameEn": "Cash", "enabled": true, "icon": "banknote" },
    { "id": "card", "nameFi": "Kortti", "nameEn": "Card", "enabled": true, "icon": "credit-card" }
  ]),
  // Stripe payment settings
  stripeEnabled: boolean("stripe_enabled").default(false),
  stripePublishableKey: text("stripe_publishable_key"),
  stripeSecretKey: text("stripe_secret_key"),
  stripeWebhookSecret: text("stripe_webhook_secret"),
  stripeTestMode: boolean("stripe_test_mode").default(true),
  stripeConnectAccountId: text("stripe_connect_account_id"),
  stripeAccountEmail: text("stripe_account_email"),
  stripeAccountCountry: text("stripe_account_country"),
  stripePaymentMethodsConfig: jsonb("stripe_payment_methods_config").default({}),
  // Online payment service fee
  onlinePaymentServiceFee: numeric("online_payment_service_fee", { precision: 10, scale: 2 }).default("0.00"),
  onlinePaymentServiceFeeType: text("online_payment_service_fee_type").default("fixed"),
  // 'fixed' or 'percentage'
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var restaurantConfig = pgTable("restaurant_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  tagline: text("tagline").notNull(),
  taglineEn: text("tagline_en").notNull(),
  description: text("description").notNull(),
  descriptionEn: text("description_en").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: jsonb("address").notNull().default("{}"),
  socialMedia: jsonb("social_media").default("{}"),
  hours: jsonb("hours").notNull().default("{}"),
  services: jsonb("services").notNull().default("{}"),
  deliveryConfig: jsonb("delivery_config").notNull().default("{}"),
  theme: jsonb("theme").notNull().default("{}"),
  pageLayoutVariants: jsonb("page_layout_variants").notNull().default('{"home":"variant1","menu":"variant1","about":"variant1","header":"variant1","footer":"variant1","cart":"variant1","checkout":"variant1"}'),
  logo: jsonb("logo").notNull().default("{}"),
  about: jsonb("about").notNull().default("{}"),
  hero: jsonb("hero").notNull().default("{}"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true
});
var insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true
});
var insertToppingSchema = createInsertSchema(toppings).omit({
  id: true
});
var insertToppingGroupSchema = createInsertSchema(toppingGroups).omit({
  id: true
});
var insertToppingGroupItemSchema = createInsertSchema(toppingGroupItems).omit({
  id: true
});
var insertMenuItemToppingGroupSchema = createInsertSchema(menuItemToppingGroups).omit({
  id: true
});
var insertCategoryToppingGroupSchema = createInsertSchema(categoryToppingGroups).omit({
  id: true
});
var insertPrinterSchema = createInsertSchema(printers).omit({
  createdAt: true,
  updatedAt: true
});
var insertRestaurantSettingsSchema = createInsertSchema(restaurantSettings).omit({
  id: true,
  updatedAt: true
});
var insertRestaurantConfigSchema = createInsertSchema(restaurantConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
import { Pool } from "pg";
dotenv.config();
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please set your Supabase database URL."
  );
}
var connectionString = process.env.DATABASE_URL;
var client = postgres(connectionString);
var db = drizzle({ client, schema: schema_exports });
var pool = new Pool({
  connectionString
});
var supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
}

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/storage.ts
import { eq, and, ne } from "drizzle-orm";
var DatabaseStorage = class {
  constructor() {
    this.initializeDatabase();
  }
  async initializeDatabase() {
    try {
      const existingCategories = await db.select().from(categories);
      if (existingCategories.length > 0) return;
      const categoriesData = [
        { name: "Pizzat", nameEn: "Pizzas", displayOrder: 1, isActive: true },
        { name: "Kebab", nameEn: "Kebab", displayOrder: 2, isActive: true },
        { name: "Kana", nameEn: "Chicken", displayOrder: 3, isActive: true },
        { name: "Hampurilaiset", nameEn: "Burgers", displayOrder: 4, isActive: true },
        { name: "Salaatit", nameEn: "Salads", displayOrder: 5, isActive: true }
      ];
      const insertedCategories = await db.insert(categories).values(categoriesData).returning();
      const menuItemsData = [
        // Pizzas
        { name: "Margherita", nameEn: "Margherita", price: "12.90", categoryId: insertedCategories[0].id, description: "Tomaattikastike, mozzarella", descriptionEn: "Tomato sauce, mozzarella", isVegetarian: true, isAvailable: true, displayOrder: 1 },
        { name: "Pepperoni", nameEn: "Pepperoni", price: "15.90", categoryId: insertedCategories[0].id, description: "Tomaattikastike, mozzarella, pepperoni", descriptionEn: "Tomato sauce, mozzarella, pepperoni", isAvailable: true, displayOrder: 2 },
        { name: "Quattro Stagioni", nameEn: "Four Seasons", price: "17.90", categoryId: insertedCategories[0].id, description: "Tomaattikastike, mozzarella, kinkku, sienet, oliivit", descriptionEn: "Tomato sauce, mozzarella, ham, mushrooms, olives", isAvailable: true, displayOrder: 3 },
        // Kebab
        { name: "Kebab-lautanen", nameEn: "Kebab Plate", price: "13.90", categoryId: insertedCategories[1].id, description: "Kebab-liha, ranskalaiset, salaatti, kastike", descriptionEn: "Kebab meat, french fries, salad, sauce", isAvailable: true, displayOrder: 1 },
        { name: "Kebab-rulla", nameEn: "Kebab Roll", price: "9.90", categoryId: insertedCategories[1].id, description: "Kebab-liha, salaatti, kastike tortillassa", descriptionEn: "Kebab meat, salad, sauce in tortilla", isAvailable: true, displayOrder: 2 },
        // Chicken
        { name: "Broileri-lautanen", nameEn: "Chicken Plate", price: "14.90", categoryId: insertedCategories[2].id, description: "Grillattu broileri, perunat, salaatti", descriptionEn: "Grilled chicken, potatoes, salad", isGlutenFree: true, isAvailable: true, displayOrder: 1 },
        { name: "Buffalo Wings", nameEn: "Buffalo Wings", price: "11.90", categoryId: insertedCategories[2].id, description: "Tulisia kanansiipi\xE4, dippi", descriptionEn: "Spicy chicken wings, dip", isGlutenFree: true, isAvailable: true, displayOrder: 2 },
        // Burgers
        { name: "babylon Burger", nameEn: "babylon Burger", price: "13.90", categoryId: insertedCategories[3].id, description: "Naudanliha, juusto, salaatti, tomaatti", descriptionEn: "Beef patty, cheese, lettuce, tomato", isAvailable: true, displayOrder: 1 },
        { name: "Veggie Burger", nameEn: "Veggie Burger", price: "12.90", categoryId: insertedCategories[3].id, description: "Kasvispatty, juusto, salaatti", descriptionEn: "Veggie patty, cheese, lettuce", isVegetarian: true, isVegan: true, isAvailable: true, displayOrder: 2 },
        // Salads
        { name: "Caesar-salaatti", nameEn: "Caesar Salad", price: "11.90", categoryId: insertedCategories[4].id, description: "Salaatti, kana, krutonit, parmesaani", descriptionEn: "Lettuce, chicken, croutons, parmesan", isGlutenFree: true, isAvailable: true, displayOrder: 1 },
        { name: "Kreikkalainen salaatti", nameEn: "Greek Salad", price: "10.90", categoryId: insertedCategories[4].id, description: "Tomaatti, kurkku, feta, oliivit", descriptionEn: "Tomato, cucumber, feta, olives", isVegetarian: true, isGlutenFree: true, isAvailable: true, displayOrder: 2 }
      ];
      await db.insert(menuItems).values(menuItemsData);
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  }
  async getCategories() {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }
  async createCategory(category) {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
  async getMenuItems() {
    return await db.select().from(menuItems).where(eq(menuItems.isAvailable, true));
  }
  async getMenuItemsByCategory(categoryId) {
    return await db.select().from(menuItems).where(and(
      eq(menuItems.categoryId, categoryId),
      eq(menuItems.isAvailable, true)
    ));
  }
  async createMenuItem(item) {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }
  async updateMenuItem(id, item) {
    const [updated] = await db.update(menuItems).set(item).where(eq(menuItems.id, id)).returning();
    return updated;
  }
  async getOrders() {
    return await db.select().from(orders).where(ne(orders.paymentStatus, "pending_payment"));
  }
  async getOrderById(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  async createOrder(order) {
    const orderNumber = `ORD-${Date.now()}`;
    const [newOrder] = await db.insert(orders).values({
      ...order,
      orderNumber
    }).returning();
    return newOrder;
  }
  async updateOrderStatus(id, status) {
    const [updated] = await db.update(orders).set({
      status,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(orders.id, id)).returning();
    return updated;
  }
  async getOrderItems(orderId) {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  async createOrderItem(item) {
    const [newItem] = await db.insert(orderItems).values(item).returning();
    return newItem;
  }
  // Toppings implementation
  async getToppings() {
    return await db.select().from(toppings).orderBy(toppings.displayOrder);
  }
  async createTopping(topping) {
    const [newTopping] = await db.insert(toppings).values(topping).returning();
    return newTopping;
  }
  async updateTopping(id, topping) {
    const [updatedTopping] = await db.update(toppings).set(topping).where(eq(toppings.id, id)).returning();
    return updatedTopping || void 0;
  }
  async deleteTopping(id) {
    const result = await db.delete(toppings).where(eq(toppings.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  async getToppingsByCategory(category) {
    return await db.select().from(toppings).where(eq(toppings.category, category)).orderBy(toppings.displayOrder);
  }
  // Topping Groups (stub implementation)
  async getToppingGroups() {
    return await db.select().from(toppingGroups).orderBy(toppingGroups.displayOrder);
  }
  async createToppingGroup(group) {
    const [newGroup] = await db.insert(toppingGroups).values(group).returning();
    return newGroup;
  }
  async updateToppingGroup(id, group) {
    const [updatedGroup] = await db.update(toppingGroups).set(group).where(eq(toppingGroups.id, id)).returning();
    return updatedGroup || void 0;
  }
  async deleteToppingGroup(id) {
    const result = await db.delete(toppingGroups).where(eq(toppingGroups.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  async getToppingGroupItems(groupId) {
    return await db.select().from(toppingGroupItems).where(eq(toppingGroupItems.groupId, groupId));
  }
  async addToppingToGroup(groupId, toppingId) {
    const [newItem] = await db.insert(toppingGroupItems).values({ groupId, toppingId }).returning();
    return newItem;
  }
  async removeToppingFromGroup(groupId, toppingId) {
    const result = await db.delete(toppingGroupItems).where(
      and(eq(toppingGroupItems.groupId, groupId), eq(toppingGroupItems.toppingId, toppingId))
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
  async getMenuItemToppingGroups(menuItemId) {
    return await db.select({
      id: toppingGroups.id,
      name: toppingGroups.name,
      nameEn: toppingGroups.nameEn,
      isRequired: toppingGroups.isRequired,
      maxSelections: toppingGroups.maxSelections,
      minSelections: toppingGroups.minSelections,
      displayOrder: toppingGroups.displayOrder
    }).from(toppingGroups).innerJoin(menuItemToppingGroups, eq(menuItemToppingGroups.groupId, toppingGroups.id)).where(eq(menuItemToppingGroups.menuItemId, menuItemId)).orderBy(toppingGroups.displayOrder);
  }
  async assignToppingGroupToMenuItem(menuItemId, groupId) {
    const [newAssignment] = await db.insert(menuItemToppingGroups).values({ menuItemId, groupId }).returning();
    return newAssignment;
  }
  async removeToppingGroupFromMenuItem(menuItemId, groupId) {
    const result = await db.delete(menuItemToppingGroups).where(
      and(eq(menuItemToppingGroups.menuItemId, menuItemId), eq(menuItemToppingGroups.groupId, groupId))
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
  async getCategoryToppingGroups(categoryId) {
    return await db.select({
      id: toppingGroups.id,
      name: toppingGroups.name,
      nameEn: toppingGroups.nameEn,
      isRequired: toppingGroups.isRequired,
      maxSelections: toppingGroups.maxSelections,
      minSelections: toppingGroups.minSelections,
      displayOrder: toppingGroups.displayOrder
    }).from(toppingGroups).innerJoin(categoryToppingGroups, eq(categoryToppingGroups.groupId, toppingGroups.id)).where(eq(categoryToppingGroups.categoryId, categoryId)).orderBy(toppingGroups.displayOrder);
  }
  async assignToppingGroupToCategory(categoryId, groupId) {
    const [newAssignment] = await db.insert(categoryToppingGroups).values({ categoryId, groupId }).returning();
    return newAssignment;
  }
  async removeToppingGroupFromCategory(categoryId, groupId) {
    const result = await db.delete(categoryToppingGroups).where(
      and(eq(categoryToppingGroups.categoryId, categoryId), eq(categoryToppingGroups.groupId, groupId))
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
  async getRestaurantSettings() {
    const [settings] = await db.select().from(restaurantSettings).limit(1);
    return settings || void 0;
  }
  async updateRestaurantSettings(settings) {
    const existing = await this.getRestaurantSettings();
    if (existing) {
      const [updated] = await db.update(restaurantSettings).set(settings).where(eq(restaurantSettings.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(restaurantSettings).values(settings).returning();
      return created;
    }
  }
  // Printer Methods
  async getAllPrinters() {
    return await db.select().from(printers).where(eq(printers.isActive, true));
  }
  async getPrinter(id) {
    const [printer] = await db.select().from(printers).where(eq(printers.id, id)).limit(1);
    return printer || void 0;
  }
  async upsertPrinter(printer) {
    console.log("\u{1F535} [DATABASE] Upserting printer:", {
      id: printer.id,
      name: printer.name,
      address: printer.address,
      port: printer.port,
      printerType: printer.printerType,
      hasFontSettings: !!printer.fontSettings
    });
    const existing = await this.getPrinter(printer.id);
    if (existing) {
      console.log("\u{1F504} [DATABASE] Updating existing printer:", printer.id);
      const [updated] = await db.update(printers).set({
        name: printer.name,
        address: printer.address,
        port: printer.port,
        printerType: printer.printerType,
        isActive: printer.isActive,
        fontSettings: printer.fontSettings,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(printers.id, printer.id)).returning();
      console.log("\u2705 [DATABASE] Printer updated successfully:", updated.id);
      return updated;
    } else {
      console.log("\u2795 [DATABASE] Creating new printer:", printer.id);
      const [created] = await db.insert(printers).values(printer).returning();
      console.log("\u2705 [DATABASE] Printer created successfully:", created.id);
      return created;
    }
  }
  async deletePrinter(id) {
    const result = await db.update(printers).set({ isActive: false }).where(eq(printers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { eq as eq6 } from "drizzle-orm";

// server/auth.ts
import bcrypt from "bcryptjs";
import { eq as eq2 } from "drizzle-orm";
var AuthService = class {
  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }
  async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
  async createUser(userData) {
    const hashedPassword = await this.hashPassword(userData.password);
    const [user] = await db.insert(users).values({
      ...userData,
      password: hashedPassword
    }).returning();
    return user;
  }
  async authenticateUser(email, password) {
    const [user] = await db.select().from(users).where(eq2(users.email, email));
    if (!user || !user.isActive) {
      return null;
    }
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }
    await db.update(users).set({ lastLogin: /* @__PURE__ */ new Date() }).where(eq2(users.id, user.id));
    return {
      id: user.id,
      email: user.email,
      role: user.role
    };
  }
  async getUserById(id) {
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      role: users.role
    }).from(users).where(eq2(users.id, id));
    return user || null;
  }
  async initializeAdminUser() {
    const [existingAdmin] = await db.select().from(users).where(eq2(users.email, "info@ravintolababylon.fi"));
    if (!existingAdmin) {
      await this.createUser({
        email: "info@ravintolababylon.fi",
        password: "babylon@2025",
        role: "admin",
        isActive: true
      });
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  }
};
var authService = new AuthService();

// server/file-upload.ts
import multer from "multer";

// server/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
var cloudName = process.env.CLOUDINARY_CLOUD_NAME;
var apiKey = process.env.CLOUDINARY_API_KEY;
var apiSecret = process.env.CLOUDINARY_API_SECRET;
if (!cloudName || !apiKey || !apiSecret) {
  console.warn("Missing Cloudinary environment variables. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file");
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}
async function uploadImageToCloudinary(file, restaurantName = "default-restaurant", folder = "menu") {
  try {
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary not configured. Please check environment variables.");
    }
    console.log("\u{1F4F8} Uploading image to Cloudinary...");
    const sanitizedRestaurantName = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const folderPath = `${sanitizedRestaurantName}/${folder}`;
    const stream = Readable.from(file.buffer);
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          quality: "auto",
          fetch_format: "auto",
          resource_type: "image",
          transformation: [
            { width: 800, height: 600, crop: "limit" },
            { quality: "auto" }
          ]
        },
        (error, result2) => {
          if (error) {
            reject(error);
          } else if (result2) {
            resolve(result2);
          } else {
            reject(new Error("Upload failed - no result"));
          }
        }
      );
      stream.pipe(uploadStream);
    });
    console.log("\u2705 Image uploaded successfully to Cloudinary folder:", folderPath);
    console.log("\u{1F4C1} Image URL:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("\u274C Error uploading image to Cloudinary:", error);
    throw error;
  }
}

// server/hostinger-upload.ts
import { Client as FTPClient } from "basic-ftp";
import path from "path";
import { Readable as Readable2 } from "stream";
import sharp from "sharp";
var FTP_CONFIG = {
  host: process.env.HOSTINGER_FTP_HOST || "ftp.ravintolababylon.fi",
  user: process.env.HOSTINGER_FTP_USER,
  password: process.env.HOSTINGER_FTP_PASSWORD,
  secure: true,
  // Use FTPS (FTP over SSL) with cert validation disabled
  port: 21
};
var IMAGE_CDN_URL = process.env.IMAGE_CDN_URL || "https://images.ravintolababylon.fi";
async function uploadImageToHostinger(file, folder = "menu-items") {
  const client2 = new FTPClient();
  client2.ftp.verbose = process.env.NODE_ENV === "development";
  try {
    if (!FTP_CONFIG.user || !FTP_CONFIG.password) {
      throw new Error("Hostinger FTP credentials not configured. Please set HOSTINGER_FTP_USER and HOSTINGER_FTP_PASSWORD environment variables.");
    }
    console.log("\u{1F4E1} Connecting to Hostinger FTP...");
    const originalTLSReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    await client2.access({
      host: FTP_CONFIG.host,
      user: FTP_CONFIG.user,
      password: FTP_CONFIG.password,
      secure: true,
      secureOptions: {
        rejectUnauthorized: false
      },
      port: FTP_CONFIG.port
    });
    if (originalTLSReject) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalTLSReject;
    } else {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    }
    console.log("\u2705 Connected to Hostinger FTP");
    console.log("\u{1F5BC}\uFE0F Optimizing image...");
    const optimizedBuffer = await sharp(file.buffer).resize(1200, 900, {
      fit: "inside",
      withoutEnlargement: true
    }).webp({ quality: 85 }).toBuffer();
    const timestamp2 = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp2}-${randomString}.webp`;
    const now = /* @__PURE__ */ new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const remotePath = `/${year}/${month}/${folder}/${fileName}`;
    const remoteDir = path.dirname(remotePath).replace(/\\/g, "/");
    console.log("\u{1F4C1} Ensuring remote directory exists:", remoteDir);
    await client2.ensureDir(remoteDir);
    console.log("\u2B06\uFE0F Uploading to:", remotePath);
    const readable = Readable2.from(optimizedBuffer);
    await client2.uploadFrom(readable, remotePath);
    console.log("\u2705 Image uploaded successfully to Hostinger");
    const publicUrl = `${IMAGE_CDN_URL}/uploads/${year}/${month}/${folder}/${fileName}`;
    console.log("\u{1F517} Public URL:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("\u274C Error uploading to Hostinger:", error);
    throw new Error(`Failed to upload image to Hostinger: ${error instanceof Error ? error.message : "Unknown error"}`);
  } finally {
    client2.close();
  }
}
async function testHostingerConnection() {
  const client2 = new FTPClient();
  try {
    if (!FTP_CONFIG.user || !FTP_CONFIG.password) {
      console.error("\u274C FTP credentials not configured");
      return false;
    }
    console.log("\u{1F50C} Testing Hostinger FTP connection...");
    await client2.access({
      host: FTP_CONFIG.host,
      user: FTP_CONFIG.user,
      password: FTP_CONFIG.password,
      secure: FTP_CONFIG.secure,
      port: FTP_CONFIG.port
    });
    console.log("\u2705 Hostinger FTP connection successful");
    const list = await client2.list("/");
    console.log("\u{1F4C2} Root directory contents:", list.length, "items");
    return true;
  } catch (error) {
    console.error("\u274C Hostinger FTP connection failed:", error);
    return false;
  } finally {
    client2.close();
  }
}

// server/file-upload.ts
var UPLOAD_STRATEGY = process.env.IMAGE_UPLOAD_STRATEGY || "hostinger";
var storage2 = multer.memoryStorage();
var upload = multer({
  storage: storage2,
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
    }
  }
});
async function uploadImageToSupabase(file, restaurantName = "default-restaurant", folder = "menu") {
  try {
    if (UPLOAD_STRATEGY === "hostinger") {
      console.log("\u{1F4F8} Uploading image to Hostinger FTP...");
      const imageUrl = await uploadImageToHostinger(file, folder);
      console.log("\u2705 Image uploaded successfully to Hostinger:", imageUrl);
      return imageUrl;
    } else {
      console.log("\u{1F4F8} Uploading image to Cloudinary...");
      const imageUrl = await uploadImageToCloudinary(file, restaurantName, folder);
      console.log("\u2705 Image uploaded successfully to Cloudinary:", imageUrl);
      return imageUrl;
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// server/routes/payment.ts
import express from "express";

// server/services/payment-service.ts
import Stripe from "stripe";
import { eq as eq3 } from "drizzle-orm";
var PaymentService = class {
  stripe = null;
  stripeConfig = null;
  /**
   * Initialize Stripe with configuration from database
   */
  async initialize() {
    try {
      const settings = await db.select().from(restaurantSettings).limit(1);
      const config = settings[0];
      if (!config?.stripeSecretKey) {
        console.error("\u274C Stripe secret key not found in database");
        this.stripe = null;
        this.stripeConfig = null;
        return;
      }
      this.stripeConfig = {
        secretKey: config.stripeSecretKey,
        publishableKey: config.stripePublishableKey || "",
        webhookSecret: config.stripeWebhookSecret || "",
        enabled: config.stripeEnabled || false,
        testMode: config.stripeTestMode || true
      };
      this.stripe = new Stripe(this.stripeConfig.secretKey, {
        apiVersion: "2024-11-20.acacia",
        typescript: true
      });
      console.log("\u2705 Payment Service initialized", {
        enabled: this.stripeConfig.enabled,
        testMode: this.stripeConfig.testMode,
        hasWebhookSecret: !!this.stripeConfig.webhookSecret
      });
    } catch (error) {
      console.error("\u274C Error initializing Payment Service:", error);
      throw error;
    }
  }
  /**
   * Get Stripe instance (initializes if needed)
   */
  async getStripe() {
    if (!this.stripe) {
      await this.initialize();
    }
    if (!this.stripe || !this.stripeConfig?.enabled) {
      throw new Error("Stripe is not configured or disabled");
    }
    return this.stripe;
  }
  /**
   * Get publishable key for frontend
   */
  async getPublishableKey() {
    if (!this.stripeConfig) {
      await this.initialize();
    }
    if (!this.stripeConfig?.publishableKey) {
      throw new Error("Stripe publishable key not configured");
    }
    return this.stripeConfig.publishableKey;
  }
  /**
   * Create a payment intent with idempotency and error handling
   */
  async createPaymentIntent(params) {
    try {
      const stripe = await this.getStripe();
      if (!params.amount || params.amount <= 0) {
        return {
          success: false,
          error: "Invalid amount",
          errorCode: "invalid_amount"
        };
      }
      const amountInCents = Math.round(params.amount * 100);
      const paymentIntentParams = {
        amount: amountInCents,
        currency: params.currency || "eur",
        metadata: params.metadata || {}
      };
      if (params.paymentMethodTypes && params.paymentMethodTypes.length > 0) {
        paymentIntentParams.payment_method_types = params.paymentMethodTypes;
      } else {
        paymentIntentParams.automatic_payment_methods = {
          enabled: true,
          allow_redirects: "never"
          // Keep payments embedded
        };
      }
      if (params.customerId) {
        paymentIntentParams.customer = params.customerId;
      }
      if (params.setupFutureUsage) {
        paymentIntentParams.setup_future_usage = params.setupFutureUsage;
      }
      const requestOptions = {};
      if (params.idempotencyKey) {
        requestOptions.idempotencyKey = params.idempotencyKey;
      }
      const paymentIntent = await stripe.paymentIntents.create(
        paymentIntentParams,
        requestOptions
      );
      console.log("\u2705 Payment intent created:", {
        id: paymentIntent.id,
        amount: params.amount,
        orderId: params.metadata?.orderId,
        status: paymentIntent.status
      });
      if (params.metadata?.orderId) {
        await this.updateOrderPaymentIntent(
          parseInt(params.metadata.orderId),
          paymentIntent.id
        );
      }
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || void 0,
        status: this.mapStripeStatus(paymentIntent.status),
        requiresAction: paymentIntent.status === "requires_action",
        nextActionType: paymentIntent.next_action?.type
      };
    } catch (error) {
      console.error("\u274C Error creating payment intent:", error);
      return {
        success: false,
        error: error.message || "Failed to create payment intent",
        errorCode: error.code || "unknown_error"
      };
    }
  }
  /**
   * Retrieve payment intent status
   */
  async getPaymentIntentStatus(paymentIntentId) {
    try {
      const stripe = await this.getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: this.mapStripeStatus(paymentIntent.status),
        requiresAction: paymentIntent.status === "requires_action",
        nextActionType: paymentIntent.next_action?.type
      };
    } catch (error) {
      console.error("\u274C Error retrieving payment intent:", error);
      return {
        success: false,
        error: error.message || "Failed to retrieve payment intent",
        errorCode: error.code || "unknown_error"
      };
    }
  }
  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(paymentIntentId, orderId) {
    try {
      const stripe = await this.getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status === "succeeded") {
        console.log("\u2705 Payment already succeeded:", paymentIntentId);
        if (orderId) {
          await this.updateOrderPaymentStatus(orderId, "succeeded" /* SUCCEEDED */, paymentIntent);
        }
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
          status: "succeeded" /* SUCCEEDED */
        };
      }
      if (paymentIntent.status === "requires_action") {
        return {
          success: false,
          error: "Payment requires additional action",
          errorCode: "requires_action",
          requiresAction: true,
          nextActionType: paymentIntent.next_action?.type
        };
      }
      if (paymentIntent.status === "canceled" || paymentIntent.status === "failed") {
        return {
          success: false,
          error: "Payment was canceled or failed",
          errorCode: paymentIntent.status,
          status: this.mapStripeStatus(paymentIntent.status)
        };
      }
      return {
        success: false,
        error: `Unexpected payment status: ${paymentIntent.status}`,
        errorCode: "unexpected_status",
        status: this.mapStripeStatus(paymentIntent.status)
      };
    } catch (error) {
      console.error("\u274C Error confirming payment intent:", error);
      return {
        success: false,
        error: error.message || "Failed to confirm payment",
        errorCode: error.code || "unknown_error"
      };
    }
  }
  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId) {
    try {
      const stripe = await this.getStripe();
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      console.log("\u2705 Payment intent canceled:", paymentIntentId);
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: "canceled" /* CANCELED */
      };
    } catch (error) {
      console.error("\u274C Error canceling payment intent:", error);
      return {
        success: false,
        error: error.message || "Failed to cancel payment",
        errorCode: error.code || "unknown_error"
      };
    }
  }
  /**
   * Process a refund
   */
  async processRefund(params) {
    try {
      const stripe = await this.getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(params.paymentIntentId);
      if (paymentIntent.status !== "succeeded") {
        return {
          success: false,
          error: "Can only refund succeeded payments",
          errorCode: "invalid_status"
        };
      }
      const refundParams = {
        payment_intent: params.paymentIntentId,
        metadata: params.metadata || {}
      };
      if (params.amount) {
        refundParams.amount = Math.round(params.amount * 100);
      }
      if (params.reason) {
        refundParams.reason = params.reason;
      }
      const refund = await stripe.refunds.create(refundParams);
      console.log("\u2705 Refund processed:", {
        id: refund.id,
        paymentIntentId: params.paymentIntentId,
        amount: params.amount ? `\u20AC${params.amount}` : "full",
        status: refund.status
      });
      return {
        success: true,
        paymentIntentId: params.paymentIntentId,
        status: params.amount ? "partially_refunded" /* PARTIALLY_REFUNDED */ : "refunded" /* REFUNDED */
      };
    } catch (error) {
      console.error("\u274C Error processing refund:", error);
      return {
        success: false,
        error: error.message || "Failed to process refund",
        errorCode: error.code || "unknown_error"
      };
    }
  }
  /**
   * Create a Stripe Customer for saved payment methods
   */
  async createCustomer(params) {
    try {
      const stripe = await this.getStripe();
      const customer = await stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        metadata: params.metadata || {}
      });
      console.log("\u2705 Stripe customer created:", customer.id);
      return {
        success: true,
        customerId: customer.id
      };
    } catch (error) {
      console.error("\u274C Error creating customer:", error);
      return {
        success: false,
        error: error.message || "Failed to create customer"
      };
    }
  }
  /**
   * List customer's saved payment methods
   */
  async listPaymentMethods(customerId) {
    try {
      const stripe = await this.getStripe();
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card"
      });
      return {
        success: true,
        paymentMethods: paymentMethods.data
      };
    } catch (error) {
      console.error("\u274C Error listing payment methods:", error);
      return {
        success: false,
        error: error.message || "Failed to list payment methods"
      };
    }
  }
  /**
   * Update order with payment intent ID
   */
  async updateOrderPaymentIntent(orderId, paymentIntentId) {
    try {
      await db.update(orders).set({
        stripePaymentIntentId: paymentIntentId,
        paymentStatus: "processing",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(orders.id, orderId));
      console.log(`\u2705 Order ${orderId} updated with payment intent ${paymentIntentId}`);
    } catch (error) {
      console.error(`\u274C Failed to update order ${orderId}:`, error);
      throw error;
    }
  }
  /**
   * Update order payment status
   */
  async updateOrderPaymentStatus(orderId, status, paymentIntent) {
    try {
      const updateData = {
        paymentStatus: status,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (paymentIntent) {
        updateData.paymentMethodDetails = {
          type: paymentIntent.payment_method_types?.[0] || "unknown",
          last4: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4,
          brand: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.brand,
          receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url
        };
      }
      await db.update(orders).set(updateData).where(eq3(orders.id, orderId));
      console.log(`\u2705 Order ${orderId} payment status updated to ${status}`);
    } catch (error) {
      console.error(`\u274C Failed to update order ${orderId} status:`, error);
      throw error;
    }
  }
  /**
   * Map Stripe status to internal PaymentStatus
   */
  mapStripeStatus(stripeStatus) {
    const statusMap = {
      requires_payment_method: "pending" /* PENDING */,
      requires_confirmation: "pending" /* PENDING */,
      requires_action: "requires_action" /* REQUIRES_ACTION */,
      processing: "processing" /* PROCESSING */,
      requires_capture: "processing" /* PROCESSING */,
      succeeded: "succeeded" /* SUCCEEDED */,
      canceled: "canceled" /* CANCELED */
    };
    return statusMap[stripeStatus] || "failed" /* FAILED */;
  }
  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    try {
      if (!this.stripe || !this.stripeConfig?.webhookSecret) {
        throw new Error("Webhook secret not configured");
      }
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.stripeConfig.webhookSecret
      );
    } catch (error) {
      console.error("\u274C Webhook signature verification failed:", error.message);
      return null;
    }
  }
};
var paymentService = new PaymentService();

// server/routes/payment.ts
import { eq as eq4 } from "drizzle-orm";
var router = express.Router();
router.get("/config", async (req, res) => {
  try {
    const publishableKey = await paymentService.getPublishableKey();
    res.json({
      publishableKey,
      success: true
    });
  } catch (error) {
    console.error("Error fetching Stripe config:", error);
    res.status(500).json({
      success: false,
      error: "Stripe not configured",
      message: error.message || "Please configure Stripe keys in restaurant settings"
    });
  }
});
router.post("/create-payment-intent", async (req, res) => {
  try {
    const {
      amount,
      currency = "eur",
      metadata = {},
      paymentMethodTypes,
      customerId,
      savePaymentMethod = false
    } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount",
        message: "Amount must be greater than 0"
      });
    }
    const idempotencyKey = metadata.orderId ? `payment-${metadata.orderId}-${Date.now()}` : void 0;
    const result = await paymentService.createPaymentIntent({
      amount,
      currency,
      metadata,
      paymentMethodTypes,
      customerId,
      setupFutureUsage: savePaymentMethod ? "off_session" : void 0,
      idempotencyKey
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create payment intent",
      message: error.message || "Unknown error"
    });
  }
});
router.get("/payment-intent/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Payment intent ID required"
      });
    }
    const result = await paymentService.getPaymentIntentStatus(id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error("Error fetching payment intent:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment intent",
      message: error.message || "Unknown error"
    });
  }
});
router.post("/confirm-payment", async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: "Payment intent ID required"
      });
    }
    const result = await paymentService.confirmPaymentIntent(
      paymentIntentId,
      orderId ? parseInt(orderId) : void 0
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    if (orderId) {
      const [order] = await db.select().from(orders).where(eq4(orders.id, parseInt(orderId))).limit(1);
      res.json({
        ...result,
        order
      });
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to confirm payment",
      message: error.message || "Unknown error"
    });
  }
});
router.post("/cancel-payment", async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: "Payment intent ID required"
      });
    }
    const result = await paymentService.cancelPaymentIntent(paymentIntentId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error("Error canceling payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel payment",
      message: error.message || "Unknown error"
    });
  }
});
router.post("/refund", async (req, res) => {
  try {
    const { paymentIntentId, amount, reason, metadata } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: "Payment intent ID required"
      });
    }
    const result = await paymentService.processRefund({
      paymentIntentId,
      amount,
      reason,
      metadata
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    const [order] = await db.select().from(orders).where(eq4(orders.stripePaymentIntentId, paymentIntentId)).limit(1);
    if (order) {
      await db.update(orders).set({
        paymentStatus: result.status,
        refundAmount: amount ? amount.toString() : order.totalAmount,
        refundReason: reason,
        refundedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(orders.id, order.id));
      console.log(`\u2705 Order ${order.id} marked as ${result.status}`);
    }
    res.json(result);
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process refund",
      message: error.message || "Unknown error"
    });
  }
});
router.post("/create-customer", async (req, res) => {
  try {
    const { email, name, phone, metadata } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email required"
      });
    }
    const result = await paymentService.createCustomer({
      email,
      name,
      phone,
      metadata
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create customer",
      message: error.message || "Unknown error"
    });
  }
});
router.get("/payment-methods/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Customer ID required"
      });
    }
    const result = await paymentService.listPaymentMethods(customerId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error("Error listing payment methods:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list payment methods",
      message: error.message || "Unknown error"
    });
  }
});
router.post("/retry-payment", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order ID required"
      });
    }
    const [order] = await db.select().from(orders).where(eq4(orders.id, parseInt(orderId))).limit(1);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }
    if (order.stripePaymentIntentId) {
      await paymentService.cancelPaymentIntent(order.stripePaymentIntentId);
    }
    const result = await paymentService.createPaymentIntent({
      amount: parseFloat(order.totalAmount),
      metadata: {
        orderId: order.id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail || void 0,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        orderType: order.orderType,
        branchId: order.branchId?.toString()
      },
      idempotencyKey: `retry-${order.id}-${Date.now()}`
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error("Error retrying payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retry payment",
      message: error.message || "Unknown error"
    });
  }
});
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).send("Missing stripe-signature header");
  }
  try {
    const event = paymentService.verifyWebhookSignature(req.body, signature);
    if (!event) {
      return res.status(400).send("Invalid signature");
    }
    console.log("\u{1F4E7} Webhook received:", {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1e3).toISOString()
    });
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      case "payment_intent.canceled":
        await handlePaymentCanceled(event.data.object);
        break;
      case "payment_intent.processing":
        await handlePaymentProcessing(event.data.object);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;
      case "charge.dispute.created":
        await handleDisputeCreated(event.data.object);
        break;
      default:
        console.log(`\u2139\uFE0F Unhandled event type: ${event.type}`);
    }
    res.json({ received: true, type: event.type });
  } catch (error) {
    console.error("\u274C Webhook error:", error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
async function handlePaymentSucceeded(paymentIntent) {
  try {
    console.log("\u2705 Payment succeeded:", paymentIntent.id);
    const [order] = await db.select().from(orders).where(eq4(orders.stripePaymentIntentId, paymentIntent.id)).limit(1);
    if (!order) {
      console.error("\u274C Order not found for payment intent:", paymentIntent.id);
      return;
    }
    if (order.paymentStatus === "paid") {
      console.log("\u26A0\uFE0F Payment already processed for order:", order.id);
      return;
    }
    await db.update(orders).set({
      paymentStatus: "paid",
      paymentMethodDetails: {
        type: paymentIntent.payment_method_types?.[0] || "unknown",
        last4: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4,
        brand: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.brand,
        receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url
      },
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq4(orders.id, order.id));
    console.log(`\u2705 Order ${order.id} marked as paid`);
  } catch (error) {
    console.error("\u274C Error handling payment success:", error);
    throw error;
  }
}
async function handlePaymentFailed(paymentIntent) {
  try {
    console.log("\u274C Payment failed:", paymentIntent.id);
    const [order] = await db.select().from(orders).where(eq4(orders.stripePaymentIntentId, paymentIntent.id)).limit(1);
    if (order) {
      await db.update(orders).set({
        paymentStatus: "failed",
        paymentMethodDetails: {
          error: paymentIntent.last_payment_error?.message,
          error_code: paymentIntent.last_payment_error?.code
        },
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(orders.id, order.id));
      console.log(`\u274C Order ${order.id} marked as failed`);
    }
  } catch (error) {
    console.error("\u274C Error handling payment failure:", error);
  }
}
async function handlePaymentCanceled(paymentIntent) {
  try {
    console.log("\u{1F6AB} Payment canceled:", paymentIntent.id);
    const [order] = await db.select().from(orders).where(eq4(orders.stripePaymentIntentId, paymentIntent.id)).limit(1);
    if (order) {
      await db.update(orders).set({
        paymentStatus: "canceled",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(orders.id, order.id));
      console.log(`\u{1F6AB} Order ${order.id} marked as canceled`);
    }
  } catch (error) {
    console.error("\u274C Error handling payment cancellation:", error);
  }
}
async function handlePaymentProcessing(paymentIntent) {
  try {
    console.log("\u23F3 Payment processing:", paymentIntent.id);
    const [order] = await db.select().from(orders).where(eq4(orders.stripePaymentIntentId, paymentIntent.id)).limit(1);
    if (order && order.paymentStatus !== "paid") {
      await db.update(orders).set({
        paymentStatus: "processing",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(orders.id, order.id));
      console.log(`\u23F3 Order ${order.id} marked as processing`);
    }
  } catch (error) {
    console.error("\u274C Error handling payment processing:", error);
  }
}
async function handleChargeRefunded(charge) {
  try {
    console.log("\u{1F4B8} Charge refunded:", charge.id);
    if (!charge.payment_intent) return;
    const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent.id;
    const [order] = await db.select().from(orders).where(eq4(orders.stripePaymentIntentId, paymentIntentId)).limit(1);
    if (order) {
      const refundAmount = charge.amount_refunded / 100;
      await db.update(orders).set({
        paymentStatus: charge.amount_refunded === charge.amount ? "refunded" : "partially_refunded",
        refundAmount: refundAmount.toString(),
        refundedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(orders.id, order.id));
      console.log(`\u{1F4B8} Order ${order.id} refunded \u20AC${refundAmount}`);
    }
  } catch (error) {
    console.error("\u274C Error handling charge refund:", error);
  }
}
async function handleDisputeCreated(dispute) {
  try {
    console.log("\u26A0\uFE0F Dispute created:", dispute.id);
  } catch (error) {
    console.error("\u274C Error handling dispute:", error);
  }
}
var payment_default = router;

// server/routes.ts
import { z } from "zod";
import nodemailer from "nodemailer";

// server/monthly-report-service.ts
import sgMail from "@sendgrid/mail";
import { eq as eq5, and as and2, gte, lt, sql } from "drizzle-orm";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
async function generateMonthlyReport(branchId, targetDate) {
  try {
    const reportDate = targetDate || subMonths(/* @__PURE__ */ new Date(), 1);
    const monthStart = startOfMonth(reportDate);
    const monthEnd = endOfMonth(reportDate);
    const branchData = await db.select().from(branches).where(eq5(branches.id, branchId)).limit(1);
    const branchName = branchData[0]?.name || "Unknown Branch";
    console.log(`\u{1F4CA} Generating monthly report for ${branchName} - ${format(monthStart, "MMMM yyyy")}`);
    const monthlyOrders = await db.select().from(orders).where(
      and2(
        eq5(orders.branchId, branchId),
        gte(orders.createdAt, monthStart),
        lt(orders.createdAt, monthEnd)
      )
    );
    if (monthlyOrders.length === 0) {
      console.log("\u{1F4CA} No orders found for this month");
      return null;
    }
    const completedOrders = monthlyOrders.filter((o) => o.status === "completed");
    const cancelledOrders = monthlyOrders.filter((o) => o.status === "cancelled");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    const deliveryOrders = monthlyOrders.filter((o) => o.orderType === "delivery").length;
    const pickupOrders = monthlyOrders.filter((o) => o.orderType === "pickup").length;
    const cashPayments = monthlyOrders.filter((o) => o.paymentMethod === "cash").length;
    const cardPayments = monthlyOrders.filter((o) => o.paymentMethod === "card").length;
    const stripePayments = monthlyOrders.filter((o) => o.paymentMethod === "stripe").length;
    const paidOrders = monthlyOrders.filter((o) => o.paymentStatus === "paid").length;
    const pendingPayments = monthlyOrders.filter((o) => o.paymentStatus === "pending").length;
    const failedPayments = monthlyOrders.filter((o) => o.paymentStatus === "failed").length;
    const refundedPayments = monthlyOrders.filter((o) => o.paymentStatus === "refunded" || o.paymentStatus === "partially_refunded").length;
    const totalDeliveryFees = monthlyOrders.reduce((sum, o) => sum + parseFloat(o.deliveryFee || "0"), 0);
    const totalServiceFees = monthlyOrders.reduce((sum, o) => sum + parseFloat(o.serviceFee || "0"), 0);
    const totalSmallOrderFees = monthlyOrders.reduce((sum, o) => sum + parseFloat(o.smallOrderFee || "0"), 0);
    const orderIds = monthlyOrders.map((o) => o.id);
    const items = await db.select({
      menuItemId: orderItems.menuItemId,
      quantity: sql`sum(${orderItems.quantity})::int`,
      revenue: sql`sum(${orderItems.totalPrice})::numeric`,
      name: menuItems.name
    }).from(orderItems).leftJoin(menuItems, eq5(orderItems.menuItemId, menuItems.id)).where(sql`${orderItems.orderId} = ANY(ARRAY[${sql.raw(orderIds.join(","))}])`).groupBy(orderItems.menuItemId, menuItems.name).orderBy(sql`sum(${orderItems.quantity}) DESC`).limit(10);
    const topSellingItems = items.map((item) => ({
      name: item.name || "Unknown Item",
      quantity: item.quantity,
      revenue: parseFloat(String(item.revenue)) || 0
    }));
    const dailyStats = /* @__PURE__ */ new Map();
    monthlyOrders.forEach((order) => {
      if (order.createdAt) {
        const dateKey = format(order.createdAt, "yyyy-MM-dd");
        const existing = dailyStats.get(dateKey) || { orders: 0, revenue: 0 };
        existing.orders += 1;
        if (order.status === "completed") {
          existing.revenue += parseFloat(order.totalAmount);
        }
        dailyStats.set(dateKey, existing);
      }
    });
    const dailyBreakdown = Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      orders: stats.orders,
      revenue: stats.revenue
    })).sort((a, b) => a.date.localeCompare(b.date));
    return {
      branchId,
      branchName,
      period: {
        month: format(monthStart, "MMMM"),
        year: monthStart.getFullYear(),
        startDate: format(monthStart, "yyyy-MM-dd"),
        endDate: format(monthEnd, "yyyy-MM-dd")
      },
      summary: {
        totalOrders: monthlyOrders.length,
        completedOrders: completedOrders.length,
        cancelledOrders: cancelledOrders.length,
        totalRevenue,
        averageOrderValue
      },
      orderTypes: {
        delivery: deliveryOrders,
        pickup: pickupOrders
      },
      paymentMethods: {
        cash: cashPayments,
        card: cardPayments,
        stripe: stripePayments
      },
      paymentStatus: {
        paid: paidOrders,
        pending: pendingPayments,
        failed: failedPayments,
        refunded: refundedPayments
      },
      topSellingItems,
      dailyBreakdown,
      fees: {
        totalDeliveryFees,
        totalServiceFees,
        totalSmallOrderFees
      }
    };
  } catch (error) {
    console.error("\u274C Error generating monthly report:", error);
    throw error;
  }
}
function generateReportHtml(report, restaurantName) {
  const topItemsRows = report.topSellingItems.map((item, index) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${index + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">\u20AC${item.revenue.toFixed(2)}</td>
    </tr>
  `).join("");
  const dailyRows = report.dailyBreakdown.map((day) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${day.date}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${day.orders}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">\u20AC${day.revenue.toFixed(2)}</td>
    </tr>
  `).join("");
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Monthly Report - ${report.period.month} ${report.period.year}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e53e3e; padding-bottom: 20px;">
          <h1 style="color: #e53e3e; margin: 0;">${restaurantName}</h1>
          <h2 style="color: #333; margin: 10px 0 0;">Monthly Report - ${report.branchName || "All Branches"}</h2>
          <p style="color: #666; font-size: 18px;">${report.period.month} ${report.period.year}</p>
          <p style="color: #999; font-size: 14px;">${report.period.startDate} to ${report.period.endDate}</p>
        </div>

        <!-- Summary Section -->
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #e53e3e; margin-top: 0;">\u{1F4CA} Summary</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: white; padding: 15px; border-radius: 5px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #333;">${report.summary.totalOrders}</div>
              <div style="color: #666;">Total Orders</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #22c55e;">\u20AC${report.summary.totalRevenue.toFixed(2)}</div>
              <div style="color: #666;">Total Revenue</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #333;">${report.summary.completedOrders}</div>
              <div style="color: #666;">Completed</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #333;">\u20AC${report.summary.averageOrderValue.toFixed(2)}</div>
              <div style="color: #666;">Avg Order Value</div>
            </div>
          </div>
        </div>

        <!-- Order Types -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #e53e3e;">\u{1F69A} Order Types</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">Delivery Orders</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right; font-weight: bold;">${report.orderTypes.delivery}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">Pickup Orders</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right; font-weight: bold;">${report.orderTypes.pickup}</td>
            </tr>
          </table>
        </div>

        <!-- Payment Methods -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #e53e3e;">\u{1F4B3} Payment Methods</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">Cash</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right; font-weight: bold;">${report.paymentMethods.cash}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">Card (POS)</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right; font-weight: bold;">${report.paymentMethods.card}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">Online (Stripe)</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right; font-weight: bold;">${report.paymentMethods.stripe}</td>
            </tr>
          </table>
        </div>

        <!-- Payment Status -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #e53e3e;">\u{1F4DD} Payment Status</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">Paid</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right; font-weight: bold; color: #22c55e;">${report.paymentStatus.paid}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">Pending</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right; font-weight: bold; color: #f59e0b;">${report.paymentStatus.pending}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">Failed</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right; font-weight: bold; color: #ef4444;">${report.paymentStatus.failed}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">Refunded</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right; font-weight: bold;">${report.paymentStatus.refunded}</td>
            </tr>
          </table>
        </div>

        <!-- Fees Collected -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #e53e3e;">\u{1F4B0} Fees Collected</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">Delivery Fees</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right; font-weight: bold;">\u20AC${report.fees.totalDeliveryFees.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">Service Fees</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right; font-weight: bold;">\u20AC${report.fees.totalServiceFees.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">Small Order Fees</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right; font-weight: bold;">\u20AC${report.fees.totalSmallOrderFees.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <!-- Top Selling Items -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #e53e3e;">\u{1F3C6} Top Selling Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f7fafc;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e53e3e;">#</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e53e3e;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e53e3e;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e53e3e;">Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${topItemsRows}
            </tbody>
          </table>
        </div>

        <!-- Daily Breakdown -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #e53e3e;">\u{1F4C5} Daily Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f7fafc;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e53e3e;">Date</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e53e3e;">Orders</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e53e3e;">Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${dailyRows}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
          <p>This report was automatically generated on ${format(/* @__PURE__ */ new Date(), "PPpp")}</p>
          <p style="font-size: 12px;">Powered by PlateOS Restaurant Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
async function sendMonthlyReportEmail(branchId, targetDate) {
  try {
    const branchData = await db.select().from(branches).where(eq5(branches.id, branchId)).limit(1);
    const config = await db.select().from(restaurantConfig).limit(1);
    const branch = branchData[0];
    if (!branch) {
      console.log(`\u{1F4E7} Branch with ID ${branchId} not found`);
      return false;
    }
    const reportEmail = branch.monthlyReportEmail;
    const reportEnabled = branch.monthlyReportEnabled;
    const restaurantName = config[0]?.name || "Restaurant";
    if (!reportEnabled) {
      console.log(`\u{1F4E7} Monthly report is disabled for branch: ${branch.name}`);
      return false;
    }
    if (!reportEmail) {
      console.log(`\u{1F4E7} No monthly report email configured for branch: ${branch.name}`);
      return false;
    }
    const report = await generateMonthlyReport(branchId, targetDate);
    if (!report) {
      console.log(`\u{1F4E7} No data to report for branch: ${branch.name}`);
      return false;
    }
    const htmlContent = generateReportHtml(report, restaurantName);
    const msg = {
      to: reportEmail,
      from: process.env.SENDGRID_FROM_EMAIL || "reports@ravintolababylon.fi",
      subject: `Monthly Report - ${report.period.month} ${report.period.year} - ${restaurantName} (${branch.name})`,
      html: htmlContent
    };
    await sgMail.send(msg);
    console.log(`\u2705 Monthly report sent successfully for branch ${branch.name} to ${reportEmail}`);
    return true;
  } catch (error) {
    console.error("\u274C Failed to send monthly report email:", error);
    return false;
  }
}
async function sendAllBranchReports(targetDate) {
  const results = { sent: 0, failed: 0 };
  try {
    const enabledBranches = await db.select().from(branches).where(
      and2(
        eq5(branches.monthlyReportEnabled, true),
        eq5(branches.isActive, true)
      )
    );
    console.log(`\u{1F4C5} Found ${enabledBranches.length} branches with monthly reports enabled`);
    for (const branch of enabledBranches) {
      if (branch.monthlyReportEmail) {
        try {
          const success = await sendMonthlyReportEmail(branch.id, targetDate);
          if (success) {
            results.sent++;
          } else {
            results.failed++;
          }
        } catch (error) {
          console.error(`\u274C Failed to send report for branch ${branch.name}:`, error);
          results.failed++;
        }
      }
    }
    console.log(`\u{1F4C5} Monthly reports completed: ${results.sent} sent, ${results.failed} failed`);
    return results;
  } catch (error) {
    console.error("\u274C Error in sendAllBranchReports:", error);
    return results;
  }
}
async function triggerManualReport(branchId, email, month, year) {
  try {
    const config = await db.select().from(restaurantConfig).limit(1);
    const restaurantName = config[0]?.name || "Restaurant";
    let targetDate = /* @__PURE__ */ new Date();
    if (month !== void 0 && year !== void 0) {
      targetDate = new Date(year, month - 1, 1);
    }
    const report = await generateMonthlyReport(branchId, targetDate);
    if (!report) {
      console.log("\u{1F4E7} No data to report for the specified period");
      return false;
    }
    const htmlContent = generateReportHtml(report, restaurantName);
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || "reports@ravintolababylon.fi",
      subject: `Monthly Report - ${report.period.month} ${report.period.year} - ${restaurantName} (${report.branchName})`,
      html: htmlContent
    };
    await sgMail.send(msg);
    console.log(`\u2705 Manual monthly report sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("\u274C Failed to send manual monthly report:", error);
    return false;
  }
}

// server/scheduler.ts
import cron from "node-cron";
var scheduledTask = null;
function isSchedulerRunning() {
  return scheduledTask !== null;
}
function getNextScheduledRun() {
  const now = /* @__PURE__ */ new Date();
  let next = new Date(now.getFullYear(), now.getMonth() + 1, 1, 8, 0, 0);
  const thisMonthRun = new Date(now.getFullYear(), now.getMonth(), 1, 8, 0, 0);
  if (now < thisMonthRun) {
    next = thisMonthRun;
  }
  return next;
}

// server/routes.ts
var requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    console.log(`\u{1F513} Bearer token authentication accepted for ${req.method} ${req.path}`);
    return next();
  }
  console.log(`\u274C Authentication failed for ${req.method} ${req.path} - no session or Bearer token`);
  return res.status(401).json({ error: "Authentication required" });
};
async function registerRoutes(app3) {
  app3.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(`\u{1F510} Login attempt for email: ${email}`);
      console.log(`\u{1F310} Origin: ${req.headers.origin}`);
      console.log(`\u{1F36A} Session ID before login: ${req.sessionID}`);
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const user = await authService.authenticateUser(email, password);
      if (!user) {
        console.log(`\u274C Authentication failed for email: ${email}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      req.session.user = user;
      req.session.save((err) => {
        if (err) {
          console.error(`\u274C Session save error:`, err);
        } else {
          console.log(`\u2705 Session saved successfully`);
        }
      });
      console.log(`\u2705 User logged in successfully: ${user.email}`);
      console.log(`\u{1F36A} Session ID after login: ${req.sessionID}`);
      console.log(`\u{1F464} Session user: ${JSON.stringify(req.session.user)}`);
      console.log(`\u{1F527} Session cookie config: ${JSON.stringify(req.session.cookie)}`);
      res.json({ user });
    } catch (error) {
      console.error(`\u{1F4A5} Login error:`, error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });
  app3.post("/api/auth/logout", (req, res) => {
    console.log(`\u{1F6AA} Logout request from session: ${req.sessionID}`);
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
  paymentService.initialize().catch((err) => {
    console.error("\u274C Failed to initialize payment service:", err);
  });
  app3.use("/api/payment", payment_default);
  app3.post("/api/send-email", async (req, res) => {
    try {
      const { to, subject, html, replyTo } = req.body;
      if (!to || !Array.isArray(to) || to.length === 0) {
        return res.status(400).json({ error: "Recipients (to) are required and must be an array" });
      }
      if (!subject || !html) {
        return res.status(400).json({ error: "Subject and HTML content are required" });
      }
      console.log(`\u{1F4E7} Sending marketing email to ${to.length} recipients`);
      console.log(`\u{1F4E7} Subject: ${subject}`);
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 587,
        secure: false,
        // true for 465, false for other ports
        auth: {
          user: "no-reply@ravintolababylon.fi",
          pass: process.env.SMTP_PASSWORD || "your-password-here"
          // Set this in .env
        }
      });
      const info = await transporter.sendMail({
        from: '"Ravintola Babylon" <no-reply@ravintolababylon.fi>',
        to: to.join(", "),
        // Join all recipient emails
        subject,
        html,
        replyTo: replyTo || "info@ravintolababylon.fi"
      });
      console.log(`\u2705 Marketing email sent successfully: ${info.messageId}`);
      console.log(`\u{1F4EC} Recipients: ${to.length}`);
      res.json({
        success: true,
        messageId: info.messageId,
        recipientCount: to.length
      });
    } catch (error) {
      console.error("\u274C Failed to send marketing email:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to send email"
      });
    }
  });
  app3.get("/api/auth/me", (req, res) => {
    console.log(`\u{1F50D} Auth check for session: ${req.sessionID}`);
    console.log(`\u{1F310} Origin: ${req.headers.origin}`);
    console.log(`\u{1F36A} Cookie header: ${req.headers.cookie}`);
    console.log(`\u{1F36A} Session user: ${JSON.stringify(req.session.user)}`);
    console.log(`\u{1F4CB} Session data: ${JSON.stringify(req.session)}`);
    console.log(`\u{1F527} Request session cookie: ${req.session.cookie ? JSON.stringify(req.session.cookie) : "undefined"}`);
    if (req.session.user) {
      console.log(`\u2705 Auth check successful for user: ${req.session.user.email}`);
      res.json({ user: req.session.user });
    } else {
      console.log(`\u274C Auth check failed - no user in session`);
      res.status(401).json({ error: "Not authenticated" });
    }
  });
  app3.get("/api/ai/config", async (req, res) => {
    try {
      console.log(`\u{1F916} [AI Assistant] Fetching config`);
      const result = await db.execute(`SELECT * FROM ai_assistant_config LIMIT 1`);
      const config = (result.rows || result)?.[0];
      if (!config) {
        return res.json({
          id: null,
          api_provider: "openrouter",
          api_key: "",
          model: "z-ai/glm-4.5-air:free",
          api_base_url: "https://openrouter.ai/api/v1/chat/completions",
          max_tokens: 2e3,
          temperature: 0.7,
          is_enabled: true
        });
      }
      console.log(`\u2705 [AI Assistant] Config fetched`);
      res.json(config);
    } catch (error) {
      console.error(`\u274C [AI Assistant] Failed to fetch config:`, error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch AI config"
      });
    }
  });
  app3.put("/api/ai/config", requireAuth, async (req, res) => {
    try {
      const { api_provider, api_key, model, api_base_url, max_tokens, temperature, is_enabled } = req.body;
      console.log(`\u{1F916} [AI Assistant] Updating config`);
      const existing = await db.execute(`SELECT id FROM ai_assistant_config LIMIT 1`);
      const existingRow = (existing.rows || existing)?.[0];
      if (existingRow) {
        await db.execute(`
          UPDATE ai_assistant_config 
          SET 
            api_provider = '${api_provider || "openrouter"}',
            api_key = '${api_key}',
            model = '${model || "z-ai/glm-4.5-air:free"}',
            api_base_url = '${api_base_url || "https://openrouter.ai/api/v1/chat/completions"}',
            max_tokens = ${max_tokens || 2e3},
            temperature = ${temperature || 0.7},
            is_enabled = ${is_enabled !== false}
          WHERE id = ${existingRow.id}
        `);
      } else {
        await db.execute(`
          INSERT INTO ai_assistant_config (api_provider, api_key, model, api_base_url, max_tokens, temperature, is_enabled)
          VALUES (
            '${api_provider || "openrouter"}',
            '${api_key}',
            '${model || "z-ai/glm-4.5-air:free"}',
            '${api_base_url || "https://openrouter.ai/api/v1/chat/completions"}',
            ${max_tokens || 2e3},
            ${temperature || 0.7},
            ${is_enabled !== false}
          )
        `);
      }
      console.log(`\u2705 [AI Assistant] Config updated`);
      res.json({ success: true });
    } catch (error) {
      console.error(`\u274C [AI Assistant] Failed to update config:`, error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to update AI config"
      });
    }
  });
  app3.post("/api/ai/execute-sql", async (req, res) => {
    try {
      const { sql: sql2, isDestructive } = req.body;
      if (!sql2) {
        return res.status(400).json({ error: "SQL query is required" });
      }
      console.log(`\u{1F916} [AI Assistant] Executing SQL: ${sql2.substring(0, 100)}...`);
      console.log(`\u{1F512} Destructive: ${isDestructive}`);
      const normalizedSql = sql2.trim().toLowerCase();
      const allowedStatements = ["select", "update", "insert", "delete"];
      const startsWithAllowed = allowedStatements.some((stmt) => normalizedSql.startsWith(stmt));
      if (!startsWithAllowed) {
        console.log(`\u274C [AI Assistant] Blocked non-allowed SQL statement`);
        return res.status(403).json({ error: "Only SELECT, UPDATE, INSERT, DELETE statements are allowed" });
      }
      const dangerousPatterns = [
        /drop\s+(table|database|schema|index)/i,
        /truncate\s+table/i,
        /alter\s+table/i,
        /create\s+(table|database|schema|index)/i,
        /grant\s+/i,
        /revoke\s+/i,
        /pg_/i,
        /information_schema/i,
        /--/,
        /;.*;/
      ];
      for (const pattern of dangerousPatterns) {
        if (pattern.test(sql2)) {
          console.log(`\u274C [AI Assistant] Blocked dangerous SQL pattern: ${pattern}`);
          return res.status(403).json({ error: "This SQL operation is not allowed for safety reasons" });
        }
      }
      const result = await db.execute(sql2);
      console.log(`\u2705 [AI Assistant] Query executed successfully`);
      res.json({
        data: result.rows || result,
        rowCount: result.rowCount || (Array.isArray(result) ? result.length : 0)
      });
    } catch (error) {
      console.error(`\u274C [AI Assistant] SQL execution error:`, error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Query execution failed"
      });
    }
  });
  app3.get("/api/ai/schema-info", requireAuth, async (req, res) => {
    try {
      console.log(`\u{1F916} [AI Assistant] Fetching schema info`);
      const schemaQuery = `
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
      `;
      const result = await db.execute(schemaQuery);
      const schema = {};
      for (const row of result.rows || result) {
        if (!schema[row.table_name]) {
          schema[row.table_name] = [];
        }
        schema[row.table_name].push({
          column: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === "YES"
        });
      }
      console.log(`\u2705 [AI Assistant] Schema info fetched for ${Object.keys(schema).length} tables`);
      res.json({ schema });
    } catch (error) {
      console.error(`\u274C [AI Assistant] Failed to fetch schema info:`, error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch schema info"
      });
    }
  });
  app3.get("/api/ai/analytics-context", requireAuth, async (req, res) => {
    try {
      console.log(`\u{1F916} [AI Assistant] Fetching analytics context`);
      const [ordersCount, menuItemsCount, categoriesCount, branchesCount] = await Promise.all([
        db.execute(`SELECT COUNT(*) as count FROM orders`),
        db.execute(`SELECT COUNT(*) as count FROM menu_items`),
        db.execute(`SELECT COUNT(*) as count FROM categories`),
        db.execute(`SELECT COUNT(*) as count FROM branches`)
      ]);
      const context = {
        totalOrders: ordersCount.rows?.[0]?.count || 0,
        totalMenuItems: menuItemsCount.rows?.[0]?.count || 0,
        totalCategories: categoriesCount.rows?.[0]?.count || 0,
        totalBranches: branchesCount.rows?.[0]?.count || 0,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log(`\u2705 [AI Assistant] Analytics context fetched`);
      res.json(context);
    } catch (error) {
      console.error(`\u274C [AI Assistant] Failed to fetch analytics context:`, error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch analytics context"
      });
    }
  });
  app3.get("/api/printers", async (req, res) => {
    try {
      console.log("\u{1F4E5} [API] GET /api/printers - Fetching all printers");
      const printers2 = await storage.getAllPrinters();
      console.log(`\u2705 [API] Found ${printers2.length} printers`);
      res.json(printers2);
    } catch (error) {
      console.error("\u274C [API] Failed to get printers:", error);
      console.error("\u274C [API] Error details:", error instanceof Error ? error.message : String(error));
      console.error("\u274C [API] Error stack:", error instanceof Error ? error.stack : "");
      res.status(500).json({ error: "Failed to get printers", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app3.get("/api/printers/:id", async (req, res) => {
    try {
      const printer = await storage.getPrinter(req.params.id);
      if (!printer) {
        return res.status(404).json({ error: "Printer not found" });
      }
      res.json(printer);
    } catch (error) {
      console.error("\u274C Failed to get printer:", error);
      res.status(500).json({ error: "Failed to get printer" });
    }
  });
  app3.post("/api/printers", async (req, res) => {
    try {
      const { id, name, address, port, printerType, isActive, fontSettings } = req.body;
      console.log("\u{1F4E5} [API] POST /api/printers - Request body:", { id, name, address, port, printerType, isActive, hasFontSettings: !!fontSettings });
      if (!id || !name || !address || !port || !printerType) {
        console.error("\u274C [API] Missing required fields");
        return res.status(400).json({ error: "Missing required fields" });
      }
      const printer = await storage.upsertPrinter({
        id,
        name,
        address,
        port,
        printerType,
        isActive: isActive ?? true,
        fontSettings: fontSettings || void 0
      });
      console.log("\u2705 [API] Printer saved successfully:", printer.id);
      res.json(printer);
    } catch (error) {
      console.error("\u274C [API] Failed to save printer:", error);
      console.error("\u274C [API] Error details:", error instanceof Error ? error.message : String(error));
      console.error("\u274C [API] Error stack:", error instanceof Error ? error.stack : "");
      res.status(500).json({ error: "Failed to save printer", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app3.put("/api/printers/:id", async (req, res) => {
    try {
      const { name, address, port, printerType, isActive, fontSettings } = req.body;
      console.log("\u{1F4E5} [API] PUT /api/printers/:id - Request:", { id: req.params.id, name, address, port, printerType, isActive, hasFontSettings: !!fontSettings });
      const printer = await storage.upsertPrinter({
        id: req.params.id,
        name,
        address,
        port,
        printerType,
        isActive,
        fontSettings: fontSettings || void 0
      });
      console.log("\u2705 [API] Printer updated successfully:", printer.id);
      res.json(printer);
    } catch (error) {
      console.error("\u274C [API] Failed to update printer:", error);
      console.error("\u274C [API] Error details:", error instanceof Error ? error.message : String(error));
      console.error("\u274C [API] Error stack:", error instanceof Error ? error.stack : "");
      res.status(500).json({ error: "Failed to update printer", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app3.delete("/api/printers/:id", async (req, res) => {
    try {
      await storage.deletePrinter(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("\u274C Failed to delete printer:", error);
      res.status(500).json({ error: "Failed to delete printer" });
    }
  });
  app3.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  app3.get("/api/menu-items", async (req, res) => {
    try {
      const { categoryId } = req.query;
      let items;
      if (categoryId) {
        items = await storage.getMenuItemsByCategory(parseInt(categoryId));
      } else {
        items = await storage.getMenuItems();
      }
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });
  app3.patch("/api/menu-items/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      console.log("\u{1F50D} SERVER: Received PATCH request for menu item", id);
      console.log("\u{1F50D} SERVER: Update data:", updateData);
      console.log("\u{1F50D} SERVER: hasConditionalPricing:", updateData.hasConditionalPricing);
      console.log("\u{1F50D} SERVER: includedToppingsCount:", updateData.includedToppingsCount);
      const updated = await storage.updateMenuItem(id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      console.log("\u2705 SERVER: Updated item:", updated);
      console.log("\u2705 SERVER: Result hasConditionalPricing:", updated.hasConditionalPricing);
      console.log("\u2705 SERVER: Result includedToppingsCount:", updated.includedToppingsCount);
      res.json(updated);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ error: "Failed to update menu item" });
    }
  });
  app3.get("/api/toppings", async (req, res) => {
    try {
      const { category } = req.query;
      if (category) {
        const toppings2 = await storage.getToppingsByCategory(category);
        res.json(toppings2);
      } else {
        const toppings2 = await storage.getToppings();
        res.json(toppings2);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch toppings" });
    }
  });
  app3.post("/api/toppings", async (req, res) => {
    try {
      const toppingData = insertToppingSchema.parse(req.body);
      const topping = await storage.createTopping(toppingData);
      res.status(201).json(topping);
    } catch (error) {
      res.status(500).json({ error: "Failed to create topping" });
    }
  });
  app3.patch("/api/toppings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const toppingData = req.body;
      const updated = await storage.updateTopping(id, toppingData);
      if (!updated) {
        return res.status(404).json({ error: "Topping not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update topping" });
    }
  });
  app3.delete("/api/toppings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTopping(id);
      if (!deleted) {
        return res.status(404).json({ error: "Topping not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete topping" });
    }
  });
  app3.get("/api/orders", async (req, res) => {
    try {
      const orders2 = await storage.getOrders();
      const menuItems2 = await storage.getMenuItems();
      const enrichedOrders = await Promise.all(
        orders2.map(async (order) => {
          const orderItems3 = await storage.getOrderItems(order.id);
          const enrichedItems = orderItems3.map((item) => {
            const menuItem = menuItems2.find((mi) => mi.id === item.menuItemId);
            let toppings2 = [];
            let size = "";
            let specialInstructions = "";
            const combinedInstructions = item.specialInstructions || "";
            if (combinedInstructions) {
              const toppingsMatch = combinedInstructions.match(/Toppings:\s*([^;]+)/);
              if (toppingsMatch) {
                toppings2 = toppingsMatch[1].split(",").map((t) => t.trim()).filter((t) => t);
              }
              const sizeMatch = combinedInstructions.match(/Size:\s*([^;]+)/);
              if (sizeMatch) {
                size = sizeMatch[1].trim();
              }
              const specialMatch = combinedInstructions.match(/Special:\s*(.+)/);
              if (specialMatch) {
                specialInstructions = specialMatch[1].trim();
              }
            }
            return {
              ...item,
              name: menuItem?.name || "Unknown Item",
              nameEn: menuItem?.nameEn || "Unknown Item",
              description: menuItem?.description || "",
              toppings: toppings2,
              size,
              specialInstructions: specialInstructions || null
            };
          });
          return {
            ...order,
            items: enrichedItems
          };
        })
      );
      res.json(enrichedOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app3.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const orderItems3 = await storage.getOrderItems(id);
      const menuItems2 = await storage.getMenuItems();
      const enrichedItems = orderItems3.map((item) => {
        const menuItem = menuItems2.find((mi) => mi.id === item.menuItemId);
        let toppings2 = [];
        let size = "";
        let specialInstructions = "";
        const combinedInstructions = item.specialInstructions || "";
        if (combinedInstructions) {
          const toppingsMatch = combinedInstructions.match(/Toppings:\s*([^;]+)/);
          if (toppingsMatch) {
            toppings2 = toppingsMatch[1].split(",").map((t) => t.trim()).filter((t) => t);
          }
          const sizeMatch = combinedInstructions.match(/Size:\s*([^;]+)/);
          if (sizeMatch) {
            size = sizeMatch[1].trim();
          }
          const specialMatch = combinedInstructions.match(/Special:\s*(.+)/);
          if (specialMatch) {
            specialInstructions = specialMatch[1].trim();
          }
        }
        return {
          ...item,
          name: menuItem?.name || "Unknown Item",
          nameEn: menuItem?.nameEn || "Unknown Item",
          description: menuItem?.description || "",
          toppings: toppings2,
          size,
          specialInstructions: specialInstructions || null
        };
      });
      res.json({ ...order, items: enrichedItems });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  app3.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const { items, ...order } = req.body;
      console.log("\u{1F4DD} Creating order with branch_id:", order.branchId, "for customer:", order.customerName);
      let subtotal = 0;
      const validatedItems = [];
      for (const item of items) {
        const menuItems2 = await storage.getMenuItems();
        const menuItem = menuItems2.find((mi) => mi.id === item.menuItemId);
        if (!menuItem) {
          return res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
        }
        const basePrice = parseFloat(menuItem.price);
        const toppingsPrice = item.toppingsPrice || 0;
        const sizePrice = item.sizePrice || 0;
        const itemUnitPrice = basePrice + toppingsPrice + sizePrice;
        const totalPrice = itemUnitPrice * item.quantity;
        subtotal += totalPrice;
        let combinedInstructions = "";
        if (item.toppings && item.toppings.length > 0) {
          const toppingNames = item.toppings.map((topping) => {
            if (typeof topping === "object" && topping.name) {
              return `${topping.name} (+\u20AC${parseFloat(topping.price || 0).toFixed(2)})`;
            }
            return topping;
          });
          combinedInstructions += `Toppings: ${toppingNames.join(", ")}`;
        }
        if (item.size && item.size !== "normal") {
          if (combinedInstructions) combinedInstructions += "; ";
          combinedInstructions += `Size: ${item.size}`;
        }
        if (item.specialInstructions) {
          if (combinedInstructions) combinedInstructions += "; ";
          combinedInstructions += `Special: ${item.specialInstructions}`;
        }
        validatedItems.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: itemUnitPrice.toFixed(2),
          // Include toppings in unit price
          totalPrice: totalPrice.toFixed(2),
          specialInstructions: combinedInstructions || null
        });
      }
      const deliveryFee = order.orderType === "delivery" ? parseFloat(order.deliveryFee || "3.50") : 0;
      const smallOrderFee = parseFloat(order.smallOrderFee || "0");
      const serviceFee = parseFloat(order.serviceFee || "0");
      const totalAmount = subtotal + deliveryFee + smallOrderFee + serviceFee;
      const newOrder = await storage.createOrder({
        ...order,
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        smallOrderFee: smallOrderFee.toFixed(2),
        serviceFee: serviceFee.toFixed(2),
        totalAmount: totalAmount.toFixed(2)
      });
      console.log("\u2705 Order created:", newOrder.orderNumber, "with branch_id:", newOrder.branchId);
      for (const item of validatedItems) {
        await storage.createOrderItem({
          orderId: newOrder.id,
          ...item
        });
      }
      const shouldNotify = newOrder.paymentStatus === "paid" || newOrder.paymentStatus === "pending" || newOrder.paymentStatus === "cash";
      if (shouldNotify) {
        const notifyAdmins = app3.notifyAdminsNewOrder;
        if (notifyAdmins) {
          console.log("\u{1F4E2} Notifying admins of order:", newOrder.orderNumber, "status:", newOrder.paymentStatus);
          notifyAdmins(newOrder);
        }
      } else {
        console.log("\u23F3 Skipping notification for order:", newOrder.orderNumber, "status:", newOrder.paymentStatus, "(waiting for payment)");
      }
      if (newOrder.customerEmail) {
        try {
          const allMenuItems = await storage.getMenuItems();
          const menuItemMap = new Map(
            allMenuItems.map((item) => [item.id, item])
          );
          const { sendOrderConfirmationEmail: sendOrderConfirmationEmail2 } = await Promise.resolve().then(() => (init_email_service(), email_service_exports));
          await sendOrderConfirmationEmail2({
            orderNumber: newOrder.orderNumber || newOrder.id.toString(),
            customerName: newOrder.customerName || "Valued Customer",
            customerEmail: newOrder.customerEmail,
            items: validatedItems.map((item, index) => ({
              name: menuItemMap.get(item.menuItemId)?.name || `Item ${index + 1}`,
              quantity: item.quantity,
              price: parseFloat(item.unitPrice.toString()),
              totalPrice: parseFloat(item.totalPrice),
              toppings: []
              // Add toppings handling if needed
            })),
            subtotal: parseFloat(subtotal.toString()),
            deliveryFee: parseFloat(deliveryFee.toString()),
            smallOrderFee: parseFloat(smallOrderFee.toString()),
            serviceFee: parseFloat(serviceFee.toString()),
            totalAmount: parseFloat(totalAmount.toString()),
            orderType: newOrder.orderType || "pickup",
            deliveryAddress: newOrder.deliveryAddress || void 0,
            estimatedDeliveryTime: void 0
            // Add this when we implement delivery time estimation
          });
        } catch (error) {
          console.error("Failed to send order confirmation email:", error);
        }
      }
      res.status(201).json(newOrder);
    } catch (error) {
      console.error("Order creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create order", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app3.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const validStatuses = ["pending", "accepted", "preparing", "ready", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const updated = await storage.updateOrderStatus(id, status);
      if (!updated) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });
  app3.patch("/api/orders/:id/payment-intent", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        return res.status(400).json({ error: "Payment intent ID is required" });
      }
      const result = await db.update(orders).set({ stripePaymentIntentId: paymentIntentId }).where(eq6(orders.id, id)).returning();
      if (!result || result.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      console.log(`\u2705 Updated order ${id} with payment intent ${paymentIntentId}`);
      res.json(result[0]);
    } catch (error) {
      console.error("\u274C Error updating payment intent ID:", error);
      res.status(500).json({ error: "Failed to update payment intent ID" });
    }
  });
  app3.get("/api/orders/by-payment-intent/:paymentIntentId", async (req, res) => {
    try {
      const { paymentIntentId } = req.params;
      console.log("\u{1F50D} Looking up order by payment intent:", paymentIntentId);
      const result = await db.select().from(orders).where(eq6(orders.stripePaymentIntentId, paymentIntentId)).limit(1);
      if (!result || result.length === 0) {
        console.log("\u274C Order not found for payment intent:", paymentIntentId);
        return res.status(404).json({ error: "Order not found" });
      }
      console.log("\u2705 Found order:", result[0].id, result[0].orderNumber);
      res.json(result[0]);
    } catch (error) {
      console.error("\u274C Error fetching order by payment intent:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  app3.post("/api/menu-items", requireAuth, async (req, res) => {
    try {
      const menuItemData = req.body;
      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ error: "Failed to create menu item" });
    }
  });
  app3.put("/api/menu-items/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItemData = req.body;
      const updatedMenuItem = await storage.updateMenuItem(id, menuItemData);
      if (!updatedMenuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json(updatedMenuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ error: "Failed to update menu item" });
    }
  });
  app3.post("/api/upload-image", requireAuth, upload.single("image"), async (req, res) => {
    try {
      const file = req.file;
      const restaurantName = req.body.restaurantName || "default-restaurant";
      const folder = req.body.folder || "menu-items";
      if (!file) {
        console.error("\u274C No file provided in request");
        return res.status(400).json({ error: "Image file is required" });
      }
      console.log("\u{1F4F8} Uploading image for folder:", folder);
      console.log("\u{1F4C1} File details:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
      console.log("\u{1F4E1} Uploading to Hostinger FTP...");
      const imageUrl = await uploadImageToHostinger(file, folder);
      console.log("\u2705 Image uploaded successfully:", imageUrl);
      res.json({ imageUrl });
    } catch (error) {
      console.error("\u274C Error uploading image:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({
        error: "Failed to upload image",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app3.get("/api/test-hostinger", requireAuth, async (req, res) => {
    try {
      console.log("\u{1F50C} Testing Hostinger FTP connection...");
      const isConnected = await testHostingerConnection();
      if (isConnected) {
        res.json({
          success: true,
          message: "Hostinger FTP connection successful",
          strategy: process.env.IMAGE_UPLOAD_STRATEGY || "hostinger"
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Hostinger FTP connection failed. Check credentials."
        });
      }
    } catch (error) {
      console.error("Error testing Hostinger:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app3.get("/api/monthly-report/branches", requireAuth, async (req, res) => {
    try {
      let branchList;
      try {
        branchList = await db.select({
          id: branches.id,
          name: branches.name,
          monthlyReportEmail: branches.monthlyReportEmail,
          monthlyReportEnabled: branches.monthlyReportEnabled
        }).from(branches).where(eq6(branches.isActive, true));
      } catch (columnError) {
        console.log("\u26A0\uFE0F Monthly report columns may not exist yet, fetching basic branch info");
        const basicBranches = await db.select({
          id: branches.id,
          name: branches.name
        }).from(branches).where(eq6(branches.isActive, true));
        branchList = basicBranches.map((b) => ({
          ...b,
          monthlyReportEmail: null,
          monthlyReportEnabled: false
        }));
      }
      res.json({
        branches: branchList,
        schedulerRunning: isSchedulerRunning(),
        nextRun: getNextScheduledRun().toISOString()
      });
    } catch (error) {
      console.error("\u274C Error fetching branches for monthly report:", error);
      res.status(500).json({ error: "Failed to fetch branches" });
    }
  });
  app3.get("/api/monthly-report/settings/:branchId", requireAuth, async (req, res) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const branch = await db.select({
        id: branches.id,
        name: branches.name,
        monthlyReportEmail: branches.monthlyReportEmail,
        monthlyReportEnabled: branches.monthlyReportEnabled
      }).from(branches).where(eq6(branches.id, branchId)).limit(1);
      if (branch.length === 0) {
        return res.status(404).json({ error: "Branch not found" });
      }
      res.json({
        branchId: branch[0].id,
        branchName: branch[0].name,
        email: branch[0].monthlyReportEmail || "",
        enabled: branch[0].monthlyReportEnabled || false,
        schedulerRunning: isSchedulerRunning(),
        nextRun: getNextScheduledRun().toISOString()
      });
    } catch (error) {
      console.error("\u274C Error fetching monthly report settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });
  app3.put("/api/monthly-report/settings/:branchId", requireAuth, async (req, res) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const { email, enabled } = req.body;
      const existing = await db.select().from(branches).where(eq6(branches.id, branchId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Branch not found" });
      }
      await db.update(branches).set({
        monthlyReportEmail: email || null,
        monthlyReportEnabled: enabled === true
      }).where(eq6(branches.id, branchId));
      console.log(`\u2705 Monthly report settings updated for branch ${existing[0].name}: email=${email}, enabled=${enabled}`);
      res.json({
        success: true,
        branchId,
        email: email || "",
        enabled: enabled === true
      });
    } catch (error) {
      console.error("\u274C Error updating monthly report settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });
  app3.get("/api/monthly-report/preview/:branchId", requireAuth, async (req, res) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const { month, year } = req.query;
      let targetDate;
      if (month && year) {
        targetDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      }
      const report = await generateMonthlyReport(branchId, targetDate);
      if (!report) {
        return res.status(404).json({ error: "No data available for the specified period" });
      }
      res.json(report);
    } catch (error) {
      console.error("\u274C Error generating report preview:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });
  app3.post("/api/monthly-report/send/:branchId", requireAuth, async (req, res) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const { email, month, year } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email address is required" });
      }
      const success = await triggerManualReport(
        branchId,
        email,
        month ? parseInt(month) : void 0,
        year ? parseInt(year) : void 0
      );
      if (success) {
        res.json({ success: true, message: `Report sent to ${email}` });
      } else {
        res.status(500).json({ error: "Failed to send report" });
      }
    } catch (error) {
      console.error("\u274C Error sending manual report:", error);
      res.status(500).json({ error: "Failed to send report" });
    }
  });
  app3.post("/api/monthly-report/send-all", requireAuth, async (req, res) => {
    try {
      const { month, year } = req.body;
      let targetDate;
      if (month && year) {
        targetDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      }
      const results = await sendAllBranchReports(targetDate);
      res.json({
        success: true,
        message: `Reports sent: ${results.sent}, Failed: ${results.failed}`,
        ...results
      });
    } catch (error) {
      console.error("\u274C Error sending reports to all branches:", error);
      res.status(500).json({ error: "Failed to send reports" });
    }
  });
  app3.post("/api/menu-items/:id/images", requireAuth, upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = req.file;
      const restaurantName = req.body.restaurantName || "default-restaurant";
      if (!file) {
        return res.status(400).json({ error: "Image file is required" });
      }
      console.log("\u{1F4F8} Uploading menu item image to Cloudinary for restaurant:", restaurantName, "menu item:", id);
      const imageUrl = await uploadImageToSupabase(file, restaurantName, "menu-items");
      const updatedMenuItem = await storage.updateMenuItem(id, { imageUrl });
      if (!updatedMenuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json({ imageUrl, menuItem: updatedMenuItem });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
  const httpServer = createServer(app3);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const adminConnections = /* @__PURE__ */ new Set();
  wss.on("connection", (ws) => {
    console.log("WebSocket connection established");
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "admin_connect") {
          adminConnections.add(ws);
          console.log("Admin connected for notifications");
          ws.send(JSON.stringify({ type: "connection_confirmed", message: "Admin connected" }));
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      adminConnections.delete(ws);
      console.log("WebSocket connection closed");
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      adminConnections.delete(ws);
    });
  });
  function notifyAdminsNewOrder(order) {
    const notification = {
      type: "new_order",
      order,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    adminConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(notification));
      }
    });
  }
  app3.notifyAdminsNewOrder = notifyAdminsNewOrder;
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import { fileURLToPath } from "url";
var __dirname = path2.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname, "./src")
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: "es"
      }
    }
  },
  server: {
    port: 5174,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  },
  define: {
    global: "globalThis"
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app3) {
  const distPath = path3.resolve(process.cwd(), "dist");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  const indexPath = path3.resolve(distPath, "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `Could not find index.html in: ${distPath}, make sure to build the client first`
    );
  }
  app3.use(express2.static(distPath));
  app3.use("*", (_req, res) => {
    res.sendFile(indexPath);
  });
}

// server/initialize-toppings.ts
async function initializeComprehensiveToppings() {
  try {
    const existingToppings = await db.select().from(toppings).limit(1);
    if (existingToppings.length > 0) {
      console.log("Toppings already initialized");
      return;
    }
    console.log("Initializing comprehensive toppings...");
    const allToppings = [
      // Pizza Toppings
      { name: "tomaatti", nameEn: "tomato", nameAr: "\u0637\u0645\u0627\u0637\u0645", price: "1.00", category: "pizza", type: "topping", displayOrder: 1 },
      { name: "sipuli", nameEn: "onion", nameAr: "\u0628\u0635\u0644", price: "1.00", category: "pizza", type: "topping", displayOrder: 2 },
      { name: "herkkusieni", nameEn: "mushroom", nameAr: "\u0641\u0637\u0631", price: "1.00", category: "pizza", type: "topping", displayOrder: 3 },
      { name: "paprika", nameEn: "bell pepper", nameAr: "\u0641\u0644\u0641\u0644 \u062D\u0644\u0648", price: "1.00", category: "pizza", type: "topping", displayOrder: 4 },
      { name: "oliivi", nameEn: "olive", nameAr: "\u0632\u064A\u062A\u0648\u0646", price: "1.00", category: "pizza", type: "topping", displayOrder: 5 },
      { name: "ananas", nameEn: "pineapple", nameAr: "\u0623\u0646\u0627\u0646\u0627\u0633", price: "1.00", category: "pizza", type: "topping", displayOrder: 6 },
      { name: "jalapeno", nameEn: "jalape\xF1o", nameAr: "\u0647\u0627\u0644\u0627\u0628\u064A\u0646\u0648", price: "1.00", category: "pizza", type: "topping", displayOrder: 7 },
      { name: "jauheliha", nameEn: "ground meat", nameAr: "\u0644\u062D\u0645 \u0645\u0641\u0631\u0648\u0645", price: "1.00", category: "pizza", type: "topping", displayOrder: 8 },
      { name: "salami", nameEn: "salami", nameAr: "\u0633\u0644\u0627\u0645\u064A", price: "1.00", category: "pizza", type: "topping", displayOrder: 9 },
      { name: "pizzasuikale", nameEn: "ham strips", nameAr: "\u0634\u0631\u0627\u0626\u062D \u0644\u062D\u0645", price: "1.00", category: "pizza", type: "topping", displayOrder: 10 },
      { name: "tonnikala", nameEn: "tuna", nameAr: "\u062A\u0648\u0646\u0629", price: "1.00", category: "pizza", type: "topping", displayOrder: 11 },
      { name: "pekoni", nameEn: "bacon", nameAr: "\u0644\u062D\u0645 \u0645\u0642\u062F\u062F", price: "1.00", category: "pizza", type: "topping", displayOrder: 12 },
      { name: "kebabliha", nameEn: "kebab meat", nameAr: "\u0644\u062D\u0645 \u0643\u0628\u0627\u0628", price: "1.00", category: "pizza", type: "topping", displayOrder: 13 },
      { name: "kana", nameEn: "chicken", nameAr: "\u062F\u062C\u0627\u062C", price: "1.00", category: "pizza", type: "topping", displayOrder: 14 },
      { name: "pepperonimakkara", nameEn: "pepperoni", nameAr: "\u0628\u064A\u0628\u064A\u0631\u0648\u0646\u064A", price: "1.00", category: "pizza", type: "topping", displayOrder: 15 },
      { name: "simpukka", nameEn: "mussel", nameAr: "\u0628\u0644\u062D \u0627\u0644\u0628\u062D\u0631", price: "1.00", category: "pizza", type: "topping", displayOrder: 16 },
      { name: "katkarapu", nameEn: "shrimp", nameAr: "\u062C\u0645\u0628\u0631\u064A", price: "1.00", category: "pizza", type: "topping", displayOrder: 17 },
      { name: "aurajuusto", nameEn: "blue cheese", nameAr: "\u062C\u0628\u0646\u0629 \u0632\u0631\u0642\u0627\u0621", price: "1.00", category: "pizza", type: "topping", displayOrder: 18 },
      { name: "tuplajuusto", nameEn: "extra cheese", nameAr: "\u062C\u0628\u0646\u0629 \u0625\u0636\u0627\u0641\u064A\u0629", price: "1.00", category: "pizza", type: "topping", displayOrder: 19 },
      { name: "salaattijuusto", nameEn: "feta cheese", nameAr: "\u062C\u0628\u0646\u0629 \u0641\u064A\u062A\u0627", price: "1.00", category: "pizza", type: "topping", displayOrder: 20 },
      { name: "mozzarellajuusto", nameEn: "mozzarella", nameAr: "\u0645\u0648\u0632\u0627\u0631\u064A\u0644\u0627", price: "1.00", category: "pizza", type: "topping", displayOrder: 21 },
      { name: "smetana", nameEn: "sour cream", nameAr: "\u0643\u0631\u064A\u0645\u0629 \u062D\u0627\u0645\u0636\u0629", price: "1.00", category: "pizza", type: "topping", displayOrder: 22 },
      { name: "BBQ kastike", nameEn: "BBQ sauce", nameAr: "\u0635\u0648\u0635 \u0628\u0627\u0631\u0628\u0643\u064A\u0648", price: "1.00", category: "pizza", type: "topping", displayOrder: 23 },
      { name: "pesto", nameEn: "pesto", nameAr: "\u0628\u064A\u0633\u062A\u0648", price: "1.00", category: "pizza", type: "topping", displayOrder: 24 },
      { name: "curry-mangokastike", nameEn: "curry-mango sauce", nameAr: "\u0635\u0648\u0635 \u0643\u0627\u0631\u064A \u0645\u0627\u0646\u062C\u0648", price: "1.00", category: "pizza", type: "topping", displayOrder: 25 },
      // Pizza Extras
      { name: "Gluteeniton pizzapohja", nameEn: "Gluten-free base", nameAr: "\u0642\u0627\u0639\u062F\u0629 \u062E\u0627\u0644\u064A\u0629 \u0645\u0646 \u0627\u0644\u062C\u0644\u0648\u062A\u064A\u0646", price: "3.00", category: "pizza", type: "extra", displayOrder: 26 },
      { name: "Ruis pizzapohja", nameEn: "Rye pizza base", nameAr: "\u0642\u0627\u0639\u062F\u0629 \u0628\u064A\u062A\u0632\u0627 \u0627\u0644\u062C\u0627\u0648\u062F\u0627\u0631", price: "2.00", category: "pizza", type: "extra", displayOrder: 27 },
      // Pizza Spices (free)
      { name: "Oregano", nameEn: "Oregano", nameAr: "\u0623\u0648\u0631\u064A\u062C\u0627\u0646\u0648", price: "0.00", category: "pizza", type: "spice", displayOrder: 28 },
      { name: "Valkosipuli", nameEn: "Garlic", nameAr: "\u062B\u0648\u0645", price: "0.00", category: "pizza", type: "spice", displayOrder: 29 },
      // Kebab Sauces (required)
      { name: "Mieto", nameEn: "Mild", nameAr: "\u062E\u0641\u064A\u0641", price: "0.00", category: "kebab", type: "sauce", isRequired: true, displayOrder: 1 },
      { name: "Keskivahva", nameEn: "Medium", nameAr: "\u0645\u062A\u0648\u0633\u0637", price: "0.00", category: "kebab", type: "sauce", isRequired: true, displayOrder: 2 },
      { name: "Vahva", nameEn: "Strong", nameAr: "\u0642\u0648\u064A", price: "0.00", category: "kebab", type: "sauce", isRequired: true, displayOrder: 3 },
      { name: "Valkosipulikastike", nameEn: "Garlic sauce", nameAr: "\u0635\u0648\u0635 \u0627\u0644\u062B\u0648\u0645", price: "0.00", category: "kebab", type: "sauce", isRequired: true, displayOrder: 4 },
      { name: "Ei kastiketta", nameEn: "No sauce", nameAr: "\u0628\u062F\u0648\u0646 \u0635\u0648\u0635", price: "0.00", category: "kebab", type: "sauce", isRequired: true, displayOrder: 5 },
      // Kebab Extras
      { name: "Tuplaliha", nameEn: "Double meat", nameAr: "\u0644\u062D\u0645 \u0645\u0636\u0627\u0639\u0641", price: "3.00", category: "kebab", type: "extra", displayOrder: 6 },
      { name: "Aurajuusto", nameEn: "Blue cheese", nameAr: "\u062C\u0628\u0646\u0629 \u0632\u0631\u0642\u0627\u0621", price: "1.00", category: "kebab", type: "extra", displayOrder: 7 },
      { name: "Salaattijuusto", nameEn: "Feta cheese", nameAr: "\u062C\u0628\u0646\u0629 \u0641\u064A\u062A\u0627", price: "1.00", category: "kebab", type: "extra", displayOrder: 8 },
      { name: "Ananas", nameEn: "Pineapple", nameAr: "\u0623\u0646\u0627\u0646\u0627\u0633", price: "1.00", category: "kebab", type: "extra", displayOrder: 9 },
      { name: "Jalapeno", nameEn: "Jalape\xF1o", nameAr: "\u0647\u0627\u0644\u0627\u0628\u064A\u0646\u0648", price: "1.00", category: "kebab", type: "extra", displayOrder: 10 },
      // Chicken Options (same as kebab)
      { name: "Tuplaliha", nameEn: "Double meat", nameAr: "\u0644\u062D\u0645 \u0645\u0636\u0627\u0639\u0641", price: "3.00", category: "chicken", type: "extra", displayOrder: 1 },
      { name: "Aurajuusto", nameEn: "Blue cheese", nameAr: "\u062C\u0628\u0646\u0629 \u0632\u0631\u0642\u0627\u0621", price: "1.00", category: "chicken", type: "extra", displayOrder: 2 },
      { name: "Salaattijuusto", nameEn: "Feta cheese", nameAr: "\u062C\u0628\u0646\u0629 \u0641\u064A\u062A\u0627", price: "1.00", category: "chicken", type: "extra", displayOrder: 3 },
      { name: "Ananas", nameEn: "Pineapple", nameAr: "\u0623\u0646\u0627\u0646\u0627\u0633", price: "1.00", category: "chicken", type: "extra", displayOrder: 4 },
      { name: "Jalapeno", nameEn: "Jalape\xF1o", nameAr: "\u0647\u0627\u0644\u0627\u0628\u064A\u0646\u0648", price: "1.00", category: "chicken", type: "extra", displayOrder: 5 },
      // Wings Sauces (required)
      { name: "Medium", nameEn: "Medium", nameAr: "\u0645\u062A\u0648\u0633\u0637", price: "0.00", category: "wings", type: "sauce", isRequired: true, displayOrder: 1 },
      { name: "Hot", nameEn: "Hot", nameAr: "\u062D\u0627\u0631", price: "0.00", category: "wings", type: "sauce", isRequired: true, displayOrder: 2 },
      { name: "X-hot", nameEn: "X-hot", nameAr: "\u062D\u0627\u0631 \u062C\u062F\u0627\u064B", price: "0.00", category: "wings", type: "sauce", isRequired: true, displayOrder: 3 },
      { name: "XX-hot", nameEn: "XX-hot", nameAr: "\u062D\u0627\u0631 \u0644\u0644\u063A\u0627\u064A\u0629", price: "0.00", category: "wings", type: "sauce", isRequired: true, displayOrder: 4 },
      { name: "ei kastiketta", nameEn: "no sauce", nameAr: "\u0628\u062F\u0648\u0646 \u0635\u0648\u0635", price: "0.00", category: "wings", type: "sauce", isRequired: true, displayOrder: 5 },
      // Burger Size (required)
      { name: "Ateria (Ranskalaiset + 0,33L)", nameEn: "Meal (Fries + 0.33L)", nameAr: "\u0648\u062C\u0628\u0629 (\u0628\u0637\u0627\u0637\u0633 + \u0660.\u0663\u0663\u0644)", price: "0.00", category: "burger", type: "size", isRequired: true, displayOrder: 1 },
      // Burger Drinks (required when meal)
      { name: "Coca Cola 0,33l", nameEn: "Coca Cola 0.33l", nameAr: "\u0643\u0648\u0643\u0627 \u0643\u0648\u0644\u0627 \u0660.\u0663\u0663\u0644", price: "0.00", category: "burger", type: "drink", isRequired: true, displayOrder: 2 },
      { name: "Coca Cola Zero 0,33l", nameEn: "Coca Cola Zero 0.33l", nameAr: "\u0643\u0648\u0643\u0627 \u0643\u0648\u0644\u0627 \u0632\u064A\u0631\u0648 \u0660.\u0663\u0663\u0644", price: "0.00", category: "burger", type: "drink", isRequired: true, displayOrder: 3 },
      { name: "Fanta 0,33l", nameEn: "Fanta 0.33l", nameAr: "\u0641\u0627\u0646\u062A\u0627 \u0660.\u0663\u0663\u0644", price: "0.00", category: "burger", type: "drink", isRequired: true, displayOrder: 4 },
      // Burger Extras
      { name: "aurajuusto", nameEn: "blue cheese", nameAr: "\u062C\u0628\u0646\u0629 \u0632\u0631\u0642\u0627\u0621", price: "1.00", category: "burger", type: "extra", displayOrder: 5 },
      { name: "feta", nameEn: "feta", nameAr: "\u0641\u064A\u062A\u0627", price: "1.00", category: "burger", type: "extra", displayOrder: 6 },
      { name: "ananas", nameEn: "pineapple", nameAr: "\u0623\u0646\u0627\u0646\u0627\u0633", price: "1.00", category: "burger", type: "extra", displayOrder: 7 },
      { name: "jalapeno", nameEn: "jalape\xF1o", nameAr: "\u0647\u0627\u0644\u0627\u0628\u064A\u0646\u0648", price: "1.00", category: "burger", type: "extra", displayOrder: 8 },
      { name: "kananmuna", nameEn: "egg", nameAr: "\u0628\u064A\u0636", price: "1.00", category: "burger", type: "extra", displayOrder: 9 },
      // Drink Sizes (required for drinks)
      { name: "0,33L", nameEn: "0.33L", nameAr: "\u0660.\u0663\u0663\u0644", price: "0.00", category: "drink", type: "size", isRequired: true, displayOrder: 1 },
      { name: "0,5L", nameEn: "0.5L", nameAr: "\u0660.\u0665\u0644", price: "0.60", category: "drink", type: "size", isRequired: true, displayOrder: 2 },
      { name: "1,5L", nameEn: "1.5L", nameAr: "\u0661.\u0665\u0644", price: "2.10", category: "drink", type: "size", isRequired: true, displayOrder: 3 }
    ];
    for (const topping of allToppings) {
      await db.insert(toppings).values(topping);
    }
    console.log("Comprehensive toppings initialized successfully");
  } catch (error) {
    console.error("Error initializing toppings:", error);
  }
}

// server/cloudprnt-server.ts
import { Router } from "express";

// src/lib/printer/star-modern-receipt.ts
var ESC = 27;
var GS = 29;
var LF = 10;
var StarModernReceipt = class _StarModernReceipt {
  cmd = [];
  // Initialize printer with Star Line Mode
  init() {
    this.cmd.push(ESC, 64);
    this.cmd.push(ESC, 30, 97, 0);
  }
  // Encode text with verified Finnish character mapping (0xA0-0xA5)
  encode(text2) {
    const bytes = [];
    for (const char of text2) {
      switch (char) {
        case "\xE4":
          bytes.push(160);
          break;
        case "\xF6":
          bytes.push(161);
          break;
        case "\xE5":
          bytes.push(162);
          break;
        case "\xC4":
          bytes.push(163);
          break;
        case "\xD6":
          bytes.push(164);
          break;
        case "\xC5":
          bytes.push(165);
          break;
        case "\u20AC":
          bytes.push(128);
          break;
        default:
          bytes.push(char.charCodeAt(0));
      }
    }
    return bytes;
  }
  text(str) {
    this.cmd.push(...this.encode(str));
  }
  nl(count = 1) {
    for (let i = 0; i < count; i++) this.cmd.push(LF);
  }
  // ESC i height width - Set character size (Star Line Mode)
  setSize(height, width) {
    this.cmd.push(ESC, 105, height, width);
  }
  // ESC GS a n - Set alignment (0=left, 1=center, 2=right)
  align(n) {
    this.cmd.push(ESC, GS, 97, n);
  }
  // ESC E / ESC F - Set bold emphasis
  bold(on) {
    this.cmd.push(ESC, on ? 69 : 70);
  }
  // Generate QR code using Star Method 3 (VERIFIED WORKING)
  qrCodeBig(url) {
    const urlBytes = this.encode(url);
    const len = urlBytes.length;
    this.cmd.push(ESC, 29, 121, 83);
    this.cmd.push(48);
    this.cmd.push(2);
    this.cmd.push(ESC, 29, 121, 83);
    this.cmd.push(49);
    this.cmd.push(10);
    this.cmd.push(ESC, 29, 121, 83);
    this.cmd.push(50);
    this.cmd.push(49);
    this.cmd.push(ESC, 29, 121, 68);
    this.cmd.push(49);
    this.cmd.push(0);
    this.cmd.push(len % 256, Math.floor(len / 256));
    this.cmd.push(...urlBytes);
    this.cmd.push(ESC, 29, 121, 80);
  }
  // ESC d n - Feed and cut
  cut() {
    this.cmd.push(ESC, 100, 2);
  }
  /**
   * Generate complete modern receipt
   */
  static generate(data, originalOrder) {
    const r = new _StarModernReceipt();
    r.init();
    r.align(1);
    r.nl();
    r.setSize(1, 1);
    r.text("BABYLON RAVINTOLA");
    r.nl();
    r.text(data.restaurantAddress || "Vapaudenkatu 28, 15140 Lahti");
    r.nl();
    r.text(data.restaurantPhone || "Puh: +358-3-781-2222");
    r.nl();
    r.text("====================");
    r.nl();
    r.setSize(1, 1);
    r.text(`#${data.orderNumber}`);
    r.nl();
    const date = data.timestamp.toLocaleDateString("fi-FI");
    const time = data.timestamp.toLocaleTimeString("fi-FI", {
      hour: "2-digit",
      minute: "2-digit"
    });
    r.text(`${date} klo ${time}`);
    r.nl();
    const orderType = data.orderType === "delivery" ? "KOTIINKULJETUS" : "NOUTO";
    r.text(orderType);
    r.nl();
    const paymentMethod = originalOrder?.payment_method || originalOrder?.paymentMethod || data.paymentMethod;
    if (paymentMethod) {
      r.text(`Maksutapa: ${paymentMethod}`);
      r.nl();
    }
    r.text("====================");
    r.nl();
    if (data.customerName || data.customerPhone || data.deliveryAddress) {
      r.align(0);
      if (data.customerName) {
        r.text("Nimi: ");
        r.bold(true);
        r.text(data.customerName);
        r.bold(false);
        r.nl();
      }
      if (data.customerPhone) {
        r.text("Puh: ");
        r.bold(true);
        r.text(data.customerPhone);
        r.bold(false);
        r.nl();
      }
      if (data.deliveryAddress) {
        r.text("Osoite:");
        r.nl();
        r.bold(true);
        data.deliveryAddress.split("\n").forEach((line) => {
          r.text("  " + line.trim());
          r.nl();
        });
        r.bold(false);
      }
      r.nl();
      r.align(1);
      r.text("====================");
      r.nl();
    }
    r.align(0);
    r.nl();
    for (const item of data.items) {
      r.bold(true);
      r.setSize(1, 1);
      r.text(`${item.quantity}x ${item.name}`);
      r.nl();
      r.bold(false);
      r.align(2);
      r.text(`${item.totalPrice.toFixed(2)}\u20AC`);
      r.nl();
      r.align(0);
      if (item.toppings && item.toppings.length > 0) {
        r.text("  Lisatteet:");
        r.nl();
        item.toppings.forEach((topping) => {
          r.text(`    + ${topping.name}`);
          if (topping.price > 0) {
            r.align(2);
            r.text(`+${topping.price.toFixed(2)}\u20AC`);
            r.align(0);
          }
          r.nl();
        });
      }
      if (item.notes) {
        const cleanNotes = item.notes.split(";").filter((p) => !p.toLowerCase().includes("size:") && !p.toLowerCase().includes("toppings:")).map((p) => p.trim()).filter((p) => p.length > 0).join("; ");
        if (cleanNotes) {
          r.text("  Huom: " + cleanNotes);
          r.nl();
        }
      }
      r.text("- - - - - - - - -");
      r.nl();
    }
    if (originalOrder?.specialInstructions || originalOrder?.special_instructions) {
      const instructions = originalOrder.specialInstructions || originalOrder.special_instructions;
      r.nl();
      r.align(1);
      r.text("====================");
      r.nl();
      r.align(0);
      const words = instructions.split(" ");
      let line = "";
      for (const word of words) {
        if ((line + " " + word).length > 32) {
          if (line) {
            r.text(line);
            r.nl();
          }
          line = word;
        } else {
          line = line ? line + " " + word : word;
        }
      }
      if (line) {
        r.text(line);
        r.nl();
      }
      r.align(1);
    }
    r.nl();
    r.align(1);
    r.text("====================");
    r.nl();
    r.align(0);
    r.setSize(1, 1);
    if (originalOrder?.subtotal) {
      r.bold(true);
      r.text("Valisumma:");
      r.bold(false);
      r.align(2);
      r.text(`${parseFloat(originalOrder.subtotal).toFixed(2)}\u20AC`);
      r.nl();
      r.align(0);
    }
    if (originalOrder?.deliveryFee && parseFloat(originalOrder.deliveryFee) > 0) {
      r.bold(true);
      r.text("Toimitus:");
      r.bold(false);
      r.align(2);
      r.text(`${parseFloat(originalOrder.deliveryFee).toFixed(2)}\u20AC`);
      r.nl();
      r.align(0);
    }
    if (originalOrder?.smallOrderFee && parseFloat(originalOrder.smallOrderFee) > 0) {
      r.bold(true);
      r.text("Pientilaus:");
      r.bold(false);
      r.align(2);
      r.text(`${parseFloat(originalOrder.smallOrderFee).toFixed(2)}\u20AC`);
      r.nl();
      r.align(0);
    }
    if (originalOrder?.discount && parseFloat(originalOrder.discount) > 0) {
      r.bold(true);
      r.text("Alennus:");
      r.bold(false);
      r.align(2);
      r.text(`-${parseFloat(originalOrder.discount).toFixed(2)}\u20AC`);
      r.nl();
      r.align(0);
    }
    r.nl();
    r.align(0);
    r.bold(true);
    r.setSize(2, 2);
    r.text("YHTEENSA:");
    r.nl();
    r.align(2);
    r.text(`${data.total.toFixed(2)}\u20AC`);
    r.nl();
    r.bold(false);
    r.setSize(1, 1);
    r.nl();
    r.align(1);
    r.text("====================");
    r.nl();
    r.text("Kiitos tilauksestasi!");
    r.nl();
    r.text("Tervetuloa uudelleen!");
    r.nl();
    r.qrCodeBig("https://ravintolababylon.fi");
    r.nl(2);
    r.text("ravintolababylon.fi");
    r.nl(3);
    r.cut();
    return new Uint8Array(r.cmd);
  }
};

// src/lib/printer/types.ts
var ESC_POS = {
  INIT: [27, 64],
  // ESC @ - Initialize printer
  SET_CODEPAGE_CP850: [27, 116, 2],
  // ESC t 2 - Set CP850 code page for European characters
  ALIGN_LEFT: [27, 97, 0],
  // ESC a 0
  ALIGN_CENTER: [27, 97, 1],
  // ESC a 1  
  ALIGN_RIGHT: [27, 97, 2],
  // ESC a 2
  BOLD_ON: [27, 69, 1],
  // ESC E 1
  BOLD_OFF: [27, 69, 0],
  // ESC E 0
  UNDERLINE_ON: [27, 45, 1],
  // ESC - 1
  UNDERLINE_OFF: [27, 45, 0],
  // ESC - 0
  SIZE_NORMAL: [29, 33, 0],
  // GS ! 0
  SIZE_DOUBLE_HEIGHT: [29, 33, 1],
  // GS ! 1
  SIZE_DOUBLE_WIDTH: [29, 33, 16],
  // GS ! 16
  SIZE_DOUBLE_BOTH: [29, 33, 17],
  // GS ! 17
  CUT_PAPER: [29, 86, 1],
  // GS V 1 - Partial cut
  CUT_PAPER_FULL: [29, 86, 0],
  // GS V 0 - Full cut
  FEED_LINE: [10],
  // LF
  FEED_LINES: (lines) => [27, 100, lines]
  // ESC d n
};

// src/lib/printer/escpos-formatter.ts
function translatePaymentMethod(method) {
  const methodLower = method.toLowerCase();
  const translations = {
    "card": "Kortti",
    "credit card": "Kortti",
    "debit card": "Kortti",
    "cash": "Kateinen",
    "k\xE4teinen": "K\xE4teinen",
    "kortti": "Kortti",
    "stripe": "Kortti",
    "online": "Verkkomaksu",
    "cash_or_card": "Kateinen tai kortti",
    "cash or card": "Kateinen tai kortti"
  };
  return translations[methodLower] || method;
}
var ESCPOSFormatter = class _ESCPOSFormatter {
  commands = [];
  fontSettings;
  constructor(fontSettings) {
    this.fontSettings = {
      restaurantName: { width: 3, height: 3 },
      header: { width: 2, height: 2 },
      orderNumber: { width: 3, height: 3 },
      menuItems: { width: 2, height: 2 },
      toppings: { width: 2, height: 2 },
      totals: { width: 2, height: 2 },
      finalTotal: { width: 4, height: 4 },
      characterSpacing: 0,
      ...fontSettings
    };
    this.init();
  }
  /**
   * Initialize printer with standard settings
   */
  init() {
    this.commands.push(...ESC_POS.INIT);
    this.commands.push(...ESC_POS.SET_CODEPAGE_CP850);
    this.commands.push(...ESC_POS.ALIGN_LEFT);
    this.commands.push(...ESC_POS.SIZE_NORMAL);
    return this;
  }
  /**
   * Set text alignment
   */
  align(alignment) {
    switch (alignment) {
      case "left":
        this.commands.push(...ESC_POS.ALIGN_LEFT);
        break;
      case "center":
        this.commands.push(...ESC_POS.ALIGN_CENTER);
        break;
      case "right":
        this.commands.push(...ESC_POS.ALIGN_RIGHT);
        break;
    }
    return this;
  }
  /**
   * Set text size
   */
  size(size) {
    switch (size) {
      case "normal":
        this.commands.push(...ESC_POS.SIZE_NORMAL);
        break;
      case "large":
        this.commands.push(...ESC_POS.SIZE_DOUBLE_BOTH);
        break;
      case "double":
        this.commands.push(...ESC_POS.SIZE_DOUBLE_BOTH);
        break;
      case "small":
        this.commands.push(...ESC_POS.SIZE_NORMAL);
        break;
    }
    return this;
  }
  /**
   * Set custom text size with width and height multipliers (1-8)
   */
  customSize(width, height) {
    const w = Math.max(1, Math.min(8, width)) - 1;
    const h = Math.max(1, Math.min(8, height)) - 1;
    const sizeCommand = w << 4 | h;
    this.commands.push(29, 33, sizeCommand);
    return this;
  }
  /**
   * Set bold text
   */
  bold(enabled = true) {
    if (enabled) {
      this.commands.push(...ESC_POS.BOLD_ON);
    } else {
      this.commands.push(...ESC_POS.BOLD_OFF);
    }
    return this;
  }
  /**
   * Set underline text
   */
  underline(enabled = true) {
    if (enabled) {
      this.commands.push(...ESC_POS.UNDERLINE_ON);
    } else {
      this.commands.push(...ESC_POS.UNDERLINE_OFF);
    }
    return this;
  }
  /**
   * Add text with proper encoding for thermal printers
   */
  text(content) {
    const bytes = this.encodeForThermalPrinter(content);
    this.commands.push(...bytes);
    return this;
  }
  /**
   * Encode text for thermal printer with proper character mapping for Finnish characters
   */
  encodeForThermalPrinter(text2) {
    const bytes = [];
    for (let i = 0; i < text2.length; i++) {
      const char = text2.charAt(i);
      const code = text2.charCodeAt(i);
      switch (char) {
        // Euro symbol - remove completely to avoid display issues
        case "\u20AC":
          break;
        // Finnish characters
        case "\xE4":
          bytes.push(132);
          break;
        case "\xC4":
          bytes.push(142);
          break;
        case "\xF6":
          bytes.push(148);
          break;
        case "\xD6":
          bytes.push(153);
          break;
        case "\xE5":
          bytes.push(134);
          break;
        case "\xC5":
          bytes.push(143);
          break;
        // Bullet point for toppings
        case "\u2022":
          bytes.push(7);
          break;
        // Standard ASCII characters (0-127)
        default:
          if (code < 128) {
            bytes.push(code);
          } else {
            bytes.push(63);
          }
          break;
      }
    }
    return bytes;
  }
  /**
   * Add a line of text with newline
   */
  line(content = "") {
    this.text(content);
    this.commands.push(...ESC_POS.FEED_LINE);
    return this;
  }
  /**
   * Add a newline
   */
  newLine() {
    this.commands.push(...ESC_POS.FEED_LINE);
    return this;
  }
  /**
   * Add multiple empty lines
   */
  lines(count) {
    for (let i = 0; i < count; i++) {
      this.commands.push(...ESC_POS.FEED_LINE);
    }
    return this;
  }
  /**
   * Add a separator line
   */
  separator(char = "-", width = 48) {
    const separatorLine = char.repeat(width);
    this.line(separatorLine);
    return this;
  }
  /**
   * Format two-column text (item and price)
   */
  columns(left, right, width = 32) {
    const rightLen = right.length;
    const leftLen = Math.max(0, width - rightLen);
    const leftText = left.length > leftLen ? left.substring(0, leftLen - 3) + "..." : left;
    const padding = " ".repeat(Math.max(0, width - leftText.length - rightLen));
    this.line(leftText + padding + right);
    return this;
  }
  /**
   * Cut paper
   */
  cut(full = false) {
    if (full) {
      this.commands.push(...ESC_POS.CUT_PAPER_FULL);
    } else {
      this.commands.push(...ESC_POS.CUT_PAPER);
    }
    return this;
  }
  /**
   * Format a complete receipt - TEXT ONLY VERSION (no async logo/QR)
   */
  static formatReceipt(receiptData, originalOrder, fontSettings) {
    const formatter = new _ESCPOSFormatter(fontSettings);
    try {
      formatter.align("center").bold(true).customSize(formatter.fontSettings.restaurantName.width, formatter.fontSettings.restaurantName.height).text("RAVINTOLA BABYLON").newLine().customSize(formatter.fontSettings.header.width, formatter.fontSettings.header.height).text("Vapaudenkatu 28, 15140 Lahti").newLine().text("+358-3781-2222").newLine().bold(false).lines(1);
      formatter.align("center").text("================================".substring(0, 32)).newLine().lines(1);
      formatter.align("center").bold(true).customSize(formatter.fontSettings.orderNumber.width, formatter.fontSettings.orderNumber.height).text(`TILAUS #${receiptData.orderNumber}`).newLine().customSize(1, 1).bold(false).lines(1);
      formatter.align("center").customSize(formatter.fontSettings.header.width, formatter.fontSettings.header.height).text(`${receiptData.timestamp.toLocaleDateString("fi-FI")} ${receiptData.timestamp.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })}`).customSize(1, 1).newLine().lines(1);
      formatter.align("center").text("--------------------------------".substring(0, 32)).newLine().lines(1);
      const orderTypeText = receiptData.orderType === "delivery" ? "KOTIINKULJETUS" : "NOUTO";
      formatter.align("center").bold(true).text(orderTypeText).newLine().bold(false).lines(1);
      if (receiptData.paymentMethod) {
        const translatedPayment = translatePaymentMethod(receiptData.paymentMethod);
        formatter.align("center").customSize(formatter.fontSettings.header.width, formatter.fontSettings.header.height).text(`Maksutapa: ${translatedPayment}`).newLine().customSize(1, 1).lines(1);
      }
      formatter.align("center").text("================================").newLine().lines(1);
      if (receiptData.customerName || receiptData.customerPhone || receiptData.customerEmail || receiptData.deliveryAddress) {
        formatter.align("center").bold(true).underline(true).line("ASIAKASTIEDOT").underline(false).bold(false).lines(1);
        formatter.align("left").text("--------------------------------").newLine().lines(1);
        if (receiptData.customerName) {
          formatter.align("left").bold(true).customSize(formatter.fontSettings.header.width, formatter.fontSettings.header.height).text("Nimi: ").bold(false).text(receiptData.customerName).newLine().customSize(1, 1).lines(1);
        }
        if (receiptData.customerPhone) {
          formatter.align("left").bold(true).customSize(formatter.fontSettings.header.width, formatter.fontSettings.header.height).text("Puh: ").bold(false).text(receiptData.customerPhone).newLine().customSize(1, 1).lines(1);
        }
        if (receiptData.customerEmail) {
          formatter.align("left").bold(true).text("Email: ").bold(false);
          const emailLine = receiptData.customerEmail;
          if (emailLine.length > 38) {
            formatter.line(emailLine.substring(0, 38));
            formatter.text("        " + emailLine.substring(38)).newLine();
          } else {
            formatter.text(emailLine).newLine();
          }
          formatter.lines(1);
        }
        if (receiptData.deliveryAddress) {
          formatter.align("left").bold(true).customSize(formatter.fontSettings.header.width, formatter.fontSettings.header.height).text("Osoite:").newLine().bold(false).lines(1);
          const addressLines = receiptData.deliveryAddress.split("\n");
          addressLines.forEach((line) => {
            formatter.text("  ").text(line.trim()).newLine();
          });
          formatter.customSize(1, 1).lines(1);
        }
        formatter.align("left").text("--------------------------------".substring(0, 32)).newLine().lines(1);
      }
      formatter.align("center").text("================================".substring(0, 32)).newLine().bold(true).underline(true).text("TUOTTEET").newLine().underline(false).bold(false).text("================================".substring(0, 32)).newLine().lines(1);
      formatter.align("left");
      console.log(`\u{1F5A8}\uFE0F [ESC/POS] Formatting ${receiptData.items.length} items`);
      for (const item of receiptData.items) {
        console.log(`\u{1F5A8}\uFE0F [ESC/POS] Processing item: "${item.name}"`);
        let displayName = item.name;
        let itemSize = "normal";
        const sizeInNameMatch = item.name.match(/^(.+?)\s*\(([^)]+)\)$/);
        if (sizeInNameMatch) {
          displayName = sizeInNameMatch[1].trim();
          itemSize = sizeInNameMatch[2].trim();
        } else if (item.notes) {
          const sizeMatch = item.notes.match(/Size:\s*([^;]+)/i);
          if (sizeMatch) {
            itemSize = sizeMatch[1].trim();
            if (itemSize && itemSize !== "normal" && itemSize !== "regular") {
              displayName = `${displayName} (${itemSize})`;
            }
          }
        } else if (originalOrder) {
          const originalItems = originalOrder.orderItems || originalOrder.order_items || originalOrder.items || [];
          const matchingOriginalItem = originalItems.find(
            (oi) => (oi.menuItems?.name || oi.menu_items?.name || oi.name) === item.name.replace(/\s*\([^)]+\)$/, "")
          );
          if (matchingOriginalItem) {
            const specialInstructions = matchingOriginalItem.specialInstructions || matchingOriginalItem.special_instructions || "";
            const sizeMatch = specialInstructions.match(/Size:\s*([^;]+)/i);
            if (sizeMatch) {
              itemSize = sizeMatch[1].trim();
              if (itemSize && itemSize !== "normal" && itemSize !== "regular") {
                displayName = `${displayName} (${itemSize})`;
              }
            }
          }
        }
        const itemName = `${item.quantity}x ${displayName}`;
        const itemPrice = `${item.totalPrice.toFixed(2)}e`;
        formatter.bold(true).customSize(formatter.fontSettings.menuItems.width, formatter.fontSettings.menuItems.height).columns(itemName, itemPrice, 32).customSize(1, 1).bold(false).lines(1);
        if (item.toppings && item.toppings.length > 0) {
          const originalItems = originalOrder ? originalOrder.orderItems || originalOrder.order_items || originalOrder.items || [] : [];
          const matchingOriginalItem = originalItems.find(
            (oi) => (oi.menuItems?.name || oi.menu_items?.name || oi.name) === item.name.replace(/\s*\([^)]+\)$/, "")
          );
          const menuItemData = matchingOriginalItem ? matchingOriginalItem.menuItems || matchingOriginalItem.menu_items || matchingOriginalItem.menuItem || {} : {};
          const hasConditionalPricing = menuItemData.hasConditionalPricing || menuItemData.has_conditional_pricing || false;
          const includedToppingsCount = menuItemData.includedToppingsCount || menuItemData.included_toppings_count || 0;
          const isYourChoicePizza = matchingOriginalItem && (matchingOriginalItem.menuItemId === 93 || matchingOriginalItem.menu_item_id === 93 || matchingOriginalItem.menuItems?.id === 93 || matchingOriginalItem.menu_items?.id === 93);
          const freeToppingCount = hasConditionalPricing ? includedToppingsCount : isYourChoicePizza ? 4 : 0;
          let freeCount = 0;
          formatter.customSize(formatter.fontSettings.toppings.width, formatter.fontSettings.toppings.height).text("  Lisat\xE4ytteet:").newLine().customSize(1, 1).lines(1);
          for (let i = 0; i < item.toppings.length; i++) {
            const topping = item.toppings[i];
            let adjustedPrice = topping.price;
            if (freeToppingCount > 0 && topping.price > 0 && freeCount < freeToppingCount) {
              adjustedPrice = 0;
              freeCount++;
            } else {
              if (itemSize === "perhe" || itemSize === "family") {
                adjustedPrice = topping.price * 2;
              } else if ((itemSize === "large" || itemSize === "iso") && Math.abs(topping.price - 1) < 0.01) {
                adjustedPrice = 2;
              }
            }
            const toppingLine = `    + ${topping.name}`;
            let toppingPrice = "";
            if (freeToppingCount > 0 && topping.price > 0 && freeCount <= freeToppingCount && adjustedPrice === 0) {
              toppingPrice = "ILMAINEN";
            } else if (adjustedPrice > 0) {
              toppingPrice = `+${adjustedPrice.toFixed(2)}e`;
            }
            if (toppingPrice) {
              formatter.customSize(formatter.fontSettings.toppings.width, formatter.fontSettings.toppings.height).columns(toppingLine, toppingPrice, 32).customSize(1, 1);
            } else {
              formatter.customSize(formatter.fontSettings.toppings.width, formatter.fontSettings.toppings.height).text(toppingLine).newLine().customSize(1, 1);
            }
          }
          formatter.lines(1);
        }
        if (item.notes) {
          const cleanedNotes = item.notes.split(";").filter((part) => !part.trim().toLowerCase().startsWith("size:")).filter((part) => !part.trim().toLowerCase().startsWith("toppings:")).map((part) => part.trim()).filter((part) => part.length > 0).join("; ");
          if (cleanedNotes) {
            formatter.text("  Huom: ").text(cleanedNotes).newLine().lines(1);
          }
        }
        formatter.text("- - - - - - - - - - - - - - - -".substring(0, 32)).newLine().lines(1);
      }
      if (originalOrder?.specialInstructions || originalOrder?.special_instructions) {
        const instructions = originalOrder.specialInstructions || originalOrder.special_instructions;
        formatter.newLine().align("center").bold(true).size("large").line("ERIKOISOHJEET").bold(false).size("large").newLine().align("left");
        const words = instructions.split(" ");
        let currentLine = "";
        words.forEach((word) => {
          if ((currentLine + " " + word).length > 46) {
            if (currentLine) {
              formatter.bold(true).text("  " + currentLine).newLine().bold(false);
              currentLine = word;
            } else {
              formatter.bold(true).text("  " + word.substring(0, 46)).newLine().bold(false);
            }
          } else {
            currentLine = currentLine ? currentLine + " " + word : word;
          }
        });
        if (currentLine) {
          formatter.bold(true).text("  " + currentLine).newLine().bold(false);
        }
        formatter.newLine();
      }
      formatter.newLine().text("================================").newLine().align("center").bold(true).underline(true).line("YHTEENVETO").underline(false).bold(false).text("================================").newLine().lines(1).align("left");
      if (originalOrder) {
        if (originalOrder.subtotal) {
          formatter.customSize(formatter.fontSettings.totals.width, formatter.fontSettings.totals.height).columns("V\xE4lisumma:", `${parseFloat(originalOrder.subtotal).toFixed(2)}e`).customSize(1, 1);
        }
        if (originalOrder.deliveryFee && parseFloat(originalOrder.deliveryFee) > 0) {
          formatter.customSize(formatter.fontSettings.totals.width, formatter.fontSettings.totals.height).columns("Toimitusmaksu:", `${parseFloat(originalOrder.deliveryFee).toFixed(2)}e`).customSize(1, 1);
        }
        if (originalOrder.smallOrderFee && parseFloat(originalOrder.smallOrderFee) > 0) {
          formatter.customSize(formatter.fontSettings.totals.width, formatter.fontSettings.totals.height).columns("Pientilauslis\xE4:", `${parseFloat(originalOrder.smallOrderFee).toFixed(2)}e`).customSize(1, 1);
        }
        if (originalOrder.discount && parseFloat(originalOrder.discount) > 0) {
          formatter.customSize(formatter.fontSettings.totals.width, formatter.fontSettings.totals.height).columns("Alennus:", `-${parseFloat(originalOrder.discount).toFixed(2)}e`).customSize(1, 1);
        }
      }
      formatter.newLine().text("================================").newLine().align("center").bold(true).customSize(formatter.fontSettings.finalTotal.width, formatter.fontSettings.finalTotal.height).text(`YHTEENSA: ${receiptData.total.toFixed(2)}e`).newLine().bold(false).customSize(1, 1).text("================================").newLine().newLine();
      formatter.align("center").bold(true).text("Vieraile verkkosivuillamme:").newLine().size("large").text("ravintolababylon.fi").newLine().size("normal").bold(false).lines(2);
      formatter.align("center").bold(true).text("================================").newLine().size("large").text("Kiitos tilauksestasi!").newLine().size("normal").text("Tervetuloa uudelleen!").newLine().bold(false).text("================================").newLine().lines(3);
      formatter.cut();
      return new Uint8Array(formatter.commands);
    } catch (error) {
      console.error("Error formatting receipt:", error);
      return _ESCPOSFormatter.formatBasicReceipt(receiptData, originalOrder);
    }
  }
  /**
   * Fallback basic receipt format (original design)
   */
  static formatBasicReceipt(receiptData, originalOrder) {
    const formatter = new _ESCPOSFormatter();
    formatter.align("center").size("double").bold(true).underline(true).line("Ravintola Babylon").underline(false).bold(false).size("normal").lines(1).separator("=", 48).lines(1);
    formatter.align("left").bold(true).size("large").line(`TILAUS #: ${receiptData.orderNumber}`).size("normal").bold(false).line(`${receiptData.timestamp.toLocaleDateString("fi-FI")} ${receiptData.timestamp.toLocaleTimeString("fi-FI")}`).lines(1).separator("=", 48).lines(1);
    if (receiptData.customerName || receiptData.customerPhone || receiptData.customerEmail) {
      formatter.bold(true).size("large").underline(true).line("ASIAKASTIEDOT").underline(false).bold(false).size("normal").separator("-", 48).lines(1);
      if (receiptData.customerName) {
        formatter.bold(true).line(`Nimi: ${receiptData.customerName}`).bold(false);
      }
      if (receiptData.customerPhone) {
        formatter.bold(true).line(`Puh: ${receiptData.customerPhone}`).bold(false);
      }
      if (receiptData.customerEmail) {
        const emailLine = `Email: ${receiptData.customerEmail}`;
        if (emailLine.length > 48) {
          formatter.bold(true).line(emailLine.substring(0, 48)).bold(false);
          formatter.line(emailLine.substring(48));
        } else {
          formatter.bold(true).line(emailLine).bold(false);
        }
      }
      if (receiptData.deliveryAddress) {
        formatter.bold(true).size("double").line(`Osoite:`).size("normal").bold(false);
        const addressLines = receiptData.deliveryAddress.split("\n");
        addressLines.forEach((line) => {
          formatter.bold(true).size("double").line(line.trim()).size("normal").bold(false);
        });
      }
      formatter.lines(1).separator("-", 48).lines(1);
    }
    const orderTypeText = receiptData.orderType === "delivery" ? "KOTIINKULJETUS" : "NOUTO";
    formatter.bold(true).size("large").line(`Tyyppi: ${orderTypeText}`).bold(false).size("normal");
    if (receiptData.paymentMethod) {
      formatter.bold(true).size("large").line(`Maksutapa: ${receiptData.paymentMethod.toUpperCase()}`).bold(false).size("normal");
      if (receiptData.paymentStatus) {
        formatter.line(`Maksun tila: ${receiptData.paymentStatus}`);
      }
    }
    if (receiptData.tableNumber) {
      formatter.bold(true).line(`P\xF6yt\xE4: ${receiptData.tableNumber}`).bold(false);
    }
    formatter.lines(2);
    formatter.separator("=", 48).align("center").bold(true).size("double").underline(true).line("TUOTTEET").underline(false).bold(false).size("normal").separator("=", 48).align("left").lines(1);
    console.log(`\u{1F5A8}\uFE0F [ESC/POS] Formatting ${receiptData.items.length} items`);
    for (const item of receiptData.items) {
      console.log(`\u{1F5A8}\uFE0F [ESC/POS] Processing item: "${item.name}"`);
      let displayName = item.name;
      let itemSize = "normal";
      const sizeInNameMatch = item.name.match(/^(.+?)\s*\(([^)]+)\)$/);
      if (sizeInNameMatch) {
        displayName = sizeInNameMatch[1].trim();
        itemSize = sizeInNameMatch[2].trim();
      } else if (item.notes) {
        const sizeMatch = item.notes.match(/Size:\s*([^;]+)/i);
        if (sizeMatch) {
          itemSize = sizeMatch[1].trim();
          if (itemSize && itemSize !== "normal" && itemSize !== "regular") {
            displayName = `${displayName} (${itemSize})`;
          }
        }
      } else if (originalOrder) {
        const originalItems = originalOrder.orderItems || originalOrder.order_items || originalOrder.items || [];
        const matchingOriginalItem = originalItems.find(
          (oi) => (oi.menuItems?.name || oi.menu_items?.name || oi.name) === item.name.replace(/\s*\([^)]+\)$/, "")
        );
        if (matchingOriginalItem) {
          const specialInstructions = matchingOriginalItem.specialInstructions || matchingOriginalItem.special_instructions || "";
          const sizeMatch = specialInstructions.match(/Size:\s*([^;]+)/i);
          if (sizeMatch) {
            itemSize = sizeMatch[1].trim();
            if (itemSize && itemSize !== "normal" && itemSize !== "regular") {
              displayName = `${displayName} (${itemSize})`;
            }
          }
        }
      }
      formatter.separator("-", 48);
      formatter.bold(true).size("double").columns(
        `${item.quantity}x ${displayName}`,
        `${item.totalPrice.toFixed(2)}`
      ).bold(false).size("normal");
      if (item.toppings && item.toppings.length > 0) {
        formatter.lines(1).bold(true).size("large").line("  Lis\xE4t\xE4ytteet:").bold(false).size("normal");
        const originalItems = originalOrder ? originalOrder.orderItems || originalOrder.order_items || originalOrder.items || [] : [];
        const matchingOriginalItem = originalItems.find(
          (oi) => (oi.menuItems?.name || oi.menu_items?.name || oi.name) === item.name.replace(/\s*\([^)]+\)$/, "")
        );
        const menuItemData = matchingOriginalItem ? matchingOriginalItem.menuItems || matchingOriginalItem.menu_items || matchingOriginalItem.menuItem || {} : {};
        const hasConditionalPricing = menuItemData.hasConditionalPricing || menuItemData.has_conditional_pricing || false;
        const includedToppingsCount = menuItemData.includedToppingsCount || menuItemData.included_toppings_count || 0;
        const isYourChoicePizza = matchingOriginalItem && (matchingOriginalItem.menuItemId === 93 || matchingOriginalItem.menu_item_id === 93 || matchingOriginalItem.menuItems?.id === 93 || matchingOriginalItem.menu_items?.id === 93);
        const freeToppingCount = hasConditionalPricing ? includedToppingsCount : isYourChoicePizza ? 4 : 0;
        let freeCount = 0;
        for (let i = 0; i < item.toppings.length; i++) {
          const topping = item.toppings[i];
          let adjustedPrice = topping.price;
          if (freeToppingCount > 0 && topping.price > 0 && freeCount < freeToppingCount) {
            adjustedPrice = 0;
            freeCount++;
          } else {
            if (itemSize === "perhe" || itemSize === "family") {
              adjustedPrice = topping.price * 2;
            } else if ((itemSize === "large" || itemSize === "iso") && Math.abs(topping.price - 1) < 0.01) {
              adjustedPrice = 2;
            }
          }
          const toppingLine = `    + ${topping.name}`;
          let toppingPrice = "";
          if (freeToppingCount > 0 && topping.price > 0 && freeCount <= freeToppingCount && adjustedPrice === 0) {
            toppingPrice = "ILMAINEN";
          } else if (adjustedPrice > 0) {
            toppingPrice = `+${adjustedPrice.toFixed(2)}`;
          }
          if (toppingPrice) {
            formatter.bold(true).columns(toppingLine, toppingPrice).bold(false);
          } else {
            formatter.line(toppingLine);
          }
        }
      }
      if (item.notes) {
        const cleanedNotes = item.notes.split(";").filter((part) => !part.trim().toLowerCase().startsWith("size:")).filter((part) => !part.trim().toLowerCase().startsWith("toppings:")).map((part) => part.trim()).filter((part) => part.length > 0).join("; ");
        if (cleanedNotes) {
          formatter.lines(1).bold(true).line(`  Huom: ${cleanedNotes}`).bold(false);
        }
      }
      formatter.lines(1);
    }
    if (originalOrder?.specialInstructions || originalOrder?.special_instructions) {
      const instructions = originalOrder.specialInstructions || originalOrder.special_instructions;
      formatter.lines(1).separator("=", 48).bold(true).size("large").underline(true).line("TILAUKSEN ERIKOISOHJEET").underline(false).bold(false).size("normal").separator("-", 48).lines(1);
      const words = instructions.split(" ");
      let currentLine = "";
      words.forEach((word) => {
        if ((currentLine + " " + word).length > 48) {
          if (currentLine) {
            formatter.bold(true).line(currentLine).bold(false);
            currentLine = word;
          } else {
            formatter.bold(true).line(word.substring(0, 48)).bold(false);
          }
        } else {
          currentLine = currentLine ? currentLine + " " + word : word;
        }
      });
      if (currentLine) {
        formatter.bold(true).line(currentLine).bold(false);
      }
      formatter.lines(1).separator("-", 48).lines(1);
    }
    formatter.lines(1);
    if (originalOrder) {
      formatter.separator("=", 48).align("center").bold(true).size("double").underline(true).line("YHTEENVETO").underline(false).bold(false).size("normal").separator("=", 48).align("left").lines(1);
      if (originalOrder.subtotal) {
        formatter.bold(true).customSize(formatter.fontSettings.totals.width, formatter.fontSettings.totals.height).columns("V\xE4lisumma:", `${parseFloat(originalOrder.subtotal).toFixed(2)}`).bold(false).customSize(1, 1);
      }
      if (originalOrder.deliveryFee && parseFloat(originalOrder.deliveryFee) > 0) {
        formatter.bold(true).customSize(formatter.fontSettings.totals.width, formatter.fontSettings.totals.height).columns("Toimitusmaksu:", `${parseFloat(originalOrder.deliveryFee).toFixed(2)}`).bold(false).customSize(1, 1);
      }
      if (originalOrder.smallOrderFee && parseFloat(originalOrder.smallOrderFee) > 0) {
        formatter.bold(true).customSize(formatter.fontSettings.totals.width, formatter.fontSettings.totals.height).columns("Pientilauslisa:", `${parseFloat(originalOrder.smallOrderFee).toFixed(2)}`).bold(false).customSize(1, 1);
      }
      if (originalOrder.discount && parseFloat(originalOrder.discount) > 0) {
        formatter.bold(true).customSize(formatter.fontSettings.totals.width, formatter.fontSettings.totals.height).columns("Alennus:", `-${parseFloat(originalOrder.discount).toFixed(2)}`).bold(false).customSize(1, 1);
      }
      formatter.lines(1);
      formatter.separator("=", 48);
      formatter.bold(true).customSize(formatter.fontSettings.finalTotal.width, formatter.fontSettings.finalTotal.height).columns("YHTEENS\xC4:", `${receiptData.total.toFixed(2)}`).bold(false).customSize(1, 1);
      formatter.separator("=", 48);
    } else {
      formatter.separator("=", 48);
      formatter.bold(true).customSize(formatter.fontSettings.finalTotal.width, formatter.fontSettings.finalTotal.height).columns("YHTEENS\xC4:", `${receiptData.total.toFixed(2)}`).bold(false).customSize(1, 1);
      formatter.separator("=", 48);
    }
    formatter.lines(2).separator("=", 48).align("center").bold(true).size("large").line("Kiitos tilauksestasi!").line("Tervetuloa uudelleen!").bold(false).size("normal").separator("=", 48).lines(2);
    formatter.lines(3).cut();
    return new Uint8Array(formatter.commands);
  }
  /**
   * Format a test receipt
   */
  static formatTestReceipt(printerName, address, port) {
    const formatter = new _ESCPOSFormatter();
    formatter.align("center").size("large").bold(true).line("TEST PRINT").bold(false).size("large").lines(1).separator("=").align("left").line(`Printer: ${printerName}`).line(`Address: ${address}:${port}`).line(`Time: ${(/* @__PURE__ */ new Date()).toLocaleString()}`).line(`Status: CONNECTED`).lines(1).separator().align("center").line("Print Test Successful!").line("All systems working correctly.").lines(2).align("left").line("Characters: ABCDEFGHIJKLMNOPQRSTUVWXYZ").line("Numbers: 0123456789").line(`Symbols: !@#$%^&*()_+-={}[]|\\:";'<>?,./`).lines(1).separator().align("center").line("Thank you for testing!").lines(3).cut();
    return new Uint8Array(formatter.commands);
  }
  /**
   * Format simple text content
   */
  static formatText(content) {
    const formatter = new _ESCPOSFormatter();
    formatter.align("left").size("large").text(content).lines(3).cut();
    return new Uint8Array(formatter.commands);
  }
  /**
   * Format QR code (if printer supports it)
   */
  qrCode(data, size = 3) {
    const qrCommands = [
      29,
      40,
      107,
      // GS ( k
      4,
      0,
      // pL pH (data length + 2)
      49,
      65,
      // cn fn (QR code model)
      size,
      0
      // n1 n2 (module size)
    ];
    this.commands.push(...qrCommands);
    const dataBytes = new TextEncoder().encode(data);
    const dataLength = dataBytes.length + 3;
    this.commands.push(
      29,
      40,
      107,
      // GS ( k
      dataLength & 255,
      dataLength >> 8 & 255,
      // pL pH
      49,
      80,
      48,
      ...Array.from(dataBytes)
    );
    this.commands.push(
      29,
      40,
      107,
      // GS ( k
      3,
      0,
      // pL pH
      49,
      81,
      48
      // cn fn n (print QR)
    );
    return this;
  }
  /**
   * Get the formatted commands as Uint8Array
   */
  build() {
    return new Uint8Array(this.commands);
  }
  /**
   * Get the formatted commands as base64 string for Android bridge
   */
  buildBase64() {
    const uint8Array = this.build();
    const binary = Array.from(uint8Array).map((byte) => String.fromCharCode(byte)).join("");
    return btoa(binary);
  }
  /**
   * Reset the formatter
   */
  reset() {
    this.commands = [];
    this.init();
    return this;
  }
  /**
   * Get command length
   */
  length() {
    return this.commands.length;
  }
};

// server/cloudprnt-server.ts
import crypto from "crypto";
var CloudPRNTServer = class {
  printJobs = /* @__PURE__ */ new Map();
  printers = /* @__PURE__ */ new Map();
  jobsByPrinter = /* @__PURE__ */ new Map();
  // printerMac -> jobIds[]
  /**
   * Normalize MAC address to consistent format (uppercase, with colons)
   */
  normalizeMac(mac) {
    const cleaned = mac.replace(/[^0-9A-Fa-f]/g, "");
    const formatted = cleaned.match(/.{1,2}/g)?.join(":") || cleaned;
    return formatted.toUpperCase();
  }
  /**
   * Get Express router for CloudPRNT endpoints
   */
  getRouter() {
    const router3 = Router();
    router3.post("/cloudprnt/:mac?", this.handlePoll.bind(this));
    router3.get("/cloudprnt/:mac?", this.handleJobRequest.bind(this));
    router3.delete("/cloudprnt/:mac?", this.handleJobConfirmation.bind(this));
    router3.post("/cloudprnt-api/submit-job", this.handleSubmitJob.bind(this));
    router3.get("/cloudprnt-api/status", this.handleStatus.bind(this));
    router3.get("/cloudprnt-api/printers", this.handleListPrinters.bind(this));
    return router3;
  }
  /**
   * Handle POST poll from printer
   * Printer sends status and asks if there are jobs
   */
  async handlePoll(req, res) {
    try {
      const mac = req.params.mac || this.extractMacFromBody(req.body);
      if (!mac) {
        res.status(400).json({ error: "Printer MAC address required" });
        return;
      }
      const normalizedMac = this.normalizeMac(mac);
      console.log(`\u{1F4E1} CloudPRNT Poll from printer ${mac} (normalized: ${normalizedMac})`);
      console.log(`\u{1F4CA} Printer status:`, JSON.stringify(req.body, null, 2));
      this.registerPrinter(normalizedMac, req.body);
      const pendingJobs = this.getPendingJobsForPrinter(normalizedMac);
      if (pendingJobs.length > 0) {
        const job = pendingJobs[0];
        console.log(`\u2705 Job ready for printer ${normalizedMac}: ${job.jobId}`);
        const mediaTypes = job.printerType === "star" ? ["application/vnd.star.starprnt", "application/vnd.star.line"] : ["application/vnd.star.line"];
        res.json({
          jobReady: true,
          mediaTypes,
          jobToken: job.jobId
        });
      } else {
        console.log(`\u2139\uFE0F No jobs for printer ${normalizedMac}`);
        res.json({
          jobReady: false
        });
      }
    } catch (error) {
      console.error("\u274C CloudPRNT poll error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  /**
   * Handle GET request for print job data
   * Printer retrieves the actual print data using query parameters
   */
  async handleJobRequest(req, res) {
    try {
      const mac = req.params.mac;
      const jobId = req.query.token;
      const acceptHeader = req.get("Accept") || "";
      console.log(`\u{1F4E5} Job request from ${mac} for job ${jobId}`);
      console.log(`\u{1F4C4} Accept header: ${acceptHeader}`);
      console.log(`\u{1F4CB} Query params:`, req.query);
      if (!jobId) {
        res.status(400).json({ error: "Job token required" });
        return;
      }
      const job = this.printJobs.get(jobId);
      if (!job) {
        console.log(`\u274C Job ${jobId} not found`);
        res.status(404).json({ error: "Job not found" });
        return;
      }
      job.status = "printing";
      if (!job.rawData) {
        if (job.printerType === "star") {
          job.rawData = StarModernReceipt.generate(job.receiptData, job.originalOrder);
        } else {
          job.rawData = ESCPOSFormatter.formatReceipt(job.receiptData, job.originalOrder);
        }
      }
      let contentType = "application/vnd.star.line";
      if (job.printerType === "star" && acceptHeader.includes("application/vnd.star.starprnt")) {
        contentType = "application/vnd.star.starprnt";
      }
      console.log(`\u2705 Sending job ${jobId} (${job.rawData.length} bytes) as ${contentType}`);
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", job.rawData.length.toString());
      res.send(Buffer.from(job.rawData));
    } catch (error) {
      console.error("\u274C Job request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  /**
   * Handle DELETE confirmation of job completion
   * Printer confirms it has printed the job using query parameters
   */
  async handleJobConfirmation(req, res) {
    try {
      const mac = req.params.mac;
      const jobId = req.query.token;
      const code = req.query.code;
      console.log(`\u2705 Job confirmation from ${mac} for job ${jobId} (code: ${code})`);
      if (!jobId) {
        res.status(400).json({ error: "Job token required" });
        return;
      }
      const job = this.printJobs.get(jobId);
      if (job) {
        if (code === "success") {
          job.status = "completed";
          console.log(`\u2705 Job ${jobId} completed successfully`);
        } else {
          job.status = "failed";
          console.log(`\u274C Job ${jobId} failed with code: ${code}`);
        }
        setTimeout(() => {
          this.removeJob(jobId);
        }, 6e4);
      }
      res.status(204).send();
    } catch (error) {
      console.error("\u274C Job confirmation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  /**
   * Submit a new print job to CloudPRNT queue
   * This is called by the admin app to queue receipts
   */
  async handleSubmitJob(req, res) {
    try {
      const { printerMac, receiptData, originalOrder, printerType } = req.body;
      if (!printerMac || !receiptData) {
        res.status(400).json({ error: "Printer MAC and receipt data required" });
        return;
      }
      console.log(`\u{1F4DD} Submitting print job for printer ${printerMac}`);
      const jobId = this.createJob(printerMac, receiptData, originalOrder, printerType || "star");
      res.json({
        success: true,
        jobId,
        message: `Print job queued for printer ${printerMac}`
      });
    } catch (error) {
      console.error("\u274C Submit job error:", error);
      res.status(500).json({ error: "Failed to submit job" });
    }
  }
  /**
   * Get CloudPRNT system status
   */
  async handleStatus(req, res) {
    const status = {
      totalJobs: this.printJobs.size,
      pendingJobs: Array.from(this.printJobs.values()).filter((j) => j.status === "pending").length,
      printingJobs: Array.from(this.printJobs.values()).filter((j) => j.status === "printing").length,
      completedJobs: Array.from(this.printJobs.values()).filter((j) => j.status === "completed").length,
      failedJobs: Array.from(this.printJobs.values()).filter((j) => j.status === "failed").length,
      registeredPrinters: this.printers.size,
      printers: Array.from(this.printers.values())
    };
    res.json(status);
  }
  /**
   * List registered printers
   */
  async handleListPrinters(req, res) {
    const printers2 = Array.from(this.printers.entries()).map(([mac, printer]) => ({
      mac,
      model: printer.model,
      lastPoll: printer.lastPoll,
      capabilities: printer.capabilities,
      pendingJobs: this.getPendingJobsForPrinter(mac).length
    }));
    res.json({ printers: printers2 });
  }
  /**
   * Create a new print job
   */
  createJob(printerMac, receiptData, originalOrder, printerType = "star") {
    const jobId = this.generateJobId();
    const normalizedMac = this.normalizeMac(printerMac);
    const job = {
      jobId,
      printerMac: normalizedMac,
      receiptData,
      originalOrder,
      createdAt: /* @__PURE__ */ new Date(),
      status: "pending",
      printerType,
      mediaType: printerType === "star" ? "application/vnd.star.starprnt" : "application/vnd.star.line"
    };
    this.printJobs.set(jobId, job);
    const printerJobs = this.jobsByPrinter.get(normalizedMac) || [];
    printerJobs.push(jobId);
    this.jobsByPrinter.set(normalizedMac, printerJobs);
    console.log(`\u2705 Created job ${jobId} for printer ${normalizedMac}`);
    console.log(`\u{1F4CB} Printer ${normalizedMac} now has ${printerJobs.length} pending job(s)`);
    return jobId;
  }
  /**
   * Register or update printer info
   */
  registerPrinter(mac, statusData) {
    const normalizedMac = this.normalizeMac(mac);
    const printer = {
      mac: normalizedMac,
      model: statusData.printerModel || statusData.model,
      lastPoll: /* @__PURE__ */ new Date(),
      capabilities: statusData.mediaTypes || []
    };
    this.printers.set(normalizedMac, printer);
    console.log(`\u{1F4DD} Registered/Updated printer: ${normalizedMac}`);
  }
  /**
   * Get pending jobs for a specific printer
   */
  getPendingJobsForPrinter(mac) {
    const normalizedMac = this.normalizeMac(mac);
    const jobIds = this.jobsByPrinter.get(normalizedMac) || [];
    const jobs = jobIds.map((id) => this.printJobs.get(id)).filter((job) => job && job.status === "pending");
    console.log(`\u{1F50D} Looking for jobs for ${normalizedMac}: found ${jobs.length} pending job(s)`);
    return jobs;
  }
  /**
   * Remove a job from queue
   */
  removeJob(jobId) {
    const job = this.printJobs.get(jobId);
    if (job) {
      this.printJobs.delete(jobId);
      const printerJobs = this.jobsByPrinter.get(job.printerMac) || [];
      const index = printerJobs.indexOf(jobId);
      if (index > -1) {
        printerJobs.splice(index, 1);
        this.jobsByPrinter.set(job.printerMac, printerJobs);
      }
      console.log(`\u{1F5D1}\uFE0F Removed job ${jobId}`);
    }
  }
  /**
   * Extract MAC address from request body
   */
  extractMacFromBody(body) {
    return body?.mac || body?.macAddress || body?.printerMAC || null;
  }
  /**
   * Generate unique job ID
   */
  generateJobId() {
    return `job_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  }
  /**
   * Clean up old completed jobs (older than 1 hour)
   */
  cleanupOldJobs() {
    const oneHourAgo = new Date(Date.now() - 36e5);
    for (const [jobId, job] of this.printJobs.entries()) {
      if ((job.status === "completed" || job.status === "failed") && job.createdAt < oneHourAgo) {
        this.removeJob(jobId);
      }
    }
  }
};
var cloudPRNTServer = new CloudPRNTServer();
setInterval(() => {
  cloudPRNTServer.cleanupOldJobs();
}, 9e5);

// server/routes/stripe-new.ts
import express3 from "express";
import Stripe2 from "stripe";
init_email_service();
import { eq as eq7 } from "drizzle-orm";
var router2 = express3.Router();
var webhookRouter = express3.Router();
async function getStripeInstance() {
  try {
    const settings = await db.select().from(restaurantSettings).limit(1);
    if (!settings[0]?.stripeSecretKey) {
      console.error("\u274C Stripe secret key not found in database");
      return null;
    }
    return new Stripe2(settings[0].stripeSecretKey, {
      apiVersion: "2024-11-20.acacia"
    });
  } catch (error) {
    console.error("\u274C Error fetching Stripe settings from database:", error);
    return null;
  }
}
router2.post("/validate-keys", async (req, res) => {
  try {
    const { publishableKey, secretKey } = req.body;
    if (!publishableKey || !secretKey) {
      return res.status(400).json({
        error: "Missing keys",
        message: "Both publishable and secret keys are required"
      });
    }
    const pubKeyPrefix = publishableKey.startsWith("pk_test_") || publishableKey.startsWith("pk_live_");
    const secKeyPrefix = secretKey.startsWith("sk_test_") || secretKey.startsWith("sk_live_");
    if (!pubKeyPrefix || !secKeyPrefix) {
      return res.status(400).json({
        error: "Invalid key format",
        message: "Keys must start with pk_test_/pk_live_ or sk_test_/sk_live_"
      });
    }
    const stripe = new Stripe2(secretKey, {
      apiVersion: "2024-11-20.acacia"
    });
    const account = await stripe.accounts.retrieve();
    res.json({
      valid: true,
      testMode: secretKey.startsWith("sk_test_"),
      accountId: account.id,
      country: account.country
    });
  } catch (error) {
    console.error("\u274C Stripe key validation error:", error);
    res.status(400).json({
      error: "Invalid keys",
      message: error instanceof Error ? error.message : "Keys are not valid"
    });
  }
});
router2.get("/config", async (req, res) => {
  try {
    const settings = await db.select().from(restaurantSettings).limit(1);
    if (!settings[0]?.stripePublishableKey) {
      return res.status(404).json({
        error: "Stripe not configured",
        message: "Please configure Stripe keys in restaurant settings"
      });
    }
    res.json({
      publishableKey: settings[0].stripePublishableKey,
      testMode: settings[0].stripeTestMode ?? true
    });
  } catch (error) {
    console.error("\u274C Error fetching Stripe config:", error);
    res.status(500).json({
      error: "Failed to fetch Stripe configuration",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router2.post("/create-payment-intent", async (req, res) => {
  try {
    console.log("\u{1F4DD} Create payment intent request:", {
      amount: req.body.amount,
      currency: req.body.currency,
      metadata: req.body.metadata
    });
    const { amount, currency = "eur", metadata = {}, forcePaymentMethods, paymentMethodTypes } = req.body;
    if (!amount || amount <= 0) {
      console.error("\u274C Invalid amount:", amount);
      return res.status(400).json({
        error: "Invalid amount",
        message: "Amount must be greater than 0"
      });
    }
    console.log("\u{1F511} Getting Stripe instance...");
    const stripe = await getStripeInstance();
    if (!stripe) {
      console.error("\u274C Stripe instance is null - keys not configured");
      return res.status(500).json({
        error: "Stripe not configured",
        message: "Please configure Stripe keys in restaurant settings"
      });
    }
    console.log("\u2705 Stripe instance obtained successfully");
    const paymentIntentOptions = {
      amount: Math.round(amount * 100),
      // Convert to smallest currency unit
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        integration: "babylon_restaurant"
      }
    };
    if (forcePaymentMethods && Array.isArray(forcePaymentMethods)) {
      console.log("\u{1F9EA} Testing mode: Forcing payment methods:", forcePaymentMethods);
      paymentIntentOptions.payment_method_types = forcePaymentMethods;
    } else if (paymentMethodTypes && Array.isArray(paymentMethodTypes) && paymentMethodTypes.length > 0) {
      console.log("\u{1F4CB} Explicit payment methods requested:", paymentMethodTypes);
      paymentIntentOptions.payment_method_types = paymentMethodTypes;
    } else {
      paymentIntentOptions.automatic_payment_methods = {
        enabled: true,
        // This enables all payment methods configured in Stripe Dashboard
        allow_redirects: "always"
        // Enable redirect-based payment methods (bank transfers, SEPA, etc.)
      };
    }
    console.log("\u{1F4B3} Creating payment intent with options:", JSON.stringify(paymentIntentOptions, null, 2));
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);
    console.log("\u2705 Payment intent created:", paymentIntent.id);
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error("\u274C Error creating payment intent:");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    console.error("Full error:", JSON.stringify(error, null, 2));
    res.status(500).json({
      error: "Failed to create payment intent",
      message: error instanceof Error ? error.message : "Unknown error",
      details: process.env.NODE_ENV === "development" ? error : void 0
    });
  }
});
router2.get("/payment-intent/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).json({
        error: "Stripe not configured",
        message: "Please configure Stripe keys in restaurant settings"
      });
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    });
  } catch (error) {
    console.error("\u274C Error retrieving payment intent:", error);
    res.status(500).json({
      error: "Failed to retrieve payment intent",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router2.post("/refund", async (req, res) => {
  try {
    const { paymentIntentId, amount, reason = "requested_by_customer" } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({
        error: "Payment intent ID required",
        message: "Please provide a payment intent ID to refund"
      });
    }
    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).json({
        error: "Stripe not configured",
        message: "Please configure Stripe keys in restaurant settings"
      });
    }
    const refundParams = {
      payment_intent: paymentIntentId,
      reason
    };
    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }
    const refund = await stripe.refunds.create(refundParams);
    console.log("\u2705 Refund created:", refund.id);
    res.json({
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount,
      currency: refund.currency
    });
  } catch (error) {
    console.error("\u274C Error creating refund:", error);
    res.status(500).json({
      error: "Failed to create refund",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
webhookRouter.post("/webhook", express3.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  if (!sig) {
    console.error("\u274C No Stripe signature in webhook request");
    return res.status(400).send("No signature");
  }
  try {
    const settings = await db.select().from(restaurantSettings).limit(1);
    const webhookSecret = settings[0]?.stripeWebhookSecret;
    if (!webhookSecret) {
      console.error("\u274C Webhook secret not configured");
      return res.status(400).send("Webhook secret not configured");
    }
    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).send("Stripe not configured");
    }
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
    console.log(`\u{1F514} Webhook received: ${event.type}`);
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("\u2705 PaymentIntent succeeded:", paymentIntent.id);
        console.log("\u{1F4E6} Metadata:", paymentIntent.metadata);
        try {
          let orderToUpdate = null;
          if (paymentIntent.metadata.orderId) {
            console.log(`\u{1F50D} Looking up order by ID: ${paymentIntent.metadata.orderId}`);
            const result = await db.select().from(orders).where(eq7(orders.id, parseInt(paymentIntent.metadata.orderId))).limit(1);
            orderToUpdate = result[0];
          }
          if (!orderToUpdate) {
            console.log(`\u{1F50D} Fallback: Looking up order by payment intent ID: ${paymentIntent.id}`);
            const result = await db.select().from(orders).where(eq7(orders.stripePaymentIntentId, paymentIntent.id)).limit(1);
            orderToUpdate = result[0];
          }
          if (orderToUpdate) {
            if (orderToUpdate.paymentStatus !== "paid") {
              await db.update(orders).set({
                paymentStatus: "paid",
                stripePaymentIntentId: paymentIntent.id
              }).where(eq7(orders.id, orderToUpdate.id));
              console.log(`\u2705 Order #${orderToUpdate.id} (${orderToUpdate.orderNumber}) marked as paid`);
              const notifyAdmins = app.notifyAdminsNewOrder;
              if (notifyAdmins) {
                console.log("\u{1F4E2} Notifying admins of paid order:", orderToUpdate.orderNumber);
                const refreshedOrder = await db.select().from(orders).where(eq7(orders.id, orderToUpdate.id)).limit(1);
                if (refreshedOrder[0]) {
                  notifyAdmins(refreshedOrder[0]);
                }
              }
              if (orderToUpdate.customerEmail) {
                try {
                  console.log(`\u{1F4E7} Sending confirmation email to ${orderToUpdate.customerEmail}`);
                  const items = await db.select().from(orderItems).leftJoin(menuItems, eq7(orderItems.menuItemId, menuItems.id)).where(eq7(orderItems.orderId, orderToUpdate.id));
                  let branchInfo = null;
                  if (orderToUpdate.branchId) {
                    const branchResult = await db.select().from(branches).where(eq7(branches.id, orderToUpdate.branchId)).limit(1);
                    branchInfo = branchResult[0];
                  }
                  const emailData = {
                    orderNumber: orderToUpdate.orderNumber || `#${orderToUpdate.id}`,
                    customerName: orderToUpdate.customerName,
                    customerEmail: orderToUpdate.customerEmail,
                    items: items.map((item) => ({
                      name: item.menu_items?.name || "Item",
                      quantity: item.order_items.quantity,
                      price: parseFloat(item.order_items.unitPrice),
                      totalPrice: parseFloat(item.order_items.totalPrice),
                      toppings: item.order_items.toppings || []
                    })),
                    subtotal: parseFloat(orderToUpdate.subtotal),
                    deliveryFee: parseFloat(orderToUpdate.deliveryFee || "0"),
                    totalAmount: parseFloat(orderToUpdate.totalAmount),
                    orderType: orderToUpdate.orderType,
                    deliveryAddress: orderToUpdate.deliveryAddress || void 0
                  };
                  const emailSent = await sendOrderConfirmationEmail(emailData);
                  if (emailSent) {
                    console.log(`\u2705 Confirmation email sent successfully`);
                  } else {
                    console.error(`\u274C Failed to send confirmation email`);
                  }
                } catch (emailError) {
                  console.error("\u274C Error sending confirmation email:", emailError);
                }
              }
            } else {
              console.log(`\u2139\uFE0F Order #${orderToUpdate.id} already marked as paid, skipping`);
            }
          } else {
            console.error(`\u274C Could not find order for payment intent ${paymentIntent.id}`);
            console.error(`   Metadata orderId: ${paymentIntent.metadata.orderId || "missing"}`);
          }
        } catch (error) {
          console.error("\u274C Error updating order status:", error);
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("\u274C PaymentIntent failed:", paymentIntent.id);
        if (paymentIntent.metadata.orderId) {
          try {
            await db.update(orders).set({
              paymentStatus: "failed",
              stripePaymentIntentId: paymentIntent.id
            }).where(eq7(orders.id, parseInt(paymentIntent.metadata.orderId)));
            console.log(`\u274C Order ${paymentIntent.metadata.orderId} marked as payment failed`);
          } catch (error) {
            console.error("\u274C Error updating order status:", error);
          }
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        console.log("\u{1F4B0} Charge refunded:", charge.id);
        if (charge.metadata.orderId) {
          try {
            await db.update(orders).set({
              paymentStatus: "refunded",
              status: "cancelled"
            }).where(eq7(orders.id, parseInt(charge.metadata.orderId)));
            console.log(`\u{1F4B0} Order ${charge.metadata.orderId} marked as refunded`);
          } catch (error) {
            console.error("\u274C Error updating order status:", error);
          }
        }
        break;
      }
      case "charge.dispute.created": {
        const dispute = event.data.object;
        console.log("\u26A0\uFE0F Dispute created:", dispute.id);
        break;
      }
      default:
        console.log(`\u2139\uFE0F Unhandled event type: ${event.type}`);
    }
    res.json({ received: true });
  } catch (error) {
    console.error("\u274C Webhook error:", error);
    res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
});
router2.get("/sync-payments", async (req, res) => {
  try {
    console.log("\u{1F504} Starting Stripe payment sync...");
    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).json({
        error: "Stripe not configured",
        message: "Stripe is not properly configured"
      });
    }
    console.log("\u{1F4E5} Fetching payment intents from Stripe...");
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100
    });
    console.log(`\u2705 Found ${paymentIntents.data.length} payment intents in Stripe`);
    const allOrders = await db.select().from(orders);
    console.log(`\u{1F4CA} Found ${allOrders.length} orders in database`);
    const syncResults = {
      total_stripe_payments: paymentIntents.data.length,
      total_db_orders: allOrders.length,
      updated: 0,
      already_synced: 0,
      not_found_in_db: [],
      errors: []
    };
    for (const pi of paymentIntents.data) {
      try {
        if (pi.status !== "succeeded") {
          continue;
        }
        const matchingOrders = allOrders.filter(
          (order) => order.stripePaymentIntentId === pi.id
        );
        if (matchingOrders.length === 0) {
          syncResults.not_found_in_db.push(pi.id);
          console.log(`\u26A0\uFE0F Payment intent ${pi.id} not found in database`);
          continue;
        }
        for (const order of matchingOrders) {
          if (order.paymentStatus === "pending_payment") {
            await db.update(orders).set({ paymentStatus: "paid" }).where(eq7(orders.id, order.id));
            syncResults.updated++;
            console.log(`\u2705 Updated order #${order.id} to paid (was pending_payment)`);
          } else if (order.paymentStatus === "paid") {
            syncResults.already_synced++;
          }
        }
      } catch (error) {
        console.error(`\u274C Error processing payment intent ${pi.id}:`, error);
        syncResults.errors.push({
          payment_intent_id: pi.id,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    console.log("\u{1F389} Sync completed!");
    console.log(`   Updated: ${syncResults.updated}`);
    console.log(`   Already synced: ${syncResults.already_synced}`);
    console.log(`   Not found in DB: ${syncResults.not_found_in_db.length}`);
    console.log(`   Errors: ${syncResults.errors.length}`);
    res.json({
      success: true,
      ...syncResults
    });
  } catch (error) {
    console.error("\u274C Error syncing payments:", error);
    res.status(500).json({
      error: "Sync failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router2.get("/stripe-payments", async (req, res) => {
  try {
    console.log("\u{1F4B3} Fetching all payment intents from Stripe...");
    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).json({
        error: "Stripe not configured",
        message: "Stripe is not properly configured"
      });
    }
    const limit = parseInt(req.query.limit) || 100;
    const paymentIntents = await stripe.paymentIntents.list({
      limit
    });
    const allOrders = await db.select().from(orders);
    const paymentsWithOrderInfo = paymentIntents.data.map((pi) => {
      const matchingOrder = allOrders.find(
        (order) => order.stripePaymentIntentId === pi.id
      );
      return {
        stripe_payment_intent_id: pi.id,
        stripe_status: pi.status,
        stripe_amount: pi.amount / 100,
        // Convert from cents to euros
        stripe_currency: pi.currency,
        stripe_created: new Date(pi.created * 1e3).toISOString(),
        stripe_customer_email: pi.receipt_email || null,
        stripe_description: pi.description || null,
        stripe_metadata: pi.metadata || {},
        db_order_id: matchingOrder?.id || null,
        db_order_number: matchingOrder?.orderNumber || null,
        db_payment_status: matchingOrder?.paymentStatus || null,
        db_customer_name: matchingOrder?.customerName || null,
        db_customer_email: matchingOrder?.customerEmail || null,
        is_synced: matchingOrder ? pi.status === "succeeded" && matchingOrder.paymentStatus === "paid" : false,
        needs_sync: matchingOrder ? pi.status === "succeeded" && matchingOrder.paymentStatus === "pending_payment" : false
      };
    });
    const stats = {
      total_stripe_payments: paymentIntents.data.length,
      succeeded_in_stripe: paymentsWithOrderInfo.filter((p) => p.stripe_status === "succeeded").length,
      synced: paymentsWithOrderInfo.filter((p) => p.is_synced).length,
      needs_sync: paymentsWithOrderInfo.filter((p) => p.needs_sync).length,
      not_in_db: paymentsWithOrderInfo.filter((p) => !p.db_order_id).length
    };
    console.log("\u{1F4CA} Stripe payments stats:", stats);
    res.json({
      success: true,
      stats,
      payments: paymentsWithOrderInfo
    });
  } catch (error) {
    console.error("\u274C Error fetching Stripe payments:", error);
    res.status(500).json({
      error: "Failed to fetch payments",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router2.post("/link-payment", express3.json(), async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    console.log("\u{1F517} Link payment request:", { paymentIntentId, orderId });
    if (!paymentIntentId || !orderId) {
      return res.status(400).json({
        error: "Missing parameters",
        message: "Both payment intent ID and order ID are required"
      });
    }
    const stripe = await getStripeInstance();
    if (!stripe) {
      return res.status(500).json({
        error: "Stripe not configured",
        message: "Stripe is not properly configured"
      });
    }
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      await db.update(orders).set({
        stripePaymentIntentId: paymentIntentId,
        paymentStatus: paymentIntent.status === "succeeded" ? "paid" : "pending_payment"
      }).where(eq7(orders.id, orderId));
      console.log(`\u2705 Linked payment intent ${paymentIntentId} to order #${orderId}`);
      res.json({
        success: true,
        message: "Payment linked successfully",
        paymentStatus: paymentIntent.status === "succeeded" ? "paid" : "pending_payment"
      });
    } catch (error) {
      console.error("\u274C Error linking payment:", error);
      res.status(400).json({
        error: "Failed to link payment",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } catch (error) {
    console.error("\u274C Error in link-payment endpoint:", error);
    res.status(500).json({
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var stripe_new_default = router2;

// server/mobile-server.ts
dotenv2.config();
var app2 = express4();
var corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    console.log(`CORS origin check: ${origin}`);
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:8080",
      "http://localhost:8100",
      "capacitor://localhost",
      "ionic://localhost",
      "http://localhost",
      "https://localhost",
      "https://ravintola-babylon.fly.io",
      "https://babylonadmin.fly.io"
    ];
    if (origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes("192.168.") || origin.includes("172.")) {
      console.log(`\u2705 CORS allowed: localhost/local network origin ${origin}`);
      return callback(null, true);
    }
    if (origin.startsWith("capacitor://") || origin.startsWith("ionic://")) {
      console.log(`\u2705 CORS allowed: mobile app origin ${origin}`);
      return callback(null, true);
    }
    if (origin.includes("fly.io")) {
      console.log(`\u2705 CORS allowed: Netlify domain ${origin}`);
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      console.log(`\u2705 CORS allowed: whitelisted origin ${origin}`);
      callback(null, true);
    } else {
      console.log(`\u2705 CORS allowed: development mode - allowing all origins ${origin}`);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  exposedHeaders: ["Set-Cookie"]
};
app2.use(cors(corsOptions));
app2.options("*", cors(corsOptions));
app2.use("/api/stripe", webhookRouter);
app2.use(express4.json({ limit: "50mb" }));
app2.use(express4.urlencoded({ extended: false, limit: "50mb" }));
app2.use("/api/stripe", stripe_new_default);
var PgSession = connectPgSimple(session);
app2.use(session({
  store: new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || "restaurant-mobile-secret-key-2025",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    // Secure in production
    httpOnly: false,
    // Allow client-side access for mobile apps
    maxAge: parseInt(process.env.SESSION_MAX_AGE || "86400000"),
    // Default 24 hours
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    // Required for cross-origin in production
    domain: void 0
    // Let browser handle domain
  },
  name: "restaurant.sid",
  // Custom session name
  proxy: true
  // Trust proxy headers for secure cookies
}));
app2.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("X-Powered-By", "Restaurant-Mobile-Backend");
  if (req.path.startsWith("/api")) {
    const origin = req.headers.origin;
    if (origin && (origin.includes("fly.io") || origin.includes("localhost"))) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
      res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With,Accept,Origin");
      res.header("Access-Control-Allow-Credentials", "true");
    }
  }
  if (req.headers.origin && req.headers.origin.includes("localhost")) {
    const existingCookies = res.getHeader("Set-Cookie");
    if (existingCookies) {
      res.header("Set-Cookie", existingCookies);
    }
  }
  if (req.headers["user-agent"]?.includes("Mobile") || req.headers.origin?.includes("capacitor") || req.headers.origin?.includes("ionic")) {
    log(`Mobile request: ${req.method} ${req.path} from ${req.headers.origin || "mobile-app"}`);
  }
  next();
});
app2.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
app2.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "restaurant-mobile-backend",
    version: "1.0.0"
  });
});
app2.get("/api/mobile/status", (req, res) => {
  res.json({
    status: "connected",
    server: "mobile-backend",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    features: {
      printing: true,
      orders: true,
      offline: true,
      bluetooth: true,
      network: true
    }
  });
});
(async () => {
  try {
    await authService.initializeAdminUser();
    log("Admin user initialized");
    await initializeComprehensiveToppings();
    log("Toppings initialized");
    app2.use(cloudPRNTServer.getRouter());
    log("CloudPRNT server initialized");
    const server = await registerRoutes(app2);
    log("Routes registered");
    const httpServer = createServer2(app2);
    const wss = new WebSocketServer2({
      server: httpServer,
      path: "/ws"
    });
    const adminClients = /* @__PURE__ */ new Set();
    wss.on("connection", (ws, req) => {
      log("WebSocket client connected");
      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === "admin_connect") {
            adminClients.add(ws);
            log("Admin client connected to WebSocket");
            ws.send(JSON.stringify({
              type: "connection_confirmed",
              message: "Admin connected successfully"
            }));
          }
        } catch (error) {
          log(`WebSocket message error: ${error}`);
        }
      });
      ws.on("close", () => {
        adminClients.delete(ws);
        log("WebSocket client disconnected");
      });
      ws.on("error", (error) => {
        log(`WebSocket error: ${error.message}`);
        adminClients.delete(ws);
      });
    });
    const broadcast = (data) => {
      adminClients.forEach((client2) => {
        if (client2.readyState === 1) {
          client2.send(JSON.stringify(data));
        } else {
          adminClients.delete(client2);
        }
      });
    };
    global.broadcastToAdmins = broadcast;
    app2.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error ${status}: ${message}`);
      res.status(status).json({
        message,
        error: process.env.NODE_ENV === "development" ? err.stack : void 0
      });
    });
    if (process.env.NODE_ENV === "production" || process.env.SERVE_STATIC === "true") {
      serveStatic(app2);
      log("Static files serving enabled");
    }
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5e3;
    const host = process.env.HOST || "0.0.0.0";
    httpServer.listen(port, host, () => {
      log(`\u{1F680} Mobile backend serving on http://${host}:${port}`);
      log(`\u{1F4F1} Capacitor apps can connect to this server`);
      log(`\u{1F527} Health check: http://${host}:${port}/health`);
      log(`\u{1F4E1} Mobile API: http://${host}:${port}/api/mobile/status`);
      log(`\u{1F50C} WebSocket server running on ws://${host}:${port}/ws`);
    }).on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        log(`Port ${port} is in use, trying port ${port + 1}`);
        httpServer.listen(port + 1, host, () => {
          log(`\u{1F680} Mobile backend serving on http://${host}:${port + 1}`);
          log(`\u{1F50C} WebSocket server running on ws://${host}:${port + 1}/ws`);
        });
      } else {
        log(`Server error: ${err.message}`);
        throw err;
      }
    });
    process.on("SIGTERM", () => {
      log("SIGTERM received, shLahting down gracefully");
      httpServer.close(() => {
        log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    log(`Failed to start server: ${error}`);
    process.exit(1);
  }
})();
