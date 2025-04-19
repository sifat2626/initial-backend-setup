import Stripe from "stripe"
import config from "../../config"

const stripe = new Stripe(config.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export { stripe }
