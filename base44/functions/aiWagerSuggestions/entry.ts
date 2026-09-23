import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile and history
    const profile = await base44.entities.UserProfile.filter({ user_email: user.email }).then(r => r[0]);
    const userWagers = await base44.entities.Wager.filter({ creator_email: user.email }, '-created_date', 10);
    const trendingWagers = await base44.entities.Wager.filter({ status: 'active' }, '-created_date', 20);

    // Analyze user interests and platform trends
    const { data } = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 5 creative wager ideas based on:
      
User Profile:
- Username: ${profile?.username || user.full_name}
- Wins: ${profile?.wins || 0}, Losses: ${profile?.losses || 0}
- Recent wagers: ${userWagers.map(w => w.title).join(', ') || 'None yet'}

Platform Trends:
- Popular wagers: ${trendingWagers.slice(0, 5).map(w => w.title).join(', ')}

Create engaging, specific, and actionable wager ideas across different categories (fitness, skill, predictions, challenges, etc.).
Each wager should be unique and appropriate for the platform.`,
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
                wager_type: { type: "string", enum: ["skill_based", "event_outcome", "time_challenge"] },
                suggested_stake: { type: "number" },
                category: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({ suggestions: data.suggestions || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});