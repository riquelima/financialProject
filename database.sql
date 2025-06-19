
-- Create the financas_users table
CREATE TABLE IF NOT EXISTS financas_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the financas_months_data table
CREATE TABLE IF NOT EXISTS financas_months_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES financas_users(id) NOT NULL,
  month_year TEXT NOT NULL,
  opening_balance REAL DEFAULT 0 NOT NULL,
  credit_card_limit REAL DEFAULT 0 NOT NULL,
  UNIQUE(user_id, month_year)
);

-- Create the financas_transactions table
CREATE TABLE IF NOT EXISTS financas_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month_data_id UUID REFERENCES financas_months_data(id) NOT NULL,
  user_id UUID REFERENCES financas_users(id) NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  period_type TEXT NOT NULL CHECK (period_type IN ('mid-month', 'end-of-month')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the financas_settings table
CREATE TABLE IF NOT EXISTS financas_settings (
  user_id UUID REFERENCES financas_users(id) PRIMARY KEY,
  currency_symbol TEXT DEFAULT 'R$' NOT NULL,
  user_name_display TEXT NOT NULL,
  theme TEXT DEFAULT 'dark' NOT NULL CHECK (theme IN ('dark', 'light'))
);

-- Create the financas_active_months table
CREATE TABLE IF NOT EXISTS financas_active_months (
  user_id UUID REFERENCES financas_users(id) PRIMARY KEY,
  active_month_year TEXT NOT NULL
);

-- Disable RLS for all tables
ALTER TABLE financas_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE financas_months_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE financas_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE financas_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE financas_active_months DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_months_data_user_month ON financas_months_data(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_transactions_month_data ON financas_transactions(month_data_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON financas_transactions(user_id, date);
