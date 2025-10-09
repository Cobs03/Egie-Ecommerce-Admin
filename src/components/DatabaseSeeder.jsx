import React, { useState } from 'react';
import { seedDatabase, clearProducts } from '../utils/seedData.js';

const DatabaseSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    setIsSeeding(true);
    setMessage('Starting database seeding...');
    
    try {
      const result = await seedDatabase();
      
      if (result.success) {
        setMessage('✅ Database seeded successfully with sample products!');
      } else {
        setMessage(`❌ Error seeding database: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage(`❌ Error seeding database: ${error.message}`);
    }
    
    setIsSeeding(false);
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all products? This action cannot be undone.')) {
      return;
    }
    
    setIsClearing(true);
    setMessage('Clearing products...');
    
    try {
      const result = await clearProducts();
      
      if (result.success) {
        setMessage('🗑️ All products cleared successfully!');
      } else {
        setMessage(`❌ Error clearing products: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage(`❌ Error clearing products: ${error.message}`);
    }
    
    setIsClearing(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Database Management</h2>
      <p className="text-gray-600 mb-6">
        Use these tools to populate your database with sample products or clear existing data.
      </p>
      
      <div className="space-y-4">
        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{ cursor: isSeeding ? 'not-allowed' : 'pointer' }}
        >
          {isSeeding ? 'Seeding Database...' : 'Seed Sample Products'}
        </button>
        
        <button
          onClick={handleClear}
          disabled={isClearing}
          className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ml-4 cursor-pointer"
          style={{ cursor: isClearing ? 'not-allowed' : 'pointer' }}
        >
          {isClearing ? 'Clearing Products...' : 'Clear All Products'}
        </button>
      </div>
      
      {message && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  );
};

export default DatabaseSeeder;