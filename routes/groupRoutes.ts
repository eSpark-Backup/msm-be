const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
} = require('../controllers/groupController');


router.post('/', verifyToken, createGroup);

router.get('/', verifyToken, getAllGroups);

router.get('/:id', verifyToken, getGroupById);

router.put('/:id', verifyToken, updateGroup);

router.delete('/:id', verifyToken, deleteGroup);

module.exports = router;
