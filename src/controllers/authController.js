const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Função para cadastro do usúario
const register = async (req, res) => {

    //Pega os dados da requisição 
    const { name, email, password, confirmpassword } = req.body;

    //Verificando se existe campos em branco
    if (!name || !email || !password || !confirmpassword) {
        return res.status(400).json({ mensagem: 'existem campos não preenchidos' })
    }

    //Confere a confirnação de senha do usuário
    if (confirmpassword !== password) {
        res.status(400).json({ mensagem: 'senhas diferentes' });
        return
    }

    // Verifica se o usuário já existe
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
        return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        // Cria o novo usuário com a foto de perfil padrão
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            photo: '/images/testeusuario.jpeg' // Adiciona a foto padrão
        });

        // Gera o token para o novo usuário
        const token = jwt.sign({ id: newUser.id, name: newUser.name }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        return res.status(201).json({
            message: 'Usuário criado com sucesso!',
            token: token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                photo: newUser.photo
            }
        });

    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar usuário.', error: error.message });
    }

};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, forneça email e senha.' });
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        console.log('✅ [LOGIN] Token gerado com sucesso');
        console.log('✅ [LOGIN] User ID:', user.id);
        console.log('✅ [LOGIN] JWT_SECRET (primeiros 10 chars):', process.env.JWT_SECRET?.substring(0, 10) + '...');

        res.json({
            message: 'Login bem-sucedido!',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                photo: user.photo
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
};

const refresh = async (req, res) => {
    try {
        // Pega o token do header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token não fornecido.' });
        }

        const oldToken = authHeader.substring(7); // Remove 'Bearer '

        // Verifica e decodifica o token (mesmo que expirado)
        let decoded;
        try {
            decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
        } catch (error) {
            // Se o token expirou, tenta decodificar ignorando a expiração
            if (error.name === 'TokenExpiredError') {
                decoded = jwt.decode(oldToken);
                if (!decoded) {
                    return res.status(401).json({ message: 'Token inválido.' });
                }
            } else {
                return res.status(401).json({ message: 'Token inválido.' });
            }
        }

        // Busca o usuário no banco
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Gera um novo token
        const newToken = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        console.log('🔄 [REFRESH] Novo token gerado com sucesso para user ID:', user.id);

        res.json({
            message: 'Token renovado com sucesso!',
            token: newToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                photo: user.photo
            }
        });
    } catch (error) {
        console.error('❌ [REFRESH] Erro ao renovar token:', error.message);
        res.status(500).json({ message: 'Erro ao renovar token.', error: error.message });
    }
};

const verify = async (req, res) => {
    try {
        // O middleware de autenticação já verifica o token
        // Se chegou aqui, o token é válido
        const userId = req.user.id; // Assume que o middleware adiciona isso

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        console.log('✅ [VERIFY] Token válido para user ID:', userId);

        res.json({
            message: 'Token válido!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                photo: user.photo
            }
        });
    } catch (error) {
        console.error('❌ [VERIFY] Erro ao verificar token:', error.message);
        res.status(500).json({ message: 'Erro ao verificar token.', error: error.message });
    }
};

module.exports = {
    register,
    login,
    refresh,
    verify,
};

