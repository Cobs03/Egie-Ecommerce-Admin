-- Add DELETE policy for contact_submissions table
-- This allows authenticated users (admin/managers/employees) to delete contact submissions

-- First, check if the policy already exists and drop it if needed
DROP POLICY IF EXISTS "Authenticated users can delete contact submissions" ON public.contact_submissions;

-- Create the DELETE policy
CREATE POLICY "Authenticated users can delete contact submissions" 
ON public.contact_submissions 
FOR DELETE 
TO authenticated
USING (true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'contact_submissions'
ORDER BY cmd, policyname;
