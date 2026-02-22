import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const profiles = await base44.asServiceRole.entities.UserProfile.filter({});
        const periods = ['daily', 'weekly', 'monthly', 'all_time'];

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        for (const period of periods) {
            let dateFilter = {};
            
            if (period === 'daily') {
                dateFilter = { created_date: { $gte: today.toISOString() } };
            } else if (period === 'weekly') {
                dateFilter = { created_date: { $gte: weekStart.toISOString() } };
            } else if (period === 'monthly') {
                dateFilter = { created_date: { $gte: monthStart.toISOString() } };
            }

            for (const profile of profiles) {
                if (profile.is_banned) continue;

                let wins = profile.wins;
                let completed = profile.completed_wagers;

                if (period !== 'all_time') {
                    const wagers = await base44.asServiceRole.entities.Wager.filter({
                        winner_email: profile.user_email,
                        ...dateFilter
                    });
                    wins = wagers.length;

                    const allWagers = await base44.asServiceRole.entities.Wager.filter({
                        $or: [
                            { creator_email: profile.user_email },
                            { opponent_email: profile.user_email }
                        ],
                        status: 'completed',
                        ...dateFilter
                    });
                    completed = allWagers.length;
                }

                const winRate = completed > 0 ? (wins / completed) * 100 : 0;
                const wallet = await base44.asServiceRole.entities.Wallet.filter({ user_email: profile.user_email }).then(r => r[0]);

                const existing = await base44.asServiceRole.entities.Leaderboard.filter({
                    user_email: profile.user_email,
                    period
                });

                const data = {
                    user_email: profile.user_email,
                    username: profile.username,
                    period,
                    total_won: wallet?.total_won || 0,
                    win_rate: winRate,
                    streak: profile.current_win_streak || 0
                };

                if (existing.length > 0) {
                    await base44.asServiceRole.entities.Leaderboard.update(existing[0].id, data);
                } else {
                    await base44.asServiceRole.entities.Leaderboard.create(data);
                }
            }

            // Calculate and update ranks
            const leaderboard = await base44.asServiceRole.entities.Leaderboard.filter({ period });
            const sorted = leaderboard.sort((a, b) => {
                if (b.total_won !== a.total_won) return b.total_won - a.total_won;
                return b.win_rate - a.win_rate;
            });

            for (let i = 0; i < sorted.length; i++) {
                await base44.asServiceRole.entities.Leaderboard.update(sorted[i].id, {
                    rank: i + 1
                });
            }
        }

        return Response.json({ success: true, message: 'Leaderboards updated' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});