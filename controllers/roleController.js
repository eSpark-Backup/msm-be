const Role = require('../models/Role');

// @desc    Create a new role
// @route   POST /api/role
// @access  Private/Admin
exports.createRole = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if role already exists
        const roleExists = await Role.findOne({ name });
        if (roleExists) {
            return res.status(400).json({
                success: false,
                message: 'Role already exists'
            });
        }

        // Create new role
        const role = await Role.create({
            name,
        });

        res.status(201).json({
            success: true,
            data: role
        });
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all roles
// @route   GET /api/role
// @access  Private/Admin
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find({}).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: roles.length,
            data: roles
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get single role by ID
// @route   GET /api/role/:id
// @access  Private/Admin
exports.getRoleById = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        res.status(200).json({
            success: true,
            data: role
        });
    } catch (error) {
        console.error('Error fetching role:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update role
// @route   PUT /api/role/:id
// @access  Private/Admin
exports.updateRole = async (req, res) => {
    try {
        const { name } = req.body;
        
        let role = await Role.findById(req.params.id);
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        // Check if name is being updated and if it already exists
        if (name && name !== role.name) {
            const roleExists = await Role.findOne({ name });
            if (roleExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Role with this name already exists'
                });
            }
        }

        // Update role
        role.name = name || role.name;
        
        await role.save();

        res.status(200).json({
            success: true,
            data: role
        });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Delete role
// @route   DELETE /api/role/:id
// @access  Private/Admin
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        await role.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Role deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
