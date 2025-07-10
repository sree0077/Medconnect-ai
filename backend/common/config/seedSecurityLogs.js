const SecurityLog = require('../models/SecurityLog');

const seedSecurityLogs = async () => {
  try {
    // Remove any existing dummy data with specific locations
    const dummyLocations = ['New York, NY', 'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Server'];
    const hasOldDummyData = await SecurityLog.findOne({ location: { $in: dummyLocations } });
    
    if (hasOldDummyData) {
      console.log('Found old dummy security logs - removing them');
      await SecurityLog.deleteMany({ location: { $in: dummyLocations } });
      console.log('Old dummy security logs removed');
    }
    
    // Remove any other instances of obviously dummy seeded data
    await SecurityLog.deleteMany({ 
      $or: [
        { event: 'System Initialization' },
        { user: 'system' },
        { user: { $regex: /unknown@/ } },
        { user: { $regex: /dr\./ } },
        { user: { $regex: /example\.com$/ } },
        { user: { $regex: /test/ } },
        { details: { $regex: /test/i } },
        { details: { $regex: /dummy/i } },
        { details: { $regex: /sample/i } }
      ]
    });
    
    console.log('✅ Security logs database cleaned of all dummy data');
  } catch (error) {
    console.error('Error cleaning security logs:', error);
  }
};

module.exports = seedSecurityLogs;
