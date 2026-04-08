import express from 'express';
import { pool } from '../db/pool';
import { verifyAccessToken } from '../utils/jwt';

export const gameRouter = express.Router();

// Middleware to protect routes
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);
  
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });
  (req as any).userId = payload.userId;
  next();
};

// Sync Round Results to Server
gameRouter.post('/sync', requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const { roundScore, roundCorrectCount, roundQuestionsAttempted, roundStreak, isNewDay } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Log the round for weekly leaderboards
    await client.query(
      `INSERT INTO round_results (user_id, xp_earned, questions_correct, questions_attempted, max_streak)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, roundScore, roundCorrectCount, roundQuestionsAttempted, roundStreak]
    );

    // Update aggregate user profile
    const streakUpdate = isNewDay ? 'global_streak = global_streak + 1' : 'global_streak = global_streak';
    
    await client.query(
      `UPDATE users 
       SET total_xp = total_xp + $1,
           lifetime_correct = lifetime_correct + $2,
           lifetime_attempted = lifetime_attempted + $3,
           last_played_date = CURRENT_TIMESTAMP,
           ${streakUpdate}
       WHERE id = $4`,
      [roundScore, roundCorrectCount, roundQuestionsAttempted, userId]
    );

    // Re-calculate Level dynamically on DB to prevent client spoofing
    await client.query(
      `UPDATE users SET level = GREATEST(1, FLOOR(SQRT(total_xp / 100.0))) WHERE id = $1`,
      [userId]
    );

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to sync data' });
  } finally {
    client.release();
  }
});

// Fetch Leaderboards
gameRouter.get('/leaderboards', async (req, res) => {
  try {
    // All-Time Hall of Fame
    const allTimeQuery = await pool.query(
      `SELECT username, total_xp, level, global_streak 
       FROM users 
       ORDER BY total_xp DESC 
       LIMIT 50`
    );

    // Weekly Leaderboard (Calculates sum of XP earned this current UTC week)
    const weeklyQuery = await pool.query(
      `SELECT u.username, SUM(r.xp_earned) as weekly_xp, MAX(r.max_streak) as max_weekly_streak
       FROM round_results r
       JOIN users u ON r.user_id = u.id
       WHERE r.played_at >= date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
       GROUP BY u.id, u.username
       ORDER BY weekly_xp DESC
       LIMIT 50`
    );

    res.json({
      allTime: allTimeQuery.rows,
      weekly: weeklyQuery.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboards' });
  }
});