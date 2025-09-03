import httpStatus from 'http-status';
import { Commission, User, Notification, Transaction } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import {catchAsync} from '../utils/catchAsync.js';
import walletService from '../services/wallet.service.js';

export const createCommission = catchAsync(async (req, res) => {
  console.log('Request body:', req.body);
  
  // Calculate amount based on baseAmount and tdsPercentage
  const baseAmount = req.body.baseAmount || 0;
  const tdsPercentage = req.body.tdsPercentage || 0;
  const amount = baseAmount - (baseAmount * tdsPercentage / 100);
  
  // Create commission with agent ID from authenticated user
  const commission = await Commission.create({
    ...req.body,
    agent: req.user.id, // Set agent ID from authenticated user
    amount: amount, // Auto-calculated amount
  });

  // Create notification for the agent
  await Notification.create({
    recipient: req.user.id,
    type: 'commission_earned',
    title: 'Commission Earned',
    message: `You have earned a commission of ₹${commission.amount} for the sale`,
    channels: ['in_app', 'email'],
    data: {
      commissionId: commission._id,
      amount: commission.amount,
    },
  });

  // Update wallet if commission is created with approved status
  if (commission.status === 'approved') {
    console.log('🔍 Commission created with approved status - updating wallet for agent:', commission.agent);
    
    try {
      const wallet = await walletService.updateWalletOnCommissionApproval(
        commission.agent,
        commission.amount,
        commission._id,
        commission.lead
      );

      // Create notification for wallet update
      await Notification.create({
        recipient: commission.agent,
        type: 'commission_approved',
        title: 'Commission Approved & Added to Wallet',
        message: `Your commission of ₹${commission.amount} has been approved and added to your wallet. New balance: ₹${wallet.balance}`,
        channels: ['in_app', 'email'],
        data: {
          commissionId: commission._id,
          amount: commission.amount,
          walletBalance: wallet.balance,
          status: commission.status,
        },
      });

      console.log('✅ Wallet updated successfully for commission created with approved status');
    } catch (error) {
      console.error('❌ Error updating wallet for commission created with approved status:', error);
      // Don't fail the commission creation if wallet update fails
    }
  }

  res.status(httpStatus.CREATED).send(commission);
});

export const getCommissions = catchAsync(async (req, res) => {
  const filter = {};
  const options = {
    populate: 'agent product lead',
    sortBy: req.query.sortBy || 'createdAt',
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1,
  };

  // Filter by agent if not admin - allow admins to see all commissions
  if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
    filter.agent = req.user.id;
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  console.log('🔍 Commission filter:', filter);
  console.log('🔍 Commission options:', options);
  console.log('🔍 User role:', req.user.role);

  const commissions = await Commission.paginate(filter, options);
  
  console.log('🔍 Commissions found:', commissions.totalResults);
  console.log('🔍 First commission:', commissions.results[0]);
  
  res.send(commissions);
});

