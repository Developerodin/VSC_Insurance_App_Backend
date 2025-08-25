import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/app.js';
import { setupTestDB } from '../utils/setupTestDB.js';
import { Commission, User, Wallet, WalletTransaction } from '../../src/models/index.js';
import { generateAuthTokens } from '../../src/services/token.service.js';

setupTestDB();

describe('Commission Wallet Updates', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;
  let commission;
  let wallet;

  beforeEach(async () => {
    // Create admin user
    adminUser = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      name: 'Admin User',
      role: 'admin',
      isEmailVerified: true,
    });

    // Create regular user
    regularUser = await User.create({
      email: 'user@test.com',
      password: 'password123',
      name: 'Regular User',
      role: 'user',
      isEmailVerified: true,
    });

    // Generate tokens
    adminToken = generateAuthTokens(adminUser).access.token;
    userToken = generateAuthTokens(regularUser).access.token;

    // Create or get wallet for regular user
    wallet = await Wallet.findOne({ user: regularUser._id });
    if (!wallet) {
      wallet = await Wallet.create({
        user: regularUser._id,
        balance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
        totalLeadsClosed: 0,
        totalLeadsCreated: 0,
        status: 'active',
      });
    }

    // Create a test commission
    commission = await Commission.create({
      agent: regularUser._id,
      product: new mongoose.Types.ObjectId(),
      lead: new mongoose.Types.ObjectId(),
      amount: 100,
      percentage: 10,
      baseAmount: 1000,
      bonus: 0,
      status: 'pending',
    });
  });

  describe('POST /v1/commissions', () => {
    it('should update wallet when commission is created with approved status', async () => {
      const initialBalance = wallet.balance;
      
      const response = await request(app)
        .post('/v1/commissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          agent: regularUser._id,
          product: new mongoose.Types.ObjectId(),
          lead: new mongoose.Types.ObjectId(),
          amount: 150,
          percentage: 15,
          baseAmount: 1000,
          bonus: 0,
          status: 'approved',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('approved');

      // Check if wallet was updated
      const updatedWallet = await Wallet.findOne({ user: regularUser._id });
      expect(updatedWallet.balance).toBe(initialBalance + 150);
      expect(updatedWallet.totalEarnings).toBe(initialBalance + 150);

      // Check if wallet transaction was created
      const transaction = await WalletTransaction.findOne({
        wallet: updatedWallet._id,
        type: 'commission',
        amount: 150,
      });
      expect(transaction).toBeTruthy();
    });
  });

  describe('PATCH /v1/commissions/:commissionId', () => {
    it('should update wallet when commission status changes to approved', async () => {
      const initialBalance = wallet.balance;
      
      const response = await request(app)
        .patch(`/v1/commissions/${commission._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');

      // Check if wallet was updated
      const updatedWallet = await Wallet.findOne({ user: regularUser._id });
      expect(updatedWallet.balance).toBe(initialBalance + 100);
      expect(updatedWallet.totalEarnings).toBe(initialBalance + 100);
    });

    it('should update wallet when commission amount changes for approved commission', async () => {
      // First approve the commission
      await Commission.findByIdAndUpdate(commission._id, { status: 'approved' });
      
      const initialBalance = wallet.balance + 100; // Previous balance + commission amount
      
      const response = await request(app)
        .patch(`/v1/commissions/${commission._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          percentage: 15, // Increase from 10% to 15%
        });

      expect(response.status).toBe(200);
      expect(response.body.percentage).toBe(15);
      expect(response.body.amount).toBe(150); // 15% of 1000

      // Check if wallet was updated with the difference
      const updatedWallet = await Wallet.findOne({ user: regularUser._id });
      expect(updatedWallet.balance).toBe(initialBalance + 50); // +50 difference
      expect(updatedWallet.totalEarnings).toBe(initialBalance + 50);
    });

    it('should reverse wallet when commission status changes from approved to rejected', async () => {
      // First approve the commission
      await Commission.findByIdAndUpdate(commission._id, { status: 'approved' });
      const initialBalance = wallet.balance + 100;
      
      const response = await request(app)
        .patch(`/v1/commissions/${commission._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'rejected',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('rejected');

      // Check if wallet was reversed
      const updatedWallet = await Wallet.findOne({ user: regularUser._id });
      expect(updatedWallet.balance).toBe(initialBalance - 100);
      expect(updatedWallet.totalEarnings).toBe(initialBalance - 100);
    });
  });

  describe('PATCH /v1/commissions/:commissionId/amount', () => {
    it('should update wallet when commission amount changes for approved commission', async () => {
      // First approve the commission
      await Commission.findByIdAndUpdate(commission._id, { status: 'approved' });
      
      const initialBalance = wallet.balance + 100; // Previous balance + commission amount
      
      const response = await request(app)
        .patch(`/v1/commissions/${commission._id}/amount`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          percentage: 20, // Increase from 10% to 20%
          reason: 'Performance bonus',
        });

      expect(response.status).toBe(200);
      expect(response.body.commission.percentage).toBe(20);
      expect(response.body.commission.amount).toBe(200); // 20% of 1000

      // Check if wallet was updated with the difference
      const updatedWallet = await Wallet.findOne({ user: regularUser._id });
      expect(updatedWallet.balance).toBe(initialBalance + 100); // +100 difference
      expect(updatedWallet.totalEarnings).toBe(initialBalance + 100);
    });
  });
});
