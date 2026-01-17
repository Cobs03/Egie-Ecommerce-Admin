-- Create a database function to get most clicked products
-- This avoids complex joins and aggregation in the client

CREATE OR REPLACE FUNCTION get_most_clicked_products(limit_count INT DEFAULT 5)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  product_image TEXT,
  view_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.product_id,
    p.name::TEXT as product_name,
    CASE 
      -- If images->0 is a JSON object with 'url' property
      WHEN jsonb_typeof(p.images->0) = 'object' THEN 
        COALESCE(NULLIF(p.images->0->>'url', ''), 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image')
      -- If images->0 is a plain string (direct URL)
      WHEN jsonb_typeof(p.images->0) = 'string' THEN 
        COALESCE(NULLIF(p.images->>0, ''), 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image')
      -- If images is null or empty array
      ELSE 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image'
    END::TEXT as product_image,
    COUNT(*)::BIGINT as view_count
  FROM product_views pv
  INNER JOIN products p ON p.id = pv.product_id
  GROUP BY pv.product_id, p.name, p.images
  ORDER BY view_count DESC
  LIMIT limit_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_most_clicked_products TO authenticated;

-- Test the function
SELECT * FROM get_most_clicked_products(5);
