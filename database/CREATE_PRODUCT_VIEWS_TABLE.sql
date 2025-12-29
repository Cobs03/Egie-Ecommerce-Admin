-- Create product_views table to track product clicks/views
CREATE TABLE IF NOT EXISTS product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT, -- For tracking anonymous users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at);
CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON product_views(user_id);

-- Enable Row Level Security
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- Allow everyone (authenticated and anonymous) to insert views
CREATE POLICY "Anyone can insert product views"
  ON product_views
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read view data
CREATE POLICY "Admins can view all product views"
  ON product_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE product_views IS 'Tracks product views/clicks for analytics';
