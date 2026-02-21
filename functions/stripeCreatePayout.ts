import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.4.0';

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"), {
    apiVersion: '2024-12-18.acacia'
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount } = await req.json();
        
        const wallets = await base44.entities.Wallet.filter({ user_email: user.email });
        if (!wallets[0]) {
            return Response.json({ error: 'Wallet not found' }, { status: 404 });
        }

        const wallet = wallets[0];
        const cents = Math.round(amount * 100);

        if (cents > wallet.balance) {
            return Response.json({ error: 'Insufficient funds' }, { status: 400 });
        }

        // Update wallet balance
        await base44.asServiceRole.entities.Wallet.update(wallet.id, {
            balance: wallet.balance - cents,
            total_withdrawn: (wallet.total_withdrawn || 0) + cents
        });

        // Create transaction record
        await base44.asServiceRole.entities.Transaction.create({
            user_email: user.email,
            type: 'withdrawal',
            amount: cents,
            description: `Withdrawal $${amount.toFixed(2)}`,
            status: 'completed'
        });

        // Create notification
        await base44.asServiceRole.entities.Notification.create({
            user_email: user.email,
            title: 'Withdrawal Processed',
            message: `$${amount.toFixed(2)} has been withdrawn from your wallet`,
            type: 'deposit_confirmed'
        });

        return Response.json({ 
            success: true,
            message: 'Withdrawal processed successfully',
            new_balance: (wallet.balance - cents) / 100
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});