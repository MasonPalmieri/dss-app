// One-time admin setup endpoint — creates enterprise users
// Protected by admin token, auto-disables after use

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGlzbmlpaHJjYXpneGhxZ2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDE0MywiZXhwIjoyMDg4NzI2MTQzfQ.Fyhak2OxvE8uLU25RcHog4QIGjUOJ5KK4WTik2V6Uq0';
const SUPABASE_URL = 'https://aqlisniihrcazgxhqgki.supabase.co';
const ADMIN_TOKEN = 'dss-admin-setup-2026';

const ENTERPRISE_USERS = [
  { full_name: 'Mason Palmieri',  email: 'mason@palmweb.net',       password: 'DSS2026!' },
  { full_name: 'Josiah Namie',    email: 'josiah@ndaexpress.ai',    password: 'DSS2026!' },
  { full_name: 'Charlton Boyd',   email: 'charlton@ndaexpress.com', password: 'DSS2026!' },
  { full_name: 'Matthew Knych',   email: 'matt@ndaexpress.com',     password: 'DSS2026!' },
];

const h = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (req.headers.authorization !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const results = [];

  for (const u of ENTERPRISE_USERS) {
    try {
      // Get all users and find by email
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, { headers: h });
      const listData = await listRes.json();
      const existing = listData.users?.find(x => x.email === u.email);

      let userId;

      if (existing) {
        userId = existing.id;
        // Update password + confirm
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
          method: 'PUT',
          headers: h,
          body: JSON.stringify({ password: u.password, email_confirm: true }),
        });
        results.push({ email: u.email, action: 'updated', userId });
      } else {
        const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
          method: 'POST',
          headers: h,
          body: JSON.stringify({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { full_name: u.full_name },
          }),
        });
        const created = await createRes.json();
        userId = created.id;
        if (!userId) {
          results.push({ email: u.email, action: 'failed', error: JSON.stringify(created) });
          continue;
        }
        results.push({ email: u.email, action: 'created', userId });
      }

      // Upsert enterprise profile
      await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: { ...h, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          id: userId,
          full_name: u.full_name,
          email: u.email,
          company: 'DraftSendSign',
          role: 'admin',
          plan: 'enterprise',
          subscription_status: 'active',
          avatar_initials: u.full_name.split(' ').map(n => n[0]).join('').toUpperCase(),
          trial_ends_at: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    } catch (err) {
      results.push({ email: u.email, action: 'error', error: err.message });
    }
  }

  return res.status(200).json({ success: true, results });
}
