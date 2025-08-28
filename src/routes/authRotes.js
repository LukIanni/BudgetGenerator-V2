const express = require('express');

const router = express.Router();
const authContoller = require('../controllers/authController');

router.post('/register', authContoller.register);

router.post('/login', (req, authContoller) =>{
    res.send('Rota de longin funcionando');
});

module.exports = router;