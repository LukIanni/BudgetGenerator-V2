// Função para cadastro do usúario
const register = (req, res) => {

    //Pega os dados da requisição 
    const {nome, email, senha, confirmarSenha} = req.body;

    //Verificando se existe campos em branco
    if(!nome || !email || !senha || !confirmarSenha){
        return res.status(400).json({mensagem: 'existem campos não preenchidos'})
    }

    //Confere a confirnação de senha do usuário
    if(confirmarSenha !== senha){
        res.status(400).json({mensagem: 'senhas diferentes'});
        return
    }
        
    
    
    return res.status(200).json({mensagem: 'usuario cadastrado'});

};

module.exports = {
    register,
};

