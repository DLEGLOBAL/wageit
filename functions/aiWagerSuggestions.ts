import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await base44.entities.UserProfile.filter({ user_email: user.email });
        const userWagers = await base44.entities.Wager.filter({ creator_email: user.email }, '-created_date', 10);
        
        const prompt = `Based on this user's wagering history, suggest 3 creative and engaging wager ideas they might enjoy:

User profile:
- Wins: ${profile[0]?.wins || 0}
- Losses: ${profile[0]?.losses || 0}
- Recent wagers: ${userWagers.map(w => w.title).join(', ') || 'None yet'}

Generate 3 unique wager suggestions. For each, provide:
1. A catchy title
2. Clear description
3. Wager type (skill_based, event_outcome, or time_challenge)
4. Suggested stake amount ($10-$100)
5. Proof type needed

Make them diverse, exciting, and tailored to modern interests (fitness, gaming, cooking, sports, creative challenges, etc).`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    suggestions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                wager_type: { type: "string" },
                                stake_amount: { type: "number" },
                                proof_type: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        return Response.json({ suggestions: response.suggestions });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});