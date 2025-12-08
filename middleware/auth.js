const authenticateUser = (supabase) => async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.warn('[Auth] Missing authorization header');
            return res.status(401).json({ error: 'No authorization header' });
        }

        // Robust token extraction
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : authHeader;

        if (!token) {
            console.warn('[Auth] Empty token');
            return res.status(401).json({ error: 'Empty token' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('[Auth] Token validation failed:', error?.message || 'No user found');
            return res.status(401).json({ error: 'Invalid token', details: error?.message });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('[Auth] Internal middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { authenticateUser };
