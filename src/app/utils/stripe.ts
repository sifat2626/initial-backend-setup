import Stripe from "stripe";
import config from "../../config";

const stripe = new Stripe(config.STRIPE_SECRET_KEY,{apiVersion: "2024-12-18.acacia"});

export {stripe};