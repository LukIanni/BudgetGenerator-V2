const express = require('express');

const router = express.Router();
const authContoller = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', authContoller.register);

router.post('/login', authContoller.login);

router.post('/refresh', authContoller.refresh);

router.get('/verify', protect, authContoller.verify);

module.exports = router;
