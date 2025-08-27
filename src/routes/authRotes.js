const express = require('express');

const router = express.Router();

router.post('/register', (req, res) => {
    res.send('Rota de registro funcionando');
});

router.post('/login', (req, res) =>{
    res.send('Rota de longin funcionando');
});

module.exports = router;