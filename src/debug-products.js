// Quick diagnostic script to check product data structure
import { ProductService } from './services/ProductService.js';

async function debugProducts() {
  console.log('=== PRODUCT DEBUG ===');
  
  try {
    const result = await ProductService.getAllProducts();
    
    if (!result.success) {
      console.error('Failed to fetch products:', result.error);
      return;
    }
    
    console.log(`Found ${result.data.length} products`);
    
    if (result.data.length > 0) {
      const firstProduct = result.data[0];
      console.log('\n=== FIRST PRODUCT STRUCTURE ===');
      console.log('ID:', firstProduct.id);
      console.log('Name:', firstProduct.name);
      console.log('Images field:', firstProduct.images);
      console.log('Images type:', typeof firstProduct.images);
      console.log('Images length:', firstProduct.images?.length || 'N/A');
      
      if (firstProduct.images && firstProduct.images.length > 0) {
        console.log('First image URL:', firstProduct.images[0]);
        console.log('All images:', firstProduct.images);
      } else {
        console.log('❌ No images found in this product');
      }
      
      console.log('\n=== METADATA ===');
      console.log('Metadata:', firstProduct.metadata);
      
      console.log('\n=== FULL PRODUCT ===');
      console.log(JSON.stringify(firstProduct, null, 2));
    } else {
      console.log('❌ No products found in database');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run debug
debugProducts();