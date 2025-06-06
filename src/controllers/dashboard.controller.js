import httpStatus from 'http-status';
import { Lead, User, Product, Category, Transaction } from '../models/index.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getDashboardStats = catchAsync(async (req, res) => {
  // Get lead statistics
  const leadStats = await Lead.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get user statistics
  const userStats = await User.aggregate([
    {
      $group: {
        _id: '$kycStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get total counts
  const [
    totalLeads,
    totalUsers,
    totalProducts,
    totalCategories,
    totalTransactions,
    totalAmount
  ] = await Promise.all([
    Lead.countDocuments(),
    User.countDocuments(),
    Product.countDocuments(),
    Category.countDocuments(),
    Transaction.countDocuments(),
    Transaction.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ])
  ]);

  // Get recent leads
  const recentLeads = await Lead.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('agent', 'name email')
    .populate('category', 'name');

  // Get recent transactions
  const recentTransactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email');

  // Format lead stats
  const formattedLeadStats = {
    total: totalLeads,
    byStatus: leadStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    recent: recentLeads
  };

  // Format user stats
  const formattedUserStats = {
    total: totalUsers,
    byKycStatus: userStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
  };

  // Format transaction stats
  const formattedTransactionStats = {
    total: totalTransactions,
    totalAmount: totalAmount[0]?.total || 0,
    recent: recentTransactions
  };

  // Compile all stats
  const dashboardStats = {
    leads: formattedLeadStats,
    users: formattedUserStats,
    products: {
      total: totalProducts
    },
    categories: {
      total: totalCategories
    },
    transactions: formattedTransactionStats,
    summary: {
      totalLeads,
      totalUsers,
      totalProducts,
      totalCategories,
      totalTransactions,
      totalAmount: totalAmount[0]?.total || 0
    }
  };

  res.send(dashboardStats);
});

export const getLeadTrends = catchAsync(async (req, res) => {
  const { period = 'month' } = req.query;
  let dateFilter = {};

  // Set date filter based on period
  const now = new Date();
  if (period === 'week') {
    dateFilter = {
      createdAt: {
        $gte: new Date(now.setDate(now.getDate() - 7))
      }
    };
  } else if (period === 'month') {
    dateFilter = {
      createdAt: {
        $gte: new Date(now.setMonth(now.getMonth() - 1))
      }
    };
  } else if (period === 'year') {
    dateFilter = {
      createdAt: {
        $gte: new Date(now.setFullYear(now.getFullYear() - 1))
      }
    };
  }

  const leadTrends = await Lead.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  res.send(leadTrends);
});

export const getTransactionTrends = catchAsync(async (req, res) => {
  const { period = 'month' } = req.query;
  let dateFilter = {};

  // Set date filter based on period
  const now = new Date();
  if (period === 'week') {
    dateFilter = {
      createdAt: {
        $gte: new Date(now.setDate(now.getDate() - 7))
      }
    };
  } else if (period === 'month') {
    dateFilter = {
      createdAt: {
        $gte: new Date(now.setMonth(now.getMonth() - 1))
      }
    };
  } else if (period === 'year') {
    dateFilter = {
      createdAt: {
        $gte: new Date(now.setFullYear(now.getFullYear() - 1))
      }
    };
  }

  const transactionTrends = await Transaction.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  res.send(transactionTrends);
});

export const getKycStats = catchAsync(async (req, res) => {
  const kycStats = await User.aggregate([
    {
      $group: {
        _id: '$kycStatus',
        count: { $sum: 1 },
        users: {
          $push: {
            name: '$name',
            email: '$email',
            mobileNumber: '$mobileNumber',
            createdAt: '$createdAt'
          }
        }
      }
    }
  ]);

  res.send(kycStats);
}); 