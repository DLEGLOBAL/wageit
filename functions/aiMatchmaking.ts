import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { wager_title, wager_type, stake_amount } = await req.json();

        const myProfile = await base44.entities.UserProfile.filter({ user_email: user.email });
        const allProfiles = await base44.entities.UserProfile.list('-reputation_score', 100);
        const otherProfiles = allProfiles.filter(p => p.user_email !== user.email && !p.is_banned);

        const candidates = otherProfiles.slice(0, 20);

        const prompt = `Find the best match for this wager challenge:

WAGER: "${wager_title}"
Type: ${wager_type}
Stake: $${(stake_amount / 100).toFixed(2)}

MY STATS:
- Wins: ${myProfile[0]?.wins || 0}
- Losses: ${myProfile[0]?.losses || 0}
- Reputation: ${myProfile[0]?.reputation_score || 100}
- Completed wagers: ${myProfile[0]?.completed_wagers || 0}

POTENTIAL OPPONENTS:
${candidates.map(p => `- ${p.user_email}: ${p.wins}W/${p.losses}L, Rep: ${p.reputation_score}, Completed: ${p.completed_wagers}`).join('\n')}

Select top 3 best matches based on:
1. Similar skill level (balanced match)
2. Good reputation
3. Active participation
4. Fair record
5. Complementary experience

Rank them from best to worst match.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    matches: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                email: { type: "string" },
                                match_score: { type: "number" },
                                reasoning: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        const enriched = await Promise.all(response.matches.map(async (match) => {
            const profile = candidates.find(p => p.user_email === match.email);
            return {
                ...match,
                username: profile?.username,
                avatar_url: profile?.avatar_url,
                wins: profile?.wins,
                losses: profile?.losses,
                reputation_score: profile?.reputation_score
            };
        }));

        return Response.json({ matches: enriched });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});