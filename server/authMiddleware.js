// server/authMiddleware.js
const { createClient } = require('@supabase/supabase-js');

// Initialize a separate Supabase client for middleware
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const protect = async (req, res, next) => {
  // 1. Get token from the 'Authorization' header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  // 2. Verify the token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }

  // 3. Attach the verified user to the request object
  req.user = user;
  next(); // Proceed to the next function (the actual endpoint)
};

module.exports = { protect };