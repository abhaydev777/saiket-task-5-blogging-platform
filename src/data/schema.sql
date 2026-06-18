-- schema.sql
-- Run this in the Supabase SQL Editor to initialize the database tables and Row Level Security policies.

-- 1. Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  image text NOT NULL,
  read_time text NOT NULL,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 3. Create public Row Level Security policies
-- Read access policy (allows anyone, including unauthenticated users, to view posts)
CREATE POLICY "Allow public read access" ON public.blogs 
  FOR SELECT USING (true);

-- Write access policies (allows public CRUD operations for demonstration/unauthenticated mode)
CREATE POLICY "Allow public insert" ON public.blogs 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.blogs 
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON public.blogs 
  FOR DELETE USING (true);
