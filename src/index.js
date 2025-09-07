const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const syncDatabase = require('./syncDatabase');
const Produto = require('./models/produto'); 
const Servico = require('./models/servico'); 
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Serve arquivos estáticos com os tipos MIME corretos
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        }
    }
}));

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

app.get('/download/:id', async (req, res) => {
    const { id } = req.params;

    let registro = await Produto.findByPk(id);
    if (!registro) {
        registro = await Servico.findByPk(id);
    }

    if (!registro || !registro.pdf_path) {
        return res.status(404).send('PDF não encontrado');
    }

    res.download(registro.pdf_path);
});

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const apiOrcamentoRoutes = require('./routes/apiOrcamento'); 


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orcamento', apiOrcamentoRoutes);

syncDatabase().then(() => {
const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}).catch(err => {
    console.error("Erro ao sincronizar o banco de dados:", err);
});

module.exports = app;


