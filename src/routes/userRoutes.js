const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    updateUserProfilePhoto,
    deleteUserAccount,
    deleteUserProfilePhoto,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/profile/photo', protect, upload, updateUserProfilePhoto);
router.delete('/profile', protect, deleteUserAccount);
router.delete('/profile/photo', protect, deleteUserProfilePhoto);

module.exports = router;