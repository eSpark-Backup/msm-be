const Group = require('../models/Group');

// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, description, customer_name, all_user, permissions } = req.body;

    // Validate required fields
    if (!name || !customer_name) {
      return res.status(400).json({
        success: false,
        message: 'Name and customer_name are required'
      });
    }

    // Check if group with same name exists for this customer
    const existingGroup = await Group.findOne({ name, customer_name });
    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: 'Group with this name already exists for this customer'
      });
    }

    const group = new Group({
      name,
      description,
      customer_name,
      all_user: all_user || false,
      permissions: permissions || 'read'
    });

    const savedGroup = await group.save();

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: savedGroup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating group',
      error: error.message
    });
  }
};

// Get all groups
const getAllGroups = async (req, res) => {
  try {
    const { customer_name, permissions, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (customer_name) filter.customer_name = customer_name;
    if (permissions) filter.permissions = permissions;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const groups = await Group.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Group.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Groups retrieved successfully',
      data: {
        groups,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving groups',
      error: error.message
    });
  }
};

// Get group by ID
const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Group retrieved successfully',
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving group',
      error: error.message
    });
  }
};

// Update group
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, customer_name, all_user, permissions } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if updating name would create duplicate
    if (name && name !== group.name) {
      const existingGroup = await Group.findOne({ 
        name, 
        customer_name: customer_name || group.customer_name,
        _id: { $ne: id }
      });
      if (existingGroup) {
        return res.status(400).json({
          success: false,
          message: 'Group with this name already exists for this customer'
        });
      }
    }

    // Update fields
    if (name !== undefined) group.name = name;
    if (description !== undefined) group.description = description;
    if (customer_name !== undefined) group.customer_name = customer_name;
    if (all_user !== undefined) group.all_user = all_user;
    if (permissions !== undefined) group.permissions = permissions;

    const updatedGroup = await group.save();

    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      data: updatedGroup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating group',
      error: error.message
    });
  }
};

// Delete group
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    await Group.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Group deleted successfully',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting group',
      error: error.message
    });
  }
};

// Get groups by customer
const getGroupsByCustomer = async (req, res) => {
  try {
    const { customer_name } = req.params;

    const groups = await Group.find({ customer_name }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Groups retrieved successfully',
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving groups by customer',
      error: error.message
    });
  }
};

module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  getGroupsByCustomer
};
