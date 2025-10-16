-- ==========================================
-- 🔐 UPDATE RLS POLICIES FOR ALL ROLES
-- ==========================================
-- This script updates RLS policies to support the complete role hierarchy:
-- 
-- ADMIN: Full access (create, read, update, delete)
--   - User management (promote/demote/delete users)
--   - Manage products, bundles, brands, orders, promotions
--   - View all logs
--
-- MANAGER: Operations management (create, read, update, delete products/bundles)
--   - Manage products (create, edit, delete)
--   - Manage bundles (create, edit, delete)
--   - Manage brands, orders, promotions
--   - Cannot manage users
--
-- EMPLOYEE: View-only access (read only)
--   - View products and bundles
--   - View orders and customer information
--   - Cannot create, edit, or delete anything
--   - Cannot manage users

-- ==========================================
-- DROP OLD POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can manage bundles" ON bundles;
DROP POLICY IF EXISTS "Admins can manage bundle products" ON bundle_products;
DROP POLICY IF EXISTS "Admins can manage brands" ON brands;

-- ==========================================
-- CREATE NEW POLICIES (Admin + Manager + Employee)
-- ==========================================

-- ==========================================
-- PRODUCTS POLICIES
-- ==========================================

-- All authenticated users (admin, manager, employee) can view products
CREATE POLICY "Authenticated users can view products" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager', 'employee')
    )
  );

-- Only Admins and Managers can create products
CREATE POLICY "Admins and Managers can create products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Only Admins and Managers can update products
CREATE POLICY "Admins and Managers can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Only Admins and Managers can delete products
CREATE POLICY "Admins and Managers can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- ==========================================
-- BUNDLES POLICIES
-- ==========================================

-- All authenticated users can view bundles
CREATE POLICY "Authenticated users can view bundles" ON bundles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager', 'employee')
    )
  );

-- Only Admins and Managers can create bundles
CREATE POLICY "Admins and Managers can create bundles" ON bundles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Only Admins and Managers can update bundles
CREATE POLICY "Admins and Managers can update bundles" ON bundles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Only Admins and Managers can delete bundles
CREATE POLICY "Admins and Managers can delete bundles" ON bundles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- ==========================================
-- BUNDLE PRODUCTS POLICIES
-- ==========================================

-- All authenticated users can view bundle products
CREATE POLICY "Authenticated users can view bundle products" ON bundle_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager', 'employee')
    )
  );

-- Only Admins and Managers can manage bundle products
CREATE POLICY "Admins and Managers can manage bundle products" ON bundle_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- ==========================================
-- BRANDS POLICIES
-- ==========================================

-- All authenticated users can view brands
CREATE POLICY "Authenticated users can view brands" ON brands
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager', 'employee')
    )
  );

-- Only Admins and Managers can manage brands
CREATE POLICY "Admins and Managers can manage brands" ON brands
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- ==========================================
-- STORAGE POLICIES FOR PRODUCT IMAGES
-- ==========================================

-- Drop old storage policies
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- All authenticated users can view product images
CREATE POLICY "Authenticated users can view product images" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager', 'employee')
    )
  );

-- Admins and Managers can upload product images
CREATE POLICY "Admins and Managers can upload product images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Admins and Managers can update product images
CREATE POLICY "Admins and Managers can update product images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Admins and Managers can delete product images
CREATE POLICY "Admins and Managers can delete product images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- ==========================================
-- ADDITIONAL POLICIES (if tables exist)
-- ==========================================

-- ORDERS POLICIES (if orders table exists)
-- All authenticated users can view orders
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    -- Drop old policy if exists
    DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
    
    -- All authenticated users can view orders
    CREATE POLICY "Authenticated users can view orders" ON orders
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'manager', 'employee')
        )
      );
    
    -- Only Admins and Managers can manage orders
    CREATE POLICY "Admins and Managers can manage orders" ON orders
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'manager')
        )
      );
  END IF;
END $$;

-- CUSTOMERS POLICIES (if customers table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
    -- Drop old policy if exists
    DROP POLICY IF EXISTS "Admins can manage customers" ON customers;
    
    -- All authenticated users can view customers
    CREATE POLICY "Authenticated users can view customers" ON customers
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'manager', 'employee')
        )
      );
    
    -- Only Admins and Managers can manage customers
    CREATE POLICY "Admins and Managers can manage customers" ON customers
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'manager')
        )
      );
  END IF;
END $$;

-- ADMIN LOGS POLICIES
-- All authenticated users can view logs
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_logs') THEN
    -- Drop old policy if exists
    DROP POLICY IF EXISTS "Admins can view logs" ON admin_logs;
    DROP POLICY IF EXISTS "All can view logs" ON admin_logs;
    
    -- All authenticated users can view logs
    CREATE POLICY "Authenticated users can view admin logs" ON admin_logs
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'manager', 'employee')
        )
      );
    
    -- All authenticated users can create their own logs
    CREATE POLICY "Users can create their own logs" ON admin_logs
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'manager', 'employee')
        )
        AND user_id = auth.uid()
      );
  END IF;
END $$;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================
-- Run these to verify the policies were created:

-- Check products policies
-- SELECT policyname, cmd, roles, qual FROM pg_policies WHERE tablename = 'products';

-- Check bundles policies
-- SELECT policyname, cmd, roles, qual FROM pg_policies WHERE tablename = 'bundles';

-- Check storage policies
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check all policies for a quick overview
-- SELECT schemaname, tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename IN ('products', 'bundles', 'brands', 'orders', 'customers', 'admin_logs')
-- ORDER BY tablename, cmd;

-- ==========================================
-- 📊 PERMISSION MATRIX
-- ==========================================
-- 
-- Resource          | Admin | Manager | Employee
-- ------------------|-------|---------|----------
-- Products          | CRUD  | CRUD    | R (Read)
-- Bundles           | CRUD  | CRUD    | R (Read)
-- Brands            | CRUD  | CRUD    | R (Read)
-- Orders            | CRUD  | CRUD    | R (Read)
-- Customers         | CRUD  | CRUD    | R (Read)
-- Activity Logs     | R     | R       | R (Read)
-- User Management   | CRUD  | -       | - (None)
-- Product Images    | CRUD  | CRUD    | R (Read)
--
-- Legend:
-- CRUD = Create, Read, Update, Delete (Full Access)
-- R = Read Only (View Only)
-- - = No Access
--
-- ==========================================
