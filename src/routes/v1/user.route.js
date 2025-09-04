import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as userValidation from '../../validations/user.validation.js';
import * as userController from '../../controllers/user.controller.js';
import * as authValidation from '../../validations/auth.validation.js';
import * as authController from '../../controllers/auth.controller.js';

const router = express.Router();

router
  .route('/')
  .post( validate(userValidation.createUser), userController.createUser)
  .get( validate(userValidation.getUsers), userController.getUsers);

router
  .route('/random')
  .get(auth('getUsers'), validate(userValidation.getRandomUsers), userController.getRandomUsers);

router
  .route('/:userId')
  .get( validate(userValidation.getUser), userController.getUser)
  .patch( validate(userValidation.updateUser), userController.updateUser)
  .delete( validate(userValidation.deleteUser), userController.deleteUser);

router
  .route('/:userId/kyc/documents')
  .post( validate(userValidation.uploadKycDocument), userController.uploadKycDocument);

router
  .route('/:userId/kyc/details')
  .patch( validate(userValidation.updateKycDetails), userController.updateKycDetails);

router
  .route('/:userId/verify/mobile')
  .post( validate(userValidation.verifyMobile), userController.verifyMobile);

router
  .route('/:userId/verify/email')
  .post( validate(userValidation.verifyEmail), userController.verifyEmail);

router
  .route('/:userId/verify/resend')
  .post( validate(userValidation.resendVerification), userController.resendVerification);

router
  .route('/:userId/onboarding/status')
  .get( validate(userValidation.getOnboardingStatus), userController.getOnboardingStatus);

// Bank Account Routes for User
router
  .route('/:userId/bank-accounts')
  .post(auth('getBankAccounts'), validate(userValidation.createUserBankAccount), userController.createUserBankAccount)
  .get(auth('getBankAccounts'), validate(userValidation.getUserBankAccounts), userController.getUserBankAccounts);

router
  .route('/:userId/bank-accounts/:bankAccountId')
  .get(auth('getBankAccounts'), validate(userValidation.getUserBankAccount), userController.getUserBankAccount)
  .patch(auth('getBankAccounts'), validate(userValidation.updateUserBankAccount), userController.updateUserBankAccount)
  .delete(auth('getBankAccounts'), validate(userValidation.deleteUserBankAccount), userController.deleteUserBankAccount);

router
  .route('/:userId/bank-accounts/:bankAccountId/default')
  .post(auth('getBankAccounts'), validate(userValidation.setUserDefaultBankAccount), userController.setUserDefaultBankAccount);

router
  .route('/:userId/bank-accounts/:bankAccountId/documents')
  .post(auth('getBankAccounts'), validate(userValidation.uploadUserBankAccountDocument), userController.uploadUserBankAccountDocument);

// Change Password Route
router
  .route('/:userId/change-password')
  .post(auth('getUsers'), validate(userValidation.changePassword), userController.changePassword);

router.post('/login', validate(authValidation.login), authController.login);

router.post('/:userId/kyc/aadhaar/initiate', userController.initiateAadhaarKyc);
router.post('/:userId/kyc/aadhaar/verify', userController.verifyAadhaarKyc);
router.post('/:userId/kyc/pan/verify', userController.verifyPanKyc);
router.post('/:userId/kyc/bank/verify', userController.verifyBankKyc);

// Commission related routes
router
  .route('/:userId/commissions/stats')
  .get(auth('getCommissions'), userController.getUserCommissionStats);

router
  .route('/:userId/commissions/history')
  .get(auth('getCommissions'), userController.getUserCommissionHistory);

router
  .route('/:userId/commissions/pending')
  .get(auth('getCommissions'), userController.getUserPendingCommissions);

router
  .route('/:userId/commissions/paid')
  .get(auth('getCommissions'), userController.getUserPaidCommissions);

router
  .route('/:userId/leads/:leadId/commission')
  .get(auth('getCommissions'), userController.getLeadCommissionDetails);

export default router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a user
 *     description: Only admins can create other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                  type: string
 *                  enum: [user, admin]
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *               role: user
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all users
 *     description: Only admins can retrieve all users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: User name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: User role
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user
 *     description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a user
 *     description: Logged in users can only update their own information. Only admins can update other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a user
 *     description: Logged in users can delete only themselves. Only admins can delete other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
