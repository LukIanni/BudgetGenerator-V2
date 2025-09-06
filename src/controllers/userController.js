const User = require('../models/user');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const Produto = require('../models/produto');
const Servico = require('../models/servico');

const defaultPhotoPath = '/images/testeusuario.jpeg';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [
                { model: Produto },
                { model: Servico }
            ]
        });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Update user profile (email, password)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        if (email) {
            user.email = email;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            message: 'Perfil atualizado com sucesso.'
        });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o perfil.' });
    }
};

// @desc    Update user profile photo
// @route   POST /api/users/profile/photo
// @access  Private
const updateUserProfilePhoto = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (user) {
            if (req.file) {
                // Deleta a foto antiga se não for a padrão
                if (user.photo && user.photo !== defaultPhotoPath) {
                    const oldPhotoPath = path.join(__dirname, '..', 'public', user.photo);
                    if (fs.existsSync(oldPhotoPath)) {
                        fs.unlinkSync(oldPhotoPath);
                    }
                }

                user.photo = `/uploads/${req.file.filename}`;
                await user.save();
                res.json({ 
                    message: 'Foto de perfil atualizada com sucesso.',
                    photo: user.photo
                });
            } else {
                res.status(400).json({ message: 'Nenhum arquivo de imagem enviado.' });
            }
        } else {
            res.status(404).json({ message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao atualizar a foto.' });
    }
};

// @desc    Delete user profile photo
// @route   DELETE /api/users/profile/photo
// @access  Private
const deleteUserProfilePhoto = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Deleta o arquivo de foto antigo, se existir e não for o padrão
        if (user.photo && user.photo !== defaultPhotoPath) {
            const oldPhotoPath = path.join(__dirname, '..', 'public', user.photo);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        // Restaura para a foto padrão
        user.photo = defaultPhotoPath;
        await user.save();

        res.json({ 
            message: 'Foto de perfil removida com sucesso.',
            photo: user.photo // Retorna o caminho da nova foto padrão
        });

    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao remover a foto.' });
    }
};


// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserAccount = async (req, res) => {
    const user = await User.findByPk(req.user.id);

    if (user) {
        await user.destroy();
        res.json({ message: 'Conta de usuário excluída com sucesso.' });
    } else {
        res.status(404).json({ message: 'Usuário não encontrado.' });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    updateUserProfilePhoto,
    deleteUserProfilePhoto,
    deleteUserAccount,
};