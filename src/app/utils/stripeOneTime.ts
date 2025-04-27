import {stripe} from "./stripe";

export const StripeOneTimePayment = async(amountToBePaid:number,userId:string,paymentMethod:string)=>{
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amountToBePaid * 100), // Stripe works with cents
        currency: 'usd',
        metadata: {
            userId,
        },
        automatic_payment_methods: {
            allow_redirects: 'never',
            enabled: true,
        },
    });
    
    // console.log({paymentIntent});

// Confirm the Payment Intent
    const confirmedPayment = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      {
        payment_method: paymentMethod,
      },
    );

    // console.log({ confirmedPayment });

    return confirmedPayment;
}

