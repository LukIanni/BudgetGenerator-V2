const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserPassword,
    updateUserProfilePhoto,
    deleteUserAccount,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile/password', protect, updateUserPassword);
router.post('/profile/photo', protect, upload, updateUserProfilePhoto);
router.delete('/profile', protect, deleteUserAccount);

module.exports = router;
