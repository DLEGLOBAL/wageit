import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { wager_id, proof_url, proof_note } = await req.json();

        const wager = await base44.entities.Wager.filter({ id: wager_id });
        if (!wager[0]) {
            return Response.json({ error: 'Wager not found' }, { status: 404 });
        }

        const prompt = `Analyze this proof submission for a wager challenge:

Wager: "${wager[0].title}"
Description: "${wager[0].description}"
Proof Type Required: ${wager[0].proof_type}
Submitter's Note: "${proof_note || 'No note provided'}"

Evaluate:
1. Does the proof appear legitimate?
2. Does it meet the wager requirements?
3. Are there any red flags or concerns?
4. Confidence level (0-100)?
5. Recommendation (approve/review/reject)?

Provide detailed reasoning.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            file_urls: [proof_url],
            response_json_schema: {
                type: "object",
                properties: {
                    is_legitimate: { type: "boolean" },
                    meets_requirements: { type: "boolean" },
                    concerns: { type: "string" },
                    confidence: { type: "number" },
                    recommendation: { type: "string" },
                    reasoning: { type: "string" }
                }
            }
        });

        return Response.json({ analysis: response });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});