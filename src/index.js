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

const authRoutes = require('./routes/authRotes');
const userRoutes = require('./routes/userRoutes');
const apiOrcamentoRoutes = require('./routes/apiOrcamento'); 


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', apiOrcamentoRoutes);

syncDatabase().then(() => {
const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}).catch(err => {
    console.error("Erro ao sincronizar o banco de dados:", err);
});

module.exports = app;


