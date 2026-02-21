import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, wager_type } = await req.json();

        const prompt = `Create a dynamic, eye-catching cover image for a competitive wager challenge:

Title: "${title}"
Description: "${description}"
Type: ${wager_type}

Style: Modern, bold, competitive, high-energy. Include relevant icons or imagery that represents the challenge. Use vibrant colors (green, purple, blue gradients). Make it look like a premium sports/esports poster. No text in the image.`;

        const response = await base44.integrations.Core.GenerateImage({
            prompt
        });

        return Response.json({ image_url: response.url });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});