export const getCommission = catchAsync(async (req, res) => {
  const commission = await Commission.findById(req.params.commissionId)
    .populate('product', 'name commission')
    .populate('paymentDetails.bankAccount', 'accountHolderName accountNumber bankName');
    
  if (!commission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Commission not found');
  }
  if (commission.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  res.send(commission);
});

export const updateCommission = catchAsync(async (req, res) => {
  const commission = await Commission.findById(req.params.commissionId);
  if (!commission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Commission not found');
  }
  if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can update commissions');
  }

  const oldStatus = commission.status;
  const oldAmount = commission.amount;
  
  // Store original values for comparison
  const originalCommission = {
    amount: commission.amount,
    baseAmount: commission.baseAmount,
    tdsPercentage: commission.tdsPercentage
  };

  // Update commission fields
  Object.assign(commission, req.body);
  
  // If amount-related fields are updated, recalculate the amount
  if (req.body.baseAmount !== undefined || req.body.tdsPercentage !== undefined) {
    const newBaseAmount = req.body.baseAmount !== undefined ? req.body.baseAmount : commission.baseAmount;
    const newTdsPercentage = req.body.tdsPercentage !== undefined ? req.body.tdsPercentage : commission.tdsPercentage;
    
    // Recalculate commission amount: baseAmount - (baseAmount * tdsPercentage / 100)
    const newAmount = newBaseAmount - (newBaseAmount * newTdsPercentage / 100);
    
    commission.amount = newAmount;
    commission.baseAmount = newBaseAmount;
    commission.tdsPercentage = newTdsPercentage;
    
    console.log('🔍 Commission amount recalculated:', {
      oldAmount: originalCommission.amount,
      newAmount: newAmount,
      baseAmount: newBaseAmount,
      tdsPercentage: newTdsPercentage,
      tdsDeduction: newBaseAmount * newTdsPercentage / 100
    });

    // Update wallet if commission was already approved and amount changed
    if (commission.status === 'approved' && Math.abs(oldAmount - newAmount) > 0.01) {
      console.log('🔍 Commission amount changed for approved commission - updating wallet');
      
      try {
        const amountDifference = newAmount - oldAmount;
        
        // Generic amount change due to baseAmount or TDS percentage change
        const wallet = await walletService.updateWalletOnCommissionAmountChange(
          commission.agent,
          amountDifference,
          commission._id,
          commission.lead,
          oldAmount,
          newAmount
        );
        console.log('✅ Wallet updated for commission amount change:', {
          agent: commission.agent,
          oldAmount,
          newAmount: newAmount,
          difference: amountDifference,
          newWalletBalance: wallet.balance
        });
      } catch (error) {
        console.error('❌ Error updating wallet for commission amount change:', error);
        // Don't fail the commission update if wallet update fails
      }
    }
  }
  
  await commission.save();

  // Create notification if status changed
  if (oldStatus !== commission.status) {
    await Notification.create({
      recipient: commission.agent,
      type: 'commission_status_change',
      title: 'Commission Status Updated',
      message: `Your commission status has been updated to: ${commission.status}`,
      channels: ['in_app', 'email'],
      data: {
        commissionId: commission._id,
        oldStatus,
        newStatus: commission.status,
      },
    });

    // Update wallet only when commission is approved
    if (commission.status === 'approved' && oldStatus !== 'approved') {
      console.log('🔍 Commission approved - updating wallet for agent:', commission.agent);
      
      try {
        // Update wallet with approved commission amount
        const wallet = await walletService.updateWalletOnCommissionApproval(
          commission.agent,
          commission.amount,
          commission._id,
          commission.lead
        );

        // Create notification for wallet update
        await Notification.create({
          recipient: commission.agent,
          type: 'commission_approved',
          title: 'Commission Approved & Added to Wallet',
          message: `Your commission of ₹${commission.amount} has been approved and added to your wallet. New balance: ₹${wallet.balance}`,
          channels: ['in_app', 'email'],
          data: {
            commissionId: commission._id,
            amount: commission.amount,
            walletBalance: wallet.balance,
            oldStatus,
            newStatus: commission.status,
          },
        });

        console.log('✅ Wallet updated successfully for approved commission');
      } catch (error) {
        console.error('❌ Error updating wallet for approved commission:', error);
        // Don't fail the commission update if wallet update fails
        // The commission is still approved, just the wallet update failed
      }
    }

    // Handle commission rejection/cancellation - reverse wallet update if it was previously approved
    if ((commission.status === 'rejected' || commission.status === 'cancelled') && oldStatus === 'approved') {
      console.log('🔍 Commission rejected/cancelled - reversing wallet update for agent:', commission.agent);
      
      try {
        let wallet;
        
        if (commission.status === 'cancelled') {
          // Use specific cancellation function for better tracking
          const cancellationReason = req.body.cancellationReason || 'Admin cancellation';
          wallet = await walletService.updateWalletOnCommissionCancellation(
            commission.agent,
            oldAmount,
            commission._id,
            commission.lead,
            cancellationReason
          );
        } else {
          // Use rejection function for rejected commissions
          wallet = await walletService.reverseWalletOnCommissionRejection(
            commission.agent,
            oldAmount,
            commission._id,
            commission.lead
          );
        }

        // Create notification for wallet reversal
        await Notification.create({
          recipient: commission.agent,
          type: 'commission_rejected',
          title: 'Commission Rejected - Wallet Updated',
          message: `Your commission of ₹${oldAmount} has been ${commission.status}. Amount has been removed from your wallet. New balance: ₹${wallet.balance}`,
          channels: ['in_app', 'email'],
          data: {
            commissionId: commission._id,
            amount: oldAmount,
            walletBalance: wallet.balance,
            oldStatus,
            newStatus: commission.status,
          },
        });

        console.log('✅ Wallet reversed successfully for rejected/cancelled commission');
      } catch (error) {
        console.error('❌ Error reversing wallet for rejected/cancelled commission:', error);
        // Don't fail the commission update if wallet reversal fails
      }
    }

    // Handle commission status change from 'paid' to other statuses
    if (oldStatus === 'paid' && commission.status !== 'paid') {
      console.log('🔍 Commission status changed from paid - updating wallet for agent:', commission.agent);
      
      try {
        // Reverse wallet update for paid commission that is no longer paid
        const wallet = await walletService.reverseWalletOnCommissionRejection(
          commission.agent,
          oldAmount, // Use old amount since commission was paid with that amount
          commission._id,
          commission.lead
        );

        // Create notification for wallet reversal
        await Notification.create({
          recipient: commission.agent,
          type: 'commission_status_change',
          title: 'Commission Status Changed from Paid',
          message: `Your commission of ₹${oldAmount} status has changed from paid to ${commission.status}. Amount has been removed from your wallet. New balance: ₹${wallet.balance}`,
          channels: ['in_app', 'email'],
          data: {
            commissionId: commission._id,
            amount: oldAmount,
            walletBalance: wallet.balance,
            oldStatus,
            newStatus: commission.status,
          },
        });

        console.log('✅ Wallet reversed successfully for commission status change from paid');
      } catch (error) {
        console.error('❌ Error reversing wallet for commission status change from paid:', error);
        // Don't fail the commission update if wallet reversal fails
      }
    }
  }

  // Create notification if amount changed significantly
  if (Math.abs(oldAmount - commission.amount) > 1) { // More than ₹1 difference
    await Notification.create({
      recipient: commission.agent,
      type: 'commission_amount_change',
      title: 'Commission Amount Updated',
      message: `Your commission amount has been updated from ₹${oldAmount} to ₹${commission.amount}`,
      channels: ['in_app', 'email'],
      data: {
        commissionId: commission._id,
        oldAmount,
        newAmount: commission.amount,
        reason: req.body.reason || 'Admin adjustment'
      },
    });
  }

  // Log the update for audit
  console.log('🔍 Commission updated:', {
    commissionId: commission._id,
    oldValues: originalCommission,
    newValues: {
      amount: commission.amount,
      percentage: commission.percentage,
      baseAmount: commission.baseAmount,
      bonus: commission.bonus
    },
    updatedBy: req.user.id,
    updatedAt: new Date()
  });

  res.send(commission);
});

