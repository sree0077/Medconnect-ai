/**
 * Migration script to add AI-related fields to existing users
 * This script adds the new AI history and usage stats fields to all existing users
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = "mongodb+srv://sreeraj07:858085@cluster0.lsdff.mongodb.net/medconnect?retryWrites=true&w=majority&appName=Cluster0";

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function addAIFieldsToUsers() {
  try {
    console.log('🔄 Starting migration: Adding AI fields to existing users...');
    
    // Find all users that don't have the new AI fields
    const usersToUpdate = await User.find({
      $or: [
        { symptomCheckerHistory: { $exists: false } },
        { consultationHistory: { $exists: false } },
        { aiUsageStats: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${usersToUpdate.length} users to update`);

    if (usersToUpdate.length === 0) {
      console.log('✅ All users already have AI fields. Migration not needed.');
      return;
    }

    // Update users in batches
    const batchSize = 100;
    let updatedCount = 0;

    for (let i = 0; i < usersToUpdate.length; i += batchSize) {
      const batch = usersToUpdate.slice(i, i + batchSize);
      const userIds = batch.map(user => user._id);

      await User.updateMany(
        { _id: { $in: userIds } },
        {
          $set: {
            symptomCheckerHistory: [],
            consultationHistory: [],
            aiUsageStats: {
              totalSymptomChecks: 0,
              totalConsultations: 0,
              totalAIInteractions: 0,
              lastSymptomCheck: null,
              lastConsultation: null,
              averageSessionDuration: 0,
              preferredAIFeature: 'none',
              totalTimeSpent: 0
            }
          }
        }
      );

      updatedCount += batch.length;
      console.log(`✅ Updated ${updatedCount}/${usersToUpdate.length} users`);
    }

    console.log('🎉 Migration completed successfully!');
    console.log(`📈 Total users updated: ${updatedCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function verifyMigration() {
  try {
    console.log('🔍 Verifying migration...');
    
    const totalUsers = await User.countDocuments();
    const usersWithAIFields = await User.countDocuments({
      symptomCheckerHistory: { $exists: true },
      consultationHistory: { $exists: true },
      aiUsageStats: { $exists: true }
    });

    console.log(`📊 Total users: ${totalUsers}`);
    console.log(`✅ Users with AI fields: ${usersWithAIFields}`);
    
    if (totalUsers === usersWithAIFields) {
      console.log('🎉 Migration verification successful! All users have AI fields.');
    } else {
      console.log('⚠️  Migration verification failed. Some users are missing AI fields.');
    }

    // Show sample of updated user structure
    const sampleUser = await User.findOne({ role: 'patient' }).select('name aiUsageStats');
    if (sampleUser) {
      console.log('📋 Sample user AI stats structure:');
      console.log(JSON.stringify(sampleUser.aiUsageStats, null, 2));
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
}

async function runMigration() {
  try {
    await connectDB();
    await addAIFieldsToUsers();
    await verifyMigration();
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  addAIFieldsToUsers,
  verifyMigration
};
