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

// @desc    Update user password
// @route   PUT /api/users/profile/password
// @access  Private
const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Por favor, forneça a senha antiga e a nova senha.' });
    }

    const user = await User.findByPk(req.user.id);

    if (user && (await bcrypt.compare(oldPassword, user.password))) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Senha alterada com sucesso.' });
    } else {
        res.status(401).json({ message: 'Senha antiga incorreta.' });
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
    updateUserPassword,
    updateUserProfilePhoto,
    deleteUserAccount,
};
