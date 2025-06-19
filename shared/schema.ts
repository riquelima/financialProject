import { z } from "zod";

// Types for Supabase (snake_case)
export type User = {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

export type InsertUser = {
  username: string;
  password_hash: string;
};

export type MonthData = {
  id: string;
  user_id: string;
  month_year: string;
  opening_balance: number;
  credit_card_limit: number;
};

export type InsertMonthData = {
  user_id: string;
  month_year: string;
  opening_balance?: number;
  credit_card_limit?: number;
};

export type Transaction = {
  id: string;
  month_data_id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: string; // 'income' | 'expense'
  period_type: string; // 'mid-month' | 'end-of-month'
  created_at: string;
  updated_at: string;
};

export type InsertTransaction = {
  month_data_id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: string;
  period_type: string;
};

export type Settings = {
  user_id: string;
  currency_symbol: string;
  user_name_display: string;
  theme: string; // 'dark' | 'light'
};

export type InsertSettings = {
  user_id: string;
  currency_symbol?: string;
  user_name_display: string;
  theme?: string;
};

export type ActiveMonth = {
  user_id: string;
  active_month_year: string;
};

export type InsertActiveMonth = {
  user_id: string;
  active_month_year: string;
};

// Zod schemas
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
});

export const insertMonthDataSchema = z.object({
  user_id: z.string(),
  month_year: z.string(),
  opening_balance: z.number().optional().default(0),
  credit_card_limit: z.number().optional().default(0),
});

export const insertTransactionSchema = z.object({
  month_data_id: z.string(),
  user_id: z.string(),
  description: z.string().min(1),
  amount: z.number(),
  category: z.string().min(1),
  date: z.string(),
  type: z.enum(['income', 'expense']),
  period_type: z.enum(['mid-month', 'end-of-month']),
});

export const insertSettingsSchema = z.object({
  user_id: z.string(),
  currency_symbol: z.string().optional().default('R$'),
  user_name_display: z.string().min(1),
  theme: z.enum(['dark', 'light']).optional().default('dark'),
});

export const insertActiveMonthSchema = z.object({
  user_id: z.string(),
  active_month_year: z.string(),
});

// Export all schemas for easier import
export * from "./schema";