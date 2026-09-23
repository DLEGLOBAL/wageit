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

        // Calculate 2% platform fee
        const platformFee = Math.round(cents * 0.02);
        const netPayout = cents - platformFee;
        const totalDeducted = cents;

        // Update wallet balance
        await base44.asServiceRole.entities.Wallet.update(wallet.id, {
            balance: wallet.balance - totalDeducted,
            total_withdrawn: (wallet.total_withdrawn || 0) + netPayout
        });

        // Create withdrawal transaction
        await base44.asServiceRole.entities.Transaction.create({
            user_email: user.email,
            type: 'withdrawal',
            amount: netPayout,
            description: `Withdrawal $${(netPayout / 100).toFixed(2)}`,
            status: 'completed'
        });

        // Create platform fee transaction
        await base44.asServiceRole.entities.Transaction.create({
            user_email: user.email,
            type: 'platform_fee',
            amount: platformFee,
            description: `Platform fee (2% of withdrawal)`,
            status: 'completed'
        });

        // Create notification
        await base44.asServiceRole.entities.Notification.create({
            user_email: user.email,
            title: 'Withdrawal Processed',
            message: `$${(netPayout / 100).toFixed(2)} withdrawn (2% fee: $${(platformFee / 100).toFixed(2)})`,
            type: 'deposit_confirmed'
        });

        return Response.json({ 
            success: true,
            message: 'Withdrawal processed successfully',
            new_balance: (wallet.balance - totalDeducted) / 100,
            net_payout: netPayout / 100,
            platform_fee: platformFee / 100
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});