export const updateCommissionAmount = catchAsync(async (req, res) => {
  const { commissionId } = req.params;
  const { baseAmount, tdsPercentage, reason } = req.body;

  // Only admins can update commission amounts
  if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can update commission amounts');
  }

  const commission = await Commission.findById(commissionId);
  if (!commission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Commission not found');
  }

  // Store original values
  const originalValues = {
    amount: commission.amount,
    baseAmount: commission.baseAmount,
    tdsPercentage: commission.tdsPercentage
  };

  // Update fields if provided
  if (baseAmount !== undefined) commission.baseAmount = baseAmount;
  if (tdsPercentage !== undefined) commission.tdsPercentage = tdsPercentage;

  // Recalculate total amount: baseAmount - (baseAmount * tdsPercentage / 100)
  const newAmount = commission.baseAmount - (commission.baseAmount * commission.tdsPercentage / 100);
  commission.amount = newAmount;

  // Validate the new amount
  if (newAmount < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Commission amount cannot be negative');
  }

  // Update wallet if commission was already approved and amount changed
  if (commission.status === 'approved' && Math.abs(originalValues.amount - newAmount) > 0.01) {
    console.log('🔍 Commission amount changed for approved commission - updating wallet');
    
    try {
      const amountDifference = newAmount - originalValues.amount;
      const wallet = await walletService.updateWalletOnCommissionAmountChange(
        commission.agent,
        amountDifference,
        commission._id,
        commission.lead,
        originalValues.amount,
        newAmount
      );

      console.log('✅ Wallet updated for commission amount change:', {
        agent: commission.agent,
        oldAmount: originalValues.amount,
        newAmount: newAmount,
        difference: amountDifference,
        newWalletBalance: wallet.balance
      });
    } catch (error) {
      console.error('❌ Error updating wallet for commission amount change:', error);
      // Don't fail the commission update if wallet update fails
    }
  }

  await commission.save();

  // Create detailed audit log
  console.log('🔍 Commission amount updated:', {
    commissionId: commission._id,
    oldValues: originalValues,
    newValues: {
      amount: commission.amount,
      percentage: commission.percentage,
      baseAmount: commission.baseAmount,
      bonus: commission.bonus
    },
    reason: reason || 'Admin adjustment',
    updatedBy: req.user.id,
    updatedAt: new Date()
  });

  // Notify agent about amount change
  if (Math.abs(originalValues.amount - commission.amount) > 1) {
    await Notification.create({
      recipient: commission.agent,
      type: 'commission_amount_change',
      title: 'Commission Amount Updated',
      message: `Your commission amount has been updated from ₹${originalValues.amount} to ₹${commission.amount}`,
      channels: ['in_app', 'email'],
      data: {
        commissionId: commission._id,
        oldAmount: originalValues.amount,
        newAmount: commission.amount,
        reason: reason || 'Admin adjustment',
        updatedBy: req.user.id
      },
    });
  }

  res.send({
    message: 'Commission amount updated successfully',
    commission,
    changes: {
      oldAmount: originalValues.amount,
      newAmount: commission.amount,
      oldPercentage: originalValues.percentage,
      newPercentage: commission.percentage,
      oldBaseAmount: originalValues.baseAmount,
      newBaseAmount: commission.baseAmount,
      oldBonus: originalValues.bonus,
      newBonus: commission.bonus
    }
  });
});

