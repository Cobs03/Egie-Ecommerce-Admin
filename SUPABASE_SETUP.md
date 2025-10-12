# Supabase Integration Setup Guide

## Overview
This guide will help you integrate your admin app with the main ecommerce app using Supabase as the shared database.

## Prerequisites
1. A Supabase account (create one at https://supabase.com)
2. Both admin app and main ecommerce app repositories

## Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Wait for the project to be fully set up
4. Note down your project URL and anon key

## Step 2: Set Up Database Schema
1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the content from `database/schema.sql`
3. Run the SQL script to create all tables and functions

## Step 3: Configure Environment Variables
1. Copy `.env.local` to `.env` (for production)
2. Replace the placeholder values with your actual Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Test the Connection
1. Start your admin app: `npm run dev`
2. Check the browser console for any Supabase connection errors
3. Try creating a product to test the integration

## Step 5: Integration with Main Ecommerce App

### For your main ecommerce app:
1. Install Supabase client: `npm install @supabase/supabase-js`
2. Copy the `src/lib/supabase.js` file to your main app
3. Copy the service files you need from `src/services/`
4. Use the same environment variables configuration

### Example integration in main ecommerce app:
```javascript
// In your main app's product listing component
import { ProductService } from './services/ProductService'
import { useRealtimeProducts } from './hooks/useRealtime'

function ProductListing() {
  const { products, loading } = useRealtimeProducts()
  
  // Your products will automatically update when admin adds/edits products
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

## Step 6: Set Up Row Level Security (RLS)
1. In Supabase dashboard, go to Authentication
2. Configure your authentication method (email/password, OAuth, etc.)
3. Adjust the RLS policies in the SQL schema based on your security requirements

## Data Flow
```
Admin App (Add Product) → Supabase Database → Main Ecommerce App (Shows Product)
```

## Real-time Features
- When admin adds a product, it appears instantly on the main app
- Order status updates sync between both apps
- Stock levels update in real-time
- Customer data is shared between apps

## API Endpoints Available

### Products
- `ProductService.createProduct(productData)`
- `ProductService.getAllProducts()`
- `ProductService.updateProduct(id, productData)`
- `ProductService.deleteProduct(id)`

### Orders
- `OrderService.getAllOrders()`
- `OrderService.updateOrderStatus(id, status)`
- `OrderService.getOrdersByStatus(status)`

### Bundles
- `BundleService.createBundle(bundleData)`
- `BundleService.getAllBundles()`
- `BundleService.updateBundle(id, bundleData)`

### Customers
- `CustomerService.getAllCustomers()`
- `CustomerService.getCustomerById(id)`
- `CustomerService.searchCustomers(searchTerm)`

## Security Considerations
1. Use environment variables for all credentials
2. Set up proper RLS policies
3. Validate all inputs on both client and database level
4. Use HTTPS in production
5. Regularly rotate your API keys

## Monitoring and Analytics
1. Use Supabase dashboard to monitor database performance
2. Set up logging for important operations
3. Monitor real-time connections and usage

## Troubleshooting
1. Check Supabase logs in the dashboard
2. Verify environment variables are correctly set
3. Ensure RLS policies allow your operations
4. Check network connectivity

## Next Steps
1. Set up authentication for admin users
2. Implement image upload with Supabase Storage
3. Add email notifications for orders
4. Set up backup and recovery procedures