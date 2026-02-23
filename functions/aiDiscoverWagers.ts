import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Fetch all public wagers
    const wagers = await base44.entities.Wager.filter({ privacy: 'public' }, '-created_date', 100);

    // Get user profile if exists
    let userProfile = null;
    if (user?.email) {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      userProfile = profiles[0];
    }

    // AI analysis for trending and categories
    const prompt = `Analyze these wager data and user profile to create curated categories:

Wagers: ${JSON.stringify(wagers.slice(0, 20))}
User Profile: ${userProfile ? JSON.stringify(userProfile) : 'Guest user'}

Create 4 curated categories with 3-5 wagers each. Categories should be:
1. Trending Now (most active/popular)
2. Expiring Soon (deadline approaching)
3. High Stakes (big money wagers)
4. Perfect for You (personalized based on user history)

Return JSON format:
{
  "categories": [
    {
      "name": "Category Name",
      "description": "Brief description",
      "icon": "emoji or icon name",
      "wager_ids": ["id1", "id2", "id3"]
    }
  ]
}`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          categories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                icon: { type: "string" },
                wager_ids: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    // Map wager IDs back to full wager objects
    const categoriesWithWagers = aiResponse.categories.map(cat => ({
      ...cat,
      wagers: cat.wager_ids
        .map(id => wagers.find(w => w.id === id))
        .filter(Boolean)
    }));

    return Response.json({ categories: categoriesWithWagers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});