const express = require('express');
const router = express.Router();
const {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  getGroupsByCustomer
} = require('../controllers/groupController');

// ===== GROUP CRUD ROUTES =====

/**
 * @route POST /api/groups
 * @description Create a new group
 * @access Public
 */
router.post('/', createGroup);

/**
 * @route GET /api/groups
 * @description Get all groups with optional filtering and pagination
 * @query customer_name - Filter by customer name
 * @query permissions - Filter by permissions (read, write, others)
 * @query page - Page number for pagination (default: 1)
 * @query limit - Items per page (default: 10)
 * @access Public
 */
router.get('/', getAllGroups);

/**
 * @route GET /api/groups/:id
 * @description Get a specific group by ID
 * @access Public
 */
router.get('/:id', getGroupById);

/**
 * @route PUT /api/groups/:id
 * @description Update a group by ID
 * @access Public
 */
router.put('/:id', updateGroup);

/**
 * @route DELETE /api/groups/:id
 * @description Delete a group by ID
 * @access Public
 */
router.delete('/:id', deleteGroup);

/**
 * @route GET /api/groups/customer/:customer_name
 * @description Get all groups for a specific customer
 * @access Public
 */
router.get('/customer/:customer_name', getGroupsByCustomer);

module.exports = router;
