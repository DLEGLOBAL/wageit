import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.4.0';

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"), {
    apiVersion: '2024-12-18.acacia'
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const signature = req.headers.get('stripe-signature');
        const body = await req.text();

        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            Deno.env.get("STRIPE_WEBHOOK_SECRET")
        );

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const user_email = paymentIntent.metadata.user_email;
            const amount = paymentIntent.amount;

            const wallets = await base44.asServiceRole.entities.Wallet.filter({ user_email });
            let wallet;
            
            if (wallets.length > 0) {
                wallet = wallets[0];
                await base44.asServiceRole.entities.Wallet.update(wallet.id, {
                    balance: wallet.balance + amount,
                    total_deposited: (wallet.total_deposited || 0) + amount
                });
            } else {
                wallet = await base44.asServiceRole.entities.Wallet.create({
                    user_email,
                    balance: amount,
                    total_deposited: amount,
                    escrow_balance: 0
                });
            }

            await base44.asServiceRole.entities.Transaction.create({
                user_email,
                type: 'deposit',
                amount,
                description: `Deposit $${(amount / 100).toFixed(2)}`,
                reference_id: paymentIntent.id,
                status: 'completed'
            });

            await base44.asServiceRole.entities.Notification.create({
                user_email,
                title: 'Deposit Confirmed',
                message: `$${(amount / 100).toFixed(2)} has been added to your wallet`,
                type: 'deposit_confirmed'
            });
        }

        return Response.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ error: error.message }, { status: 400 });
    }
});