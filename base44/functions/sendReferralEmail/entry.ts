import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { referrer_email, recipient_email, referral_code } = await req.json();

        if (!recipient_email || !referral_code) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const referrerProfile = await base44.asServiceRole.entities.UserProfile.filter({ 
            user_email: referrer_email 
        }).then(r => r[0]);

        const referralLink = `${Deno.env.get('BASE44_APP_URL') || 'https://wageit.app'}?ref=${referral_code}`;

        await base44.integrations.Core.SendEmail({
            to: recipient_email,
            subject: `${referrerProfile?.username || 'Your friend'} invited you to WageIt!`,
            body: `
Hi there!

${referrerProfile?.username || 'Your friend'} has invited you to join WageIt - the ultimate peer-to-peer challenge platform!

🎁 Sign up now and you'll both get a $5 bonus when you complete your first wager!

Join here: ${referralLink}

WageIt lets you:
• Create and accept skill-based challenges
• Compete with friends for real stakes
• Track your performance and earn achievements
• Build your reputation and climb the leaderboards

Ready to prove your skills? Click the link above to get started!

Best,
The WageIt Team
            `
        });

        // Create referral record
        await base44.asServiceRole.entities.Referral.create({
            referrer_email,
            referral_code,
            status: 'pending'
        });

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});