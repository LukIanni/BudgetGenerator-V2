const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Função para cadastro do usúario
const register = async (req, res) => {

    //Pega os dados da requisição 
    const {name, email, password, confirmpassword} = req.body;

    //Verificando se existe campos em branco
    if(!name || !email || !password || !confirmpassword){
        return res.status(400).json({mensagem: 'existem campos não preenchidos'})
    }

    //Confere a confirnação de senha do usuário
    if(confirmpassword !== password){
        res.status(400).json({mensagem: 'senhas diferentes'});
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
            token: token 
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

        res.json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
};

module.exports = {
    register,
    login,
};