export const updatePaymentDetails = catchAsync(async (req, res) => {
  const { commissionId } = req.params;
  const { 
    paymentMethod, 
    bankAccount, 
    transactionId, 
    paymentDate,
    notes,
    reason 
  } = req.body;

  // Only admins can update payment details
  if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can update payment details');
  }

  const commission = await Commission.findById(commissionId);
  if (!commission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Commission not found');
  }

  // Store original payment details for audit
  const originalPaymentDetails = { ...commission.paymentDetails };

  // Update payment details
  commission.paymentDetails = {
    bankAccount: bankAccount || commission.paymentDetails?.bankAccount,
    transactionId: transactionId || commission.paymentDetails?.transactionId,
    paymentDate: paymentDate ? new Date(paymentDate) : commission.paymentDetails?.paymentDate || new Date(),
    paymentMethod: paymentMethod || commission.paymentDetails?.paymentMethod || 'bank_transfer',
  };

  // Add notes if provided
  if (notes) {
    if (!commission.metadata) commission.metadata = new Map();
    commission.metadata.set('paymentUpdateNotes', notes);
    commission.metadata.set('paymentUpdateReason', reason || 'Admin updated payment details');
    commission.metadata.set('updatedBy', req.user.id);
    commission.metadata.set('updatedAt', new Date());
  }

  await commission.save();

  // Create notification for the agent about payment details update
  await Notification.create({
    recipient: commission.agent,
    type: 'payout_processed',
    title: 'Payment Details Updated',
    message: `Payment details for your commission of ₹${commission.amount} have been updated`,
    channels: ['in_app', 'email'],
    data: {
      commissionId: commission._id,
      amount: commission.amount,
      paymentMethod: commission.paymentDetails.paymentMethod,
      transactionId: commission.paymentDetails.transactionId,
      paymentDate: commission.paymentDetails.paymentDate,
    },
  });

  // Log the payment details update for audit
  console.log('🔍 Commission payment details updated:', {
    commissionId: commission._id,
    agent: commission.agent,
    oldPaymentDetails: originalPaymentDetails,
    newPaymentDetails: commission.paymentDetails,
    updatedBy: req.user.id,
    updatedAt: new Date(),
    notes,
    reason
  });

  res.send({
    message: 'Payment details updated successfully',
    commission,
    changes: {
      oldPaymentDetails: originalPaymentDetails,
      newPaymentDetails: commission.paymentDetails,
    }
  });
});

