import { Wallet, WalletTransaction } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Get or create a wallet for a user
 * @param {string} userId - User ID
 * @returns {Promise<Wallet>}
 */
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({
      user: userId,
      balance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      totalLeadsClosed: 0,
      totalLeadsCreated: 0,
      status: 'active',
    });
  }
  return wallet;
};

/**
 * Update wallet on lead creation
 * @param {string} userId - User ID
 * @returns {Promise<Wallet>}
 */
const updateWalletOnLeadCreation = async (userId) => {
  const wallet = await getOrCreateWallet(userId);
  wallet.totalLeadsCreated += 1;
  wallet.lastTransactionAt = new Date();
  await wallet.save();
  return wallet;
};

/**
 * Update wallet on lead closure
 * @param {string} userId - User ID
 * @param {number} amount - Commission amount
 * @param {string} commissionId - Commission ID
 * @param {string} leadId - Lead ID
 * @returns {Promise<Wallet>}
 */
const updateWalletOnLeadClosure = async (userId, amount, commissionId, leadId) => {
  const wallet = await getOrCreateWallet(userId);
  
  // Update wallet balance and statistics
  wallet.balance += amount;
  wallet.totalEarnings += amount;
  wallet.totalLeadsClosed += 1;
  wallet.lastTransactionAt = new Date();
  await wallet.save();

  // Create wallet transaction
  await WalletTransaction.create({
    wallet: wallet._id,
    type: 'commission',
    amount,
    balance: wallet.balance,
    status: 'completed',
    reference: commissionId,
    referenceModel: 'Commission',
    description: `Commission earned for closing lead ${leadId}`,
  });

  return wallet;
};

/**
 * Update wallet on withdrawal request
 * @param {string} userId - User ID
 * @param {number} amount - Withdrawal amount
 * @param {string} withdrawalRequestId - Withdrawal request ID
 * @returns {Promise<Wallet>}
 */
const updateWalletOnWithdrawalRequest = async (userId, amount, withdrawalRequestId) => {
  const wallet = await getOrCreateWallet(userId);
  
  if (wallet.balance < amount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient balance');
  }

  // Update wallet balance
  wallet.balance -= amount;
  wallet.totalWithdrawn += amount;
  wallet.lastTransactionAt = new Date();
  await wallet.save();

  // Create wallet transaction
  await WalletTransaction.create({
    wallet: wallet._id,
    type: 'withdrawal',
    amount,
    balance: wallet.balance,
    status: 'pending',
    reference: withdrawalRequestId,
    referenceModel: 'WithdrawalRequest',
    description: 'Withdrawal request created',
  });

  return wallet;
};

/**
 * Update wallet on commission approval
 * @param {string} userId - User ID
 * @param {number} amount - Commission amount
 * @param {string} commissionId - Commission ID
 * @param {string} leadId - Lead ID
 * @returns {Promise<Wallet>}
 */
const updateWalletOnCommissionApproval = async (userId, amount, commissionId, leadId) => {
  const wallet = await getOrCreateWallet(userId);
  
  // Update wallet balance and statistics
  wallet.balance += amount;
  wallet.totalEarnings += amount;
  wallet.totalLeadsClosed += 1;
  wallet.lastTransactionAt = new Date();
  await wallet.save();

  // Create wallet transaction
  await WalletTransaction.create({
    wallet: wallet._id,
    type: 'commission',
    amount,
    balance: wallet.balance,
    status: 'completed',
    reference: commissionId,
    referenceModel: 'Commission',
    description: `Commission approved and added to wallet for lead ${leadId}`,
  });

  return wallet;
};

/**
 * Reverse wallet update when commission is rejected/cancelled
 * @param {string} userId - User ID
 * @param {number} amount - Commission amount to reverse
 * @param {string} commissionId - Commission ID
 * @param {string} leadId - Lead ID
 * @returns {Promise<Wallet>}
 */
const reverseWalletOnCommissionRejection = async (userId, amount, commissionId, leadId) => {
  const wallet = await getOrCreateWallet(userId);
  
  // Reverse wallet balance and statistics
  wallet.balance -= amount;
  wallet.totalEarnings -= amount;
  wallet.totalLeadsClosed -= 1;
  wallet.lastTransactionAt = new Date();
  await wallet.save();

  // Create wallet transaction for reversal
  await WalletTransaction.create({
    wallet: wallet._id,
    type: 'commission_reversal',
    amount: -amount, // Negative amount to indicate reversal
    balance: wallet.balance,
    status: 'completed',
    reference: commissionId,
    referenceModel: 'Commission',
    description: `Commission rejected/cancelled - amount reversed for lead ${leadId}`,
  });

  return wallet;
};

/**
 * Update wallet on withdrawal rejection
 * @param {string} userId - User ID
 * @param {number} amount - Withdrawal amount
 * @param {string} withdrawalRequestId - Withdrawal request ID
 * @returns {Promise<Wallet>}
 */
const updateWalletOnWithdrawalRejection = async (userId, amount, withdrawalRequestId) => {
  const wallet = await getOrCreateWallet(userId);
  
  // Update wallet balance
  wallet.balance += amount;
  wallet.totalWithdrawn -= amount;
  wallet.lastTransactionAt = new Date();
  await wallet.save();

  // Create wallet transaction
  await WalletTransaction.create({
    wallet: wallet._id,
    type: 'refund',
    amount,
    balance: wallet.balance,
    status: 'completed',
    reference: withdrawalRequestId,
    referenceModel: 'WithdrawalRequest',
    description: 'Refund for rejected withdrawal request',
  });

  return wallet;
};

/**
 * Update wallet when commission amount changes for already approved commission
 * @param {string} userId - User ID
 * @param {number} amountDifference - Difference between new and old amount (can be positive or negative)
 * @param {string} commissionId - Commission ID
 * @param {string} leadId - Lead ID
 * @param {number} oldAmount - Previous commission amount
 * @param {number} newAmount - New commission amount
 * @returns {Promise<Wallet>}
 */
const updateWalletOnCommissionAmountChange = async (userId, amountDifference, commissionId, leadId, oldAmount, newAmount) => {
  const wallet = await getOrCreateWallet(userId);
  
  // Update wallet balance and statistics based on amount difference
  wallet.balance += amountDifference;
  wallet.totalEarnings += amountDifference;
  wallet.lastTransactionAt = new Date();
  await wallet.save();

  // Create wallet transaction for the amount change
  await WalletTransaction.create({
    wallet: wallet._id,
    type: amountDifference > 0 ? 'commission_adjustment' : 'commission_reduction',
    amount: amountDifference,
    balance: wallet.balance,
    status: 'completed',
    reference: commissionId,
    referenceModel: 'Commission',
    description: `Commission amount adjusted from ₹${oldAmount} to ₹${newAmount} for lead ${leadId}`,
    metadata: {
      oldAmount,
      newAmount,
      adjustmentType: amountDifference > 0 ? 'increase' : 'decrease',
      leadId
    }
  });

  return wallet;
};

/**
 * Get wallet statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
const getWalletStats = async (userId) => {
  const wallet = await getOrCreateWallet(userId);
  
  // Get recent transactions
  const recentTransactions = await WalletTransaction.find({ wallet: wallet._id })
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    wallet,
    recentTransactions,
  };
};

export default {
  getOrCreateWallet,
  updateWalletOnLeadCreation,
  updateWalletOnLeadClosure,
  updateWalletOnCommissionApproval,
  updateWalletOnCommissionAmountChange,
  reverseWalletOnCommissionRejection,
  updateWalletOnWithdrawalRequest,
  updateWalletOnWithdrawalRejection,
  getWalletStats,
}; 