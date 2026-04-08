import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/pool';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

export const authRouter = express.Router();

// Local Registration
authRouter.post('/register', async (req, res) => {
  // Added unlockedTrophies to destructuring
  const { email, username, password, totalXP, level, globalStreak, lifetimeCorrect, lifetimeAttempted, targetAge, unlockedTrophies } = req.body;
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    // Added unlocked_trophies to the INSERT query and JSON.stringify to the values array
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, oauth_provider, total_xp, level, global_streak, lifetime_correct, lifetime_attempted, target_age, unlocked_trophies) 
       VALUES ($1, $2, $3, 'local', $4, $5, $6, $7, $8, $9, $10) RETURNING id, username, target_age, unlocked_trophies`,
      [
        email, 
        username, 
        hash, 
        totalXP || 0, 
        level || 1, 
        globalStreak || 0, 
        lifetimeCorrect || 0, 
        lifetimeAttempted || 0, 
        targetAge || null, 
        JSON.stringify(unlockedTrophies || [])
      ]
    );
    
    const user = result.rows[0];
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.json({ accessToken, user });
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ error: 'Email or username already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Local Login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND oauth_provider = $2', [email, 'local']);
    const user = result.rows[0];
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const { accessToken, refreshToken } = generateTokens(user.id);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    
    // Omit password hash from response
    const { password_hash, ...safeUser } = user;
    res.json({ accessToken, user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Silent Token Refresh
authRouter.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });
  
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) return res.status(403).json({ error: 'Invalid refresh token' });
  
  const { accessToken, refreshToken: newRefresh } = generateTokens(payload.userId);
  res.cookie('refreshToken', newRefresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.json({ accessToken });
});

// OAuth Redirect Handlers
authRouter.get('/oauth/:provider', (req, res) => {
  const provider = req.params.provider;
});

authRouter.get('/oauth/:provider/callback', async (req, res) => {
  res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
});