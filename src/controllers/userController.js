const User = require('../models/user');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = req.user;
    if (user) {
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo
        });
    } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
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
    const user = await User.findByPk(req.user.id);

    if (user) {
        if (req.file) {
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
    deleteUserAccount,
};