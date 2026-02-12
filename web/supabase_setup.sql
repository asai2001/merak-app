-- Run this SQL in Supabase Dashboard → SQL Editor

-- 1. Create predictions table
CREATE TABLE predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  prediction VARCHAR(20) NOT NULL,
  confidence FLOAT NOT NULL,
  fertile_prob FLOAT,
  infertile_prob FLOAT,
  model_used VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- 3. Create policies (user can only access their own data)
CREATE POLICY "Users can view own predictions"
  ON predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own predictions"
  ON predictions FOR DELETE
  USING (auth.uid() = user_id);
