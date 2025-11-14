const mongoose = require('mongoose');
const Category = require('../src/models/Category');

async function setupTestDb() {
  try {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/mern-testing-test';
    await mongoose.connect(mongoUri);
    console.log('Connected to test database');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Create default categories
    const categories = [
      { name: 'Technology', description: 'Posts about technology', slug: 'technology' },
      { name: 'Lifestyle', description: 'Posts about lifestyle', slug: 'lifestyle' },
      { name: 'Travel', description: 'Posts about travel', slug: 'travel' },
      { name: 'Food', description: 'Posts about food', slug: 'food' }
    ];

    await Category.insertMany(categories);
    console.log('Created default categories');

    console.log('Test database setup complete');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

setupTestDb();
