import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { user_email } = await req.json();

        const userWagers = await base44.entities.Wager.filter({ creator_email: user_email }, '-created_date', 50);
        const opponentWagers = await base44.entities.Wager.filter({ opponent_email: user_email }, '-created_date', 50);
        const allUserWagers = [...userWagers, ...opponentWagers];
        
        const transactions = await base44.entities.Transaction.filter({ user_email }, '-created_date', 100);
        const disputes = await base44.entities.Dispute.filter({ filed_by: user_email });
        const reports = await base44.entities.Report.filter({ reported_email: user_email });

        const prompt = `Analyze this user for suspicious activity or fraud patterns:

USER: ${user_email}

ACTIVITY SUMMARY:
- Total wagers created: ${userWagers.length}
- Total wagers as opponent: ${opponentWagers.length}
- Win rate: ${allUserWagers.length > 0 ? ((allUserWagers.filter(w => w.winner_email === user_email).length / allUserWagers.filter(w => w.status === 'completed').length) * 100).toFixed(1) : 0}%
- Disputes filed: ${disputes.length}
- Reports against user: ${reports.length}
- Total transactions: ${transactions.length}

WAGER PATTERNS:
- Average stake: $${allUserWagers.length > 0 ? (allUserWagers.reduce((sum, w) => sum + w.stake_amount, 0) / allUserWagers.length / 100).toFixed(2) : 0}
- Most common type: ${allUserWagers.length > 0 ? allUserWagers.reduce((acc, w) => { acc[w.wager_type] = (acc[w.wager_type] || 0) + 1; return acc; }, {}) : 'N/A'}
- Cancelled wagers: ${allUserWagers.filter(w => w.status === 'cancelled').length}

RED FLAGS TO CHECK:
1. Abnormally high win rate (>80%)?
2. Frequent disputes filed?
3. Multiple reports from others?
4. Rapid succession of high-value wagers?
5. Suspicious transaction patterns?
6. Creating wagers and immediately cancelling?
7. Collusion indicators (always facing same opponents)?

Provide fraud risk assessment.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
                    risk_score: { type: "number" },
                    red_flags: { type: "array", items: { type: "string" } },
                    suspicious_patterns: { type: "string" },
                    recommended_action: { type: "string" },
                    reasoning: { type: "string" }
                }
            }
        });

        return Response.json({ analysis: response });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});