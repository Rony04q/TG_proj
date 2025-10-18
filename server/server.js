// server/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { protect } = require('./authMiddleware'); // Import the security middleware

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const PORT = 5000;

// --- API ENDPOINTS ---

// ## PUBLIC ROUTE ##
// Get all profiles (public, phone number is hidden)
app.get('/api/profiles', async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, service, photo_url, is_verified, average_rating, rating_count');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ## AUTHENTICATION ROUTES ##
// Register a new resident
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ user: data.user });
});

// Login a resident
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user, session: data.session });
});

// ## SECURED ROUTES ##
// The 'protect' middleware runs first to verify the user's token.

// Create an invite (SECURED)
app.post('/api/invites', protect, async (req, res) => {
  // We get the resident's ID from req.user, which is securely set by the middleware.
  const resident_id = req.user.id;
  const { worker_id } = req.body;

  const { error } = await supabase.from('invites').insert([{ resident_id, worker_id }]);
  
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ success: true, message: 'Contact unlocked!' });
});

// Get secure profile details (SECURED)
app.get('/api/profiles/:worker_id/secure', protect, async (req, res) => {
  const { worker_id } = req.params;
  // The resident_id is now securely taken from the authenticated user.
  const resident_id = req.user.id;

  // Check if a valid invite exists
  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .select('*')
    .eq('resident_id', resident_id)
    .eq('worker_id', worker_id)
    .maybeSingle();

  if (inviteError || !invite) {
    return res.status(403).json({ error: 'Forbidden: No active invite found.' });
  }

  // If invite exists, fetch the full profile with phone number
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', worker_id)
    .single();

  if (profileError) return res.status(500).json({ error: profileError.message });
  res.json(profile);
});


// ## THIS IS THE ONLY LINE YOU NEED TO CHANGE ##
// Listen on all network interfaces, not just localhost
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on ALL network interfaces at port ${PORT}`);
});