export const processPayout = catchAsync(async (req, res) => {
  const { commissionId } = req.params;
  const { 
    paymentMethod, 
    bankAccount, 
    transactionId, 
    paymentDate,
    notes,
    reason 
  } = req.body;

  // Only admins can process payouts
  if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can process payouts');
  }

  const commission = await Commission.findById(commissionId);
  if (!commission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Commission not found');
  }

  // Check if commission can be paid
  if (commission.status === 'paid') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Commission is already paid');
  }
  
  if (commission.status === 'cancelled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot pay cancelled commission');
  }

  // Update commission status to paid
  commission.status = 'paid';
  
  // Update payment details
  commission.paymentDetails = {
    bankAccount: bankAccount || commission.paymentDetails?.bankAccount,
    transactionId: transactionId || commission.paymentDetails?.transactionId,
    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    paymentMethod: paymentMethod || commission.paymentDetails?.paymentMethod || 'bank_transfer',
  };

  // Add notes if provided
  if (notes) {
    if (!commission.metadata) commission.metadata = new Map();
    commission.metadata.set('payoutNotes', notes);
    commission.metadata.set('payoutReason', reason || 'Admin processed payout');
    commission.metadata.set('processedBy', req.user.id);
    commission.metadata.set('processedAt', new Date());
  }

  await commission.save();

  // Create transaction record
  const transaction = await Transaction.create({
    agent: commission.agent,
    type: 'payout',
    amount: commission.amount,
    status: 'completed',
    reference: commission._id,
    referenceModel: 'Commission',
    paymentMethod: commission.paymentDetails.paymentMethod,
    bankAccount: commission.paymentDetails.bankAccount,
    transactionId: commission.paymentDetails.transactionId,
    description: `Commission payout for lead ${commission.lead}`,
    processedBy: req.user.id,
    processedAt: new Date(),
    notes: [{
      content: notes || `Commission payout processed by ${req.user.role}`,
      createdBy: req.user.id,
      createdAt: new Date(),
    }],
  });

  // Create notification for the agent
  await Notification.create({
    recipient: commission.agent,
    type: 'payout_processed',
    title: 'Commission Payout Processed',
    message: `Your commission payout of ₹${commission.amount} has been processed successfully`,
    channels: ['in_app', 'email'],
    data: {
      commissionId: commission._id,
      transactionId: transaction._id,
      amount: commission.amount,
      paymentMethod: commission.paymentDetails.paymentMethod,
      paymentDate: commission.paymentDetails.paymentDate,
    },
  });

  // Log the payout for audit
  console.log('🔍 Commission payout processed:', {
    commissionId: commission._id,
    agent: commission.agent,
    amount: commission.amount,
    paymentMethod: commission.paymentDetails.paymentMethod,
    transactionId: commission.paymentDetails.transactionId,
    processedBy: req.user.id,
    processedAt: new Date(),
    notes,
    reason
  });

  res.send({
    message: 'Commission payout processed successfully',
    commission,
    transaction,
    paymentDetails: {
      paymentMethod: commission.paymentDetails.paymentMethod,
      transactionId: commission.paymentDetails.transactionId,
      paymentDate: commission.paymentDetails.paymentDate,
      bankAccount: commission.paymentDetails.bankAccount,
    }
  });
});

export const getCommissionStats = catchAsync(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'admin') {
    filter.agent = req.user.id;
  }

  const stats = await Commission.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  res.send(stats);
});

export const getAgentCommissions = catchAsync(async (req, res) => {
  const { agentId } = req.params;
  const agent = await User.findById(agentId);
  if (!agent) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Agent not found');
  }

  const filter = { agent: agentId };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  const options = {
    sortBy: req.query.sortBy || 'createdAt:desc',
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1,
    populate: 'product paymentDetails.bankAccount',
    select: 'product.name product.commission paymentDetails.bankAccount.accountHolderName paymentDetails.bankAccount.accountNumber paymentDetails.bankAccount.bankName',
  };

  const commissions = await Commission.paginate(filter, options);
  res.send(commissions);
});

export default {
  createCommission,
  getCommissions,
  getCommission,
  updateCommission,
  updateCommissionAmount,
  updatePaymentDetails,
  processPayout,
  getCommissionStats,
  getAgentCommissions,
}; 