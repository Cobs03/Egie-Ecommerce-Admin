// Quick diagnostic script to check product data structure
import { ProductService } from './services/ProductService.js';

async function debugProducts() {
  try {
    const result = await ProductService.getAllProducts();
    
    if (!result.success) {
      console.error('Failed to fetch products:', result.error);
      return;
    }
    if (result.data.length > 0) {
      const firstProduct = result.data[0];
      if (firstProduct.images && firstProduct.images.length > 0) {
      } else {
      }
    } else {
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run debug
debugProducts();