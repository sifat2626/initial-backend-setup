import ApiError from "../../errors/ApiErrors"
import prisma from "../../shared/prisma"
import { stripe } from "./stripe"

/**
 * One-time payment that supports both new and reused PaymentMethods.
 */
export const StripeOneTimePayment = async (
  amountToBePaid: number,
  userId: string,
  paymentMethod: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { customerId: true },
  })
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  let customer = user.customerId

  // If no customerId exists, create a new customer and update DB
  if (!customer) {
    const createdCustomer = await stripe.customers.create({
      metadata: { userId },
    })
    await prisma.user.update({
      where: { id: userId },
      data: { customerId: createdCustomer.id },
    })
    customer = createdCustomer.id // <-- assign here
  }

  // 2. Try attaching the payment method to the customer (will fail silently if already attached)
  try {
    await stripe.paymentMethods.attach(paymentMethod, {
      customer,
    })
  } catch (err: any) {
    if (err.code !== "resource_already_exists") {
      throw err
    }
  }

  // 3. Create the PaymentIntent for that customer
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amountToBePaid * 100), // Stripe uses cents
    currency: "usd",
    customer,
    metadata: { userId },
    automatic_payment_methods: {
      allow_redirects: "never",
      enabled: true,
    },
  })

  // 4. Confirm the payment
  const confirmedPayment = await stripe.paymentIntents.confirm(
    paymentIntent.id,
    {
      payment_method: paymentMethod,
    }
  )

  return confirmedPayment
}
