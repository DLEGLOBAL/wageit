import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, points, reason } = await req.json();

    if (!user_email || !points) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or create points record
    let pointsRecord = await base44.asServiceRole.entities.Points.filter({ user_email });
    
    if (pointsRecord.length === 0) {
      pointsRecord = await base44.asServiceRole.entities.Points.create({
        user_email,
        points,
        total_earned: points,
        total_spent: 0
      });
    } else {
      const current = pointsRecord[0];
      await base44.asServiceRole.entities.Points.update(current.id, {
        points: current.points + points,
        total_earned: current.total_earned + points
      });
    }

    // Create notification
    await base44.asServiceRole.entities.Notification.create({
      user_email,
      title: '🎉 Points Earned!',
      message: `You earned ${points} points for ${reason}`,
      type: 'system'
    });

    return Response.json({ success: true, points });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});