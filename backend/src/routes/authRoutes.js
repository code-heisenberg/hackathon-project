import express from 'express';
import githubAuthService from '../services/githubAuthService.js';

const router = express.Router();

router.post('/github/callback', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const tokenData = await githubAuthService.exchangeCodeForToken(code);
        res.json(tokenData);
    } catch (error) {
        console.error('GitHub auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

export default router;
