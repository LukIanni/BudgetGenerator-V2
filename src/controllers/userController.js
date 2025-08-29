const User = require('../models/user');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    // The user object is attached to the request by the protect middleware
    const user = req.user;

    if (user) {
        // Here you could also fetch related data, like budgets
        // For now, we just return the user data
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            // Budgets would go here, e.g., budgets: await user.getBudgets()
        });
    } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
    }
};

module.exports = {
    getUserProfile,
};
