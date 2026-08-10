const Dashboard = require('../models/Dashboard');

exports.getDashboard = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 0; 
    const skip = limitNum ? (pageNum - 1) * limitNum : 0;

    const dashboards = await Dashboard.find(query)
      .populate("groups")
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: dashboards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboards",
      error: error.message,
    });
  }
};


exports.getDashboardById = async (req, res) => {
  try {
    const dashboard = await Dashboard.findById(req.params.id).populate('groups');
    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found',
      });
    }
    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard',
      error: error.message,
    });
  }
};

exports.createDashboard = async (req, res) => {
  try {
    const dashboard = await Dashboard.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Dashboard created successfully',
      data: dashboard,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating dashboard',
      error: error.message,
    });
  }
};

exports.updateDashboard = async (req, res) => {
  try {
    const dashboard = await Dashboard.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Dashboard updated successfully',
      data: dashboard,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating dashboard',
      error: error.message,
    });
  }
};

exports.deleteDashboard = async (req, res) => {
  try {
    const dashboard = await Dashboard.findByIdAndDelete(req.params.id);
    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Dashboard deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting dashboard',
      error: error.message,
    });
  }
};
