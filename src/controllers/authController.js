const User = require('../models/user');
const bcrypt = require('bcryptjs');

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
        // Cria o novo usuário
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({ message: 'Usuário criado com sucesso!', userId: newUser.id });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar usuário.', error: error.message });
    }

};

module.exports = {
    register,
};

