-- =====================================================
-- Fix Products Table RLS Policies
-- This allows Admin, Manager, and Employee to manage products
-- Run this in: Supabase Dashboard → SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: Drop Existing Restrictive Policies
-- =====================================================

-- Drop all existing product policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Admin and Manager can insert products" ON public.products;
DROP POLICY IF EXISTS "Admin and Manager can update products" ON public.products;
DROP POLICY IF EXISTS "Admin and Manager can delete products" ON public.products;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Staff can view products" ON public.products;
DROP POLICY IF EXISTS "Staff can create products" ON public.products;
DROP POLICY IF EXISTS "Staff can update products" ON public.products;
DROP POLICY IF EXISTS "Admin and Manager can delete products" ON public.products;

-- =====================================================
-- PART 2: Create New Role-Based Policies
-- =====================================================

-- Policy 1: Anyone can view products (public read access)
CREATE POLICY "Public can view products"
ON public.products
FOR SELECT
TO public
USING (true);

-- Policy 2: Staff can create products (Admin, Manager, Employee)
CREATE POLICY "Staff can create products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
);

-- Policy 3: Staff can update products (Admin, Manager, Employee)
CREATE POLICY "Staff can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
);

-- Policy 4: Only Admin and Manager can delete products
CREATE POLICY "Admin and Manager can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

-- =====================================================
-- PART 3: Fix Related Tables (Bundles, Categories, etc.)
-- =====================================================

-- Bundles Table Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bundles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.bundles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.bundles;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.bundles;
DROP POLICY IF EXISTS "Public can view bundles" ON public.bundles;
DROP POLICY IF EXISTS "Staff can create bundles" ON public.bundles;
DROP POLICY IF EXISTS "Staff can update bundles" ON public.bundles;
DROP POLICY IF EXISTS "Admin and Manager can delete bundles" ON public.bundles;

-- Anyone can view bundles
CREATE POLICY "Public can view bundles"
ON public.bundles
FOR SELECT
TO public
USING (true);

-- Staff can create bundles
CREATE POLICY "Staff can create bundles"
ON public.bundles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
);

-- Staff can update bundles
CREATE POLICY "Staff can update bundles"
ON public.bundles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
);

-- Only Admin and Manager can delete bundles
CREATE POLICY "Admin and Manager can delete bundles"
ON public.bundles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

-- Product Categories Table Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.product_categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.product_categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.product_categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.product_categories;
DROP POLICY IF EXISTS "Public can view categories" ON public.product_categories;
DROP POLICY IF EXISTS "Staff can manage categories" ON public.product_categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON public.product_categories;

-- Anyone can view categories
CREATE POLICY "Public can view categories"
ON public.product_categories
FOR SELECT
TO public
USING (true);

-- Only Admin and Manager can manage categories
CREATE POLICY "Admin and Manager can insert categories"
ON public.product_categories
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admin and Manager can update categories"
ON public.product_categories
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admin and Manager can delete categories"
ON public.product_categories
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

-- Brands Table Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.brands;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.brands;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.brands;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.brands;
DROP POLICY IF EXISTS "Public can view brands" ON public.brands;
DROP POLICY IF EXISTS "Staff can manage brands" ON public.brands;
DROP POLICY IF EXISTS "Admin can manage brands" ON public.brands;

-- Anyone can view brands
CREATE POLICY "Public can view brands"
ON public.brands
FOR SELECT
TO public
USING (true);

-- Only Admin and Manager can manage brands
CREATE POLICY "Admin and Manager can insert brands"
ON public.brands
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admin and Manager can update brands"
ON public.brands
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admin and Manager can delete brands"
ON public.brands
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

-- =====================================================
-- PART 4: Verification Queries
-- =====================================================

-- Check all product table policies
-- Run this separately to verify:
/*
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('products', 'bundles', 'product_categories', 'brands')
ORDER BY tablename, cmd;
*/

-- Check your current role
-- Run this separately to verify your role:
/*
SELECT id, email, role FROM public.profiles WHERE id = auth.uid();
*/

-- Test if you can insert a product
-- Run this separately to test:
/*
INSERT INTO public.products (
  name, 
  description, 
  price, 
  stock_quantity, 
  status
) VALUES (
  'Test Product', 
  'Test Description', 
  100.00, 
  10, 
  'active'
) RETURNING *;
*/

-- =====================================================
-- NOTES: Permission Matrix
-- =====================================================
-- 
-- PRODUCTS TABLE:
-- ---------------
-- View (SELECT):
--   - Everyone: ✅ Public access
--
-- Create (INSERT):
--   - Admin: ✅ Can create
--   - Manager: ✅ Can create
--   - Employee: ✅ Can create
--
-- Update (UPDATE):
--   - Admin: ✅ Can update
--   - Manager: ✅ Can update
--   - Employee: ✅ Can update
--
-- Delete (DELETE):
--   - Admin: ✅ Can delete
--   - Manager: ✅ Can delete
--   - Employee: ❌ Cannot delete
--
-- BUNDLES TABLE:
-- --------------
-- Same permissions as products table
--
-- CATEGORIES & BRANDS:
-- -------------------
-- View: Everyone ✅
-- Create/Update/Delete: Admin & Manager only ✅
--
-- =====================================================
