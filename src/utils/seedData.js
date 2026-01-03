// Sample data seeding script for Supabase
// Updated to match the new database schema

import { supabase } from '../lib/supabase.js'

export const sampleProducts = [
  {
    name: "Gaming Laptop Pro X1",
    description: "High-performance gaming laptop with RTX 4070 graphics card and Intel i7 processor. Perfect for gaming and content creation.",
    price: 899.99,
    sku: "LAPTOP-PRO-X1",
    stock_quantity: 15,
    images: ["/images/products/laptop1.png", "/images/products/laptop2.png"],
    specifications: {
      processor: "Intel Core i7-13700H",
      memory: "16GB DDR5",
      storage: "1TB NVMe SSD",
      graphics: "NVIDIA RTX 4070",
      display: "15.6 4K OLED",
      brand: "TechPro"
    },
    features: ["RTX 4070 Graphics", "4K OLED Display", "Fast NVMe SSD", "Advanced Cooling"],
    weight: 2.3,
    dimensions: { length: 35.7, width: 25.1, height: 2.1, unit: "cm" },
    status: "active",
    is_featured: true,
    rating: 4.8,
    review_count: 124,
    compare_at_price: 999.99,
    meta_title: "Gaming Laptop Pro X1 - High Performance Gaming",
    meta_description: "Ultimate gaming laptop with RTX 4070 and i7 processor"
  },
  {
    name: "AMD Ryzen 7 7800X3D",
    description: "Ultimate gaming processor with 3D V-Cache technology. Delivers exceptional performance in gaming and content creation.",
    price: 249.99,
    sku: "CPU-AMD-7800X3D",
    stock_quantity: 25,
    images: ["/images/products/cpu1.png"],
    specifications: {
      cores: "8 cores, 16 threads",
      baseClock: "4.2 GHz",
      boostClock: "5.0 GHz",
      cache: "96MB L3 Cache",
      socket: "AM5",
      tdp: "120W",
      brand: "AMD",
      architecture: "Zen 4"
    },
    features: ["3D V-Cache Technology", "8 Cores / 16 Threads", "Up to 5.0 GHz Boost", "AM5 Socket"],
    status: "active",
    is_featured: true,
    rating: 4.9,
    review_count: 89,
    compare_at_price: 279.99
  },
  {
    name: "NVIDIA RTX 4080 Super",
    description: "Next-generation graphics card for 4K gaming and AI workloads. Features 16GB GDDR6X memory.",
    price: 659.99,
    sku: "GPU-RTX-4080S",
    stock_quantity: 8,
    images: ["/images/products/gpu1.png"],
    specifications: {
      memory: "16GB GDDR6X",
      memoryBus: "256-bit",
      baseClock: "2,295 MHz",
      boostClock: "2,550 MHz",
      cudaCores: "10,240",
      rtCores: "80 3rd Gen",
      tensorCores: "320 4th Gen",
      brand: "NVIDIA",
      powerConsumption: "320W",
      displayPorts: "3x DisplayPort 1.4a, 1x HDMI 2.1"
    },
    features: ["Ray Tracing", "DLSS 3", "16GB GDDR6X", "4K Gaming Ready"],
    weight: 1.5,
    dimensions: { length: 30.4, width: 13.7, height: 6.1, unit: "cm" },
    status: "active",
    is_featured: true,
    rating: 4.7,
    review_count: 156,
    compare_at_price: 699.99
  }
];

export const seedDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(sampleProducts);
    
    if (error) {
      console.error('Error seeding database:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
};

// Function to clear all products (use with caution!)
export const clearProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (error) {
      console.error('Error clearing products:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error clearing products:', error);
    return { success: false, error };
  }
};