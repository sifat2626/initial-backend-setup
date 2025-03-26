import { StripeOneTimePayment } from './stripeOneTime';
import { BoldOneTimePayment } from './boldOneTime';  // Import Bold's payment method
import { PaymentType } from '@prisma/client';
import AppError from '../errors/AppError';
import prisma from "./prisma";

export const HandlePayment = async (
    gateway: string,
    amount: number,
    userId: string,
    paymentMethod: string,
    type: PaymentType,
    tsx: any,
    consumeReferral: number = 0
) => {
  // Fetch user from the database
  const user = await tsx.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    throw new AppError(400, 'User not found');
  }

  // Fetch previous payments (if any) for the user
  const previousPaymentsByUser = await prisma.payment.findFirst({
    where: {
      userId: userId,
    }
  });

  const earn = await tsx.earn.findFirst({});

  console.log({ earn });

  if (!earn) {
    throw new AppError(400, 'Earn not found');
  }

  // Check for referral and update balance
  if (!previousPaymentsByUser) {
    if (user.referredBy) {
      const updateReferBalance = await tsx.user.update({
        where: {
          id: user.referredBy
        },
        data: {
          referralBalance: {
            increment: earn.value
          }
        }
      });

      console.log({ updateReferBalance });
    }
  }

  // Validate required parameters
  if (!gateway || !amount || !userId || !paymentMethod || !type) {
    throw new AppError(400, 'Missing required parameters for payment processing');
  }

  // Handle referral balance
  if (user.referralBalance < consumeReferral) {
    throw new AppError(400, 'Insufficient referral balance');
  } else {
    amount -= consumeReferral;

    const updatedReferralBalance = user.referralBalance - consumeReferral;
    await tsx.user.update({
      where: {
        id: userId
      },
      data: {
        referralBalance: updatedReferralBalance
      }
    });
  }

  let payment;

  // Process payment based on selected gateway (Stripe or Bold)
  if (gateway === 'STRIPE') {
    payment = await StripeOneTimePayment(amount, userId, paymentMethod);

    if (!payment) {
      throw new AppError(400, 'Payment Not Found');
    }

    console.log(payment.id, gateway, amount, type);

    // Save payment details to the database
    const paymentDB = await tsx.payment.create({
      data: {
        paymentIntentId: payment.id,
        gateway,
        amount,
        userId,
        type
      }
    });

    if (!paymentDB) {
      throw new AppError(400, 'PaymentDB Not Found');
    }
  } else if (gateway === 'BOLD') {
    // Process Bold payment
    payment = await BoldOneTimePayment(amount, userId, paymentMethod);

    if (!payment) {
      throw new AppError(400, 'Payment Not Found');
    }

    console.log(payment.id, gateway, amount, type);

    // Save payment details to the database
    const paymentDB = await tsx.payment.create({
      data: {
        paymentIntentId: payment.id,  // In Bold, this might be a different ID, adjust as needed
        gateway,
        amount,
        userId,
        type
      }
    });

    if (!paymentDB) {
      throw new AppError(400, 'PaymentDB Not Found');
    }
  } else {
    throw new AppError(400, `Unsupported payment gateway: ${gateway}`);
  }

  return payment;
};
