import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { user_email } = await req.json();

        if (!user_email) {
            return Response.json({ error: 'user_email required' }, { status: 400 });
        }

        const [profile, existingAchievements, wallet] = await Promise.all([
            base44.asServiceRole.entities.UserProfile.filter({ user_email }).then(r => r[0]),
            base44.asServiceRole.entities.Achievement.filter({ user_email }),
            base44.asServiceRole.entities.Wallet.filter({ user_email }).then(r => r[0])
        ]);

        if (!profile) {
            return Response.json({ error: 'Profile not found' }, { status: 404 });
        }

        const unlocked = existingAchievements.map(a => a.achievement_type);
        const newAchievements = [];

        const award = (type, metadata = {}) => {
            if (!unlocked.includes(type)) {
                newAchievements.push({ achievement_type: type, metadata });
            }
        };

        // First wager
        if (profile.completed_wagers >= 1) award('first_wager');

        // Win milestones
        if (profile.wins >= 1) award('first_win');
        if (profile.wins >= 10) award('ten_wins');
        if (profile.wins >= 50) award('fifty_wins');
        if (profile.wins >= 100) award('hundred_wins');

        // Win streaks
        if (profile.best_win_streak >= 3) award('win_streak_3');
        if (profile.best_win_streak >= 5) award('win_streak_5');
        if (profile.best_win_streak >= 10) award('win_streak_10');

        // High roller (wagered over $1000 total)
        if (profile.total_wagered >= 100000) award('high_roller');

        // Big spender (single wager over $500)
        const wagers = await base44.asServiceRole.entities.Wager.filter({ creator_email: user_email });
        if (wagers.some(w => w.stake_amount >= 50000)) award('big_spender');

        // Perfect record (10+ wins, 90%+ win rate)
        const winRate = profile.completed_wagers > 0 ? (profile.wins / profile.completed_wagers) * 100 : 0;
        if (profile.wins >= 10 && winRate >= 90) award('perfect_record');

        // Verified user
        if (profile.is_id_verified) award('verified_user');

        // Fearless (accepted 5+ high-stake wagers as opponent)
        const acceptedWagers = await base44.asServiceRole.entities.Wager.filter({ opponent_email: user_email });
        const highStakeAccepted = acceptedWagers.filter(w => w.stake_amount >= 10000);
        if (highStakeAccepted.length >= 5) award('fearless');

        // Precision master (won 5+ skill-based wagers)
        const skillWins = wagers.filter(w => w.wager_type === 'skill_based' && w.winner_email === user_email);
        if (skillWins.length >= 5) award('precision_master');

        // Create new achievements
        for (const achievement of newAchievements) {
            await base44.asServiceRole.entities.Achievement.create({
                user_email,
                ...achievement
            });

            // Send notification
            const achievementNames = {
                first_wager: 'First Wager',
                first_win: 'First Win',
                ten_wins: '10 Wins',
                fifty_wins: '50 Wins',
                hundred_wins: '100 Wins',
                win_streak_3: '3 Win Streak',
                win_streak_5: '5 Win Streak',
                win_streak_10: '10 Win Streak',
                high_roller: 'High Roller',
                big_spender: 'Big Spender',
                perfect_record: 'Perfect Record',
                verified_user: 'Verified User',
                fearless: 'Fearless',
                precision_master: 'Precision Master'
            };

            await base44.asServiceRole.entities.Notification.create({
                user_email,
                title: '🏆 Achievement Unlocked!',
                message: `You earned: ${achievementNames[achievement.achievement_type] || achievement.achievement_type}`,
                type: 'system'
            });
        }

        return Response.json({ 
            success: true,
            new_achievements: newAchievements.length,
            total_achievements: existingAchievements.length + newAchievements.length
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});