import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { dispute_id } = await req.json();

        const dispute = await base44.entities.Dispute.filter({ id: dispute_id });
        if (!dispute[0]) {
            return Response.json({ error: 'Dispute not found' }, { status: 404 });
        }

        const wager = await base44.entities.Wager.filter({ id: dispute[0].wager_id });
        if (!wager[0]) {
            return Response.json({ error: 'Wager not found' }, { status: 404 });
        }

        const prompt = `As an impartial moderator AI, analyze this wager dispute:

WAGER DETAILS:
- Title: "${wager[0].title}"
- Description: "${wager[0].description}"
- Type: ${wager[0].wager_type}
- Stake: $${(wager[0].stake_amount / 100).toFixed(2)}
- Creator: ${wager[0].creator_email}
- Opponent: ${wager[0].opponent_email}

DISPUTE:
- Filed by: ${dispute[0].filed_by}
- Reason: "${dispute[0].reason}"

EVIDENCE:
- Creator proof: ${wager[0].creator_proof_url ? 'Submitted' : 'Not submitted'}
- Creator note: "${wager[0].creator_proof_note || 'None'}"
- Opponent proof: ${wager[0].opponent_proof_url ? 'Submitted' : 'Not submitted'}
- Opponent note: "${wager[0].opponent_proof_note || 'None'}"

ANALYSIS REQUIRED:
1. Who has the stronger case?
2. Is the dispute legitimate?
3. What evidence supports each side?
4. Recommended resolution (creator_wins, opponent_wins, draw_refund, cancelled)?
5. Confidence level (0-100)?
6. Detailed reasoning for moderator

Be fair, thorough, and legally sound.`;

        const file_urls = [];
        if (wager[0].creator_proof_url) file_urls.push(wager[0].creator_proof_url);
        if (wager[0].opponent_proof_url) file_urls.push(wager[0].opponent_proof_url);

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            file_urls: file_urls.length > 0 ? file_urls : undefined,
            response_json_schema: {
                type: "object",
                properties: {
                    stronger_case: { type: "string" },
                    is_legitimate: { type: "boolean" },
                    creator_evidence: { type: "string" },
                    opponent_evidence: { type: "string" },
                    recommended_resolution: { type: "string" },
                    confidence: { type: "number" },
                    reasoning: { type: "string" },
                    moderator_notes: { type: "string" }
                }
            }
        });

        return Response.json({ analysis: response });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});