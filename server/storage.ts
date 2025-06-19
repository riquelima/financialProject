
import { supabase } from "@shared/supabase";
import { 
  type User, type InsertUser,
  type MonthData, type InsertMonthData,
  type Transaction, type InsertTransaction,
  type Settings, type InsertSettings,
  type ActiveMonth, type InsertActiveMonth
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Month data operations
  getMonthData(userId: string, monthYear: string): Promise<MonthData | undefined>;
  createMonthData(monthData: InsertMonthData): Promise<MonthData>;
  updateMonthData(userId: string, monthYear: string, updates: Partial<MonthData>): Promise<MonthData>;
  getUserMonths(userId: string): Promise<MonthData[]>;
  
  // Transaction operations
  getTransactions(userId: string, monthYear: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  
  // Settings operations
  getSettings(userId: string): Promise<Settings | undefined>;
  upsertSettings(settings: InsertSettings): Promise<Settings>;
  
  // Active month operations
  getActiveMonth(userId: string): Promise<ActiveMonth | undefined>;
  setActiveMonth(activeMonth: InsertActiveMonth): Promise<ActiveMonth>;
}

class SupabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('financas_users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('financas_users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) return undefined;
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('financas_users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  }

  // Month data operations
  async getMonthData(userId: string, monthYear: string): Promise<MonthData | undefined> {
    const { data, error } = await supabase
      .from('financas_months_data')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .single();
    
    if (error) return undefined;
    return data as MonthData;
  }

  async createMonthData(monthData: InsertMonthData): Promise<MonthData> {
    const { data, error } = await supabase
      .from('financas_months_data')
      .insert(monthData)
      .select()
      .single();
    
    if (error) throw error;
    return data as MonthData;
  }

  async updateMonthData(userId: string, monthYear: string, updates: Partial<MonthData>): Promise<MonthData> {
    const { data, error } = await supabase
      .from('financas_months_data')
      .update(updates)
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .select()
      .single();
    
    if (error) throw error;
    return data as MonthData;
  }

  async getUserMonths(userId: string): Promise<MonthData[]> {
    const { data, error } = await supabase
      .from('financas_months_data')
      .select('*')
      .eq('user_id', userId)
      .order('month_year', { ascending: false });
    
    if (error) throw error;
    return data as MonthData[];
  }

  // Transaction operations
  async getTransactions(userId: string, monthYear: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('financas_transactions')
      .select('*')
      .eq('user_id', userId)
      .like('date', `${monthYear}%`)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data as Transaction[];
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const { data, error } = await supabase
      .from('financas_transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) throw error;
    return data as Transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('financas_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('financas_transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Settings operations
  async getSettings(userId: string): Promise<Settings | undefined> {
    const { data, error } = await supabase
      .from('financas_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) return undefined;
    return data as Settings;
  }

  async upsertSettings(settings: InsertSettings): Promise<Settings> {
    const { data, error } = await supabase
      .from('financas_settings')
      .upsert(settings, { onConflict: 'user_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data as Settings;
  }

  // Active month operations
  async getActiveMonth(userId: string): Promise<ActiveMonth | undefined> {
    const { data, error } = await supabase
      .from('financas_active_months')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) return undefined;
    return data as ActiveMonth;
  }

  async setActiveMonth(activeMonth: InsertActiveMonth): Promise<ActiveMonth> {
    const { data, error } = await supabase
      .from('financas_active_months')
      .upsert(activeMonth, { onConflict: 'user_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data as ActiveMonth;
  }
}

export const storage = new SupabaseStorage();
