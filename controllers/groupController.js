const Group = require('../models/Group');

const createGroup = async (req, res) => {
  try {
    const user_id = req.user._id;
    const group = new Group({
      ...req.body,
      user_id
    })
    await group.save()
    res.status(201).json({
      success: true,
      message: 'Group Created Successfully',
      data: group
    })
  } catch (error) {
    console.log('Error Creating Group : ', error)
    res.status(500).json({
      success: false,
      message: 'Error Creating Group',
      error: error.message
    })
  }
};

const getAllGroups = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    const user_id = req.user._id;
    const query = { user_id: user_id };

    if (search) {
      query.name = { $regex: search, $options: "i" }; 
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 0;
    const skip = limitNum ? (pageNum - 1) * limitNum : 0;

    const groups = await Group.find(query).skip(skip).limit(limitNum);

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error("Error Getting Groups:", error);
    res.status(500).json({
      success: false,
      message: "Error Getting Groups",
      error: error.message,
    });
  }
};


const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
    res.status(200).json({
      success: true,
      message: 'Group Found Successfully',
      data: group
    })
  } catch (error) {
    console.log('Error Getting Group By Id : ', error)
    res.status(500).json({
      success: false,
      message: 'Error Getting Group By Id',
      error: error.message
    })
  }
};

const updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(200).json({
      success: true,
      message: 'Group Updated Successfully',
      data: group
    })
  } catch (error) {
    console.log('Error Updating Group : ', error)
    res.status(500).json({
      success: false,
      message: 'Error Updating Group',
      error: error.message
    })
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id)
    res.status(200).json({
      success: true,
      message: 'Group Deleted Successfully',
      data: group
    })
  } catch (error) {
    console.log('Error Deleting Group : ', error)
    res.status(500).json({
      success: false,
      message: 'Error Deleting Group',
      error: error.message
    })
  }
};


module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
};
