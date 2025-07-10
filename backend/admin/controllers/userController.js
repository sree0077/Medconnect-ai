const User = require('../../common/models/User');
const bcrypt = require('bcryptjs');
const { createNotification } = require('../../common/controllers/notificationController');

const getDoctors = async (req, res) => {
  try {
    // Fetch all doctors with focus on status field for approvals
    const doctors = await User.find({ role: 'doctor' })
      .select('name email specialization experience qualifications status _id phone address createdAt')
      .lean();
    
    console.log(`Found ${doctors.length} doctors:`, JSON.stringify(doctors, null, 2));
    res.json(doctors);
  } catch (err) {
    console.error('Error fetching doctors:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch doctors', message: err.message });
  }
};

// Get only active doctors for appointment booking
const getActiveDoctors = async (req, res) => {
  try {
    // Fetch only active doctors that patients can book appointments with
    const doctors = await User.find({ 
      role: 'doctor',
      status: 'active' // Only include active (approved) doctors
    })
    .select('name email specialization experience _id phone address')
    .lean();
    
    console.log(`Found ${doctors.length} active doctors for booking`);
    res.json(doctors);
  } catch (err) {
    console.error('Error fetching active doctors:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch doctors', message: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const updateData = { ...req.body };
    
    console.log('Received update data:', JSON.stringify(updateData, null, 2));

    // Remove sensitive fields that shouldn't be updated via this route
    delete updateData.password;
    delete updateData.role;
    delete updateData._id;
    delete updateData.email; // Email changes should be handled separately

    // Handle password change if provided
    if (req.body.newPassword && req.body.currentPassword) {
      const user = await User.findById(userId);
      const isValidPassword = await bcrypt.compare(req.body.currentPassword, user.password);

      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      updateData.password = await bcrypt.hash(req.body.newPassword, 10);
      delete updateData.newPassword;
      delete updateData.currentPassword;
      delete updateData.confirmPassword;
    }    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Updated user profile:', JSON.stringify(updatedUser, null, 2));
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Import models here to avoid circular dependencies
    const Appointment = require('../models/Appointment');
    const Prescription = require('../models/Prescription');

    // Delete all related data
    await Promise.all([
      Appointment.deleteMany({
        $or: [{ patientId: userId }, { doctorId: userId }]
      }),
      Prescription.deleteMany({
        $or: [{ patientId: userId }, { doctorId: userId }]
      })
    ]);

    // Delete the user account
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Account deleted successfully',
      deletedUser: {
        id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });
  } catch (err) {
    console.error('Error deleting user account:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

// Function to update user status (approve/reject doctors)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Updating user ${id} status to ${status}`);

    if (!['active', 'inactive', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Updated user status:', JSON.stringify(updatedUser, null, 2));

    // Notify admin of status change
    try {
      // Find all admin users
      const adminUsers = await User.find({ role: 'admin' });

      // Create notifications for all admins
      const notificationPromises = adminUsers.map(admin => {
        let title, message, type;

        if (updatedUser.role === 'doctor') {
          if (status === 'active') {
            title = '✅ Doctor Approved';
            message = `Dr. ${updatedUser.name} has been approved and can now accept appointments.`;
            type = 'success';
          } else if (status === 'inactive') {
            title = '❌ Doctor Deactivated';
            message = `Dr. ${updatedUser.name} has been deactivated and cannot accept new appointments.`;
            type = 'warning';
          } else {
            title = '⏳ Doctor Status Changed';
            message = `Dr. ${updatedUser.name} status changed to ${status}.`;
            type = 'info';
          }
        } else {
          title = '👤 User Status Updated';
          message = `${updatedUser.name} (${updatedUser.role}) status changed to ${status}.`;
          type = status === 'active' ? 'success' : 'warning';
        }

        return createNotification(admin._id, title, message, type, {
          userId: updatedUser._id,
          userRole: updatedUser.role,
          userName: updatedUser.name,
          oldStatus: 'unknown', // We don't have the old status here
          newStatus: status
        });
      });

      await Promise.all(notificationPromises);
      console.log(`Notified ${adminUsers.length} admin(s) of status change for ${updatedUser.name}`);
    } catch (notificationError) {
      console.error('Error sending admin notification for status change:', notificationError);
      // Don't fail the status update if notification fails
    }



    res.json({
      message: `User status updated to ${status} successfully`,
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating user status:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to update user status', message: err.message });
  }
};

// Fetch all users for admin user management
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .lean();
    console.log(`Found ${users.length} users for admin management`);
    res.json(users);
  } catch (err) {
    console.error('Error fetching all users:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch users', message: err.message });
  }
};

module.exports = {
  getDoctors,
  getActiveDoctors,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  updateUserStatus,
  getAllUsers // Export the new function
};