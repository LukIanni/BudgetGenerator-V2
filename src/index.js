const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const syncDatabase = require('./syncDatabase');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/home.html'));
});

app.get('/usuario', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/usuario.html'));
});

app.get('/orcamento.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/orcamento.html'));
});

const authRoutes = require('./routes/authRotes'); // Corrected path
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await syncDatabase();
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
};

startServer();
