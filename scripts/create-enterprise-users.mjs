// Run once to create/upgrade the 4 enterprise accounts
// Usage: node scripts/create-enterprise-users.mjs

const SUPABASE_URL = 'https://aqlisniihrcazgxhqgki.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGlzbmlpaHJjYXpneGhxZ2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDE0MywiZXhwIjoyMDg4NzI2MTQzfQ.Fyhak2OxvE8uLU25RcHog4QIGjUOJ5KK4WTik2V6Uq0';

const ENTERPRISE_USERS = [
  { full_name: 'Mason Palmieri',  email: 'mason@palmweb.net',       password: 'DSS2026!' },
  { full_name: 'Josiah Namie',    email: 'josiah@ndaexpress.ai',    password: 'DSS2026!' },
  { full_name: 'Charlton Boyd',   email: 'charlton@ndaexpress.com', password: 'DSS2026!' },
  { full_name: 'Matthew Knych',   email: 'matt@ndaexpress.com',     password: 'DSS2026!' },
];

const h = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

for (const u of ENTERPRISE_USERS) {
  console.log(`\nProcessing ${u.email}...`);

  // Check if user already exists
  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, { headers: h });
  const listData = await listRes.json();
  const existing = listData.users?.find(x => x.email === u.email);

  let userId;

  if (existing) {
    userId = existing.id;
    console.log(`  Found existing user: ${userId}`);
    // Update password and confirm email
    const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: h,
      body: JSON.stringify({ password: u.password, email_confirm: true }),
    });
    const updated = await updateRes.json();
    if (updated.id) console.log(`  Updated password + email confirmed`);
    else console.log(`  Update result:`, JSON.stringify(updated));
  } else {
    // Create new user
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
    if (!userId) { console.log(`  FAILED:`, JSON.stringify(created)); continue; }
    console.log(`  Created new user: ${userId}`);
  }

  // Upsert enterprise profile
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
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

  if (profileRes.status === 201 || profileRes.status === 204) {
    console.log(`  ✓ Enterprise profile set — unlimited access`);
  } else {
    console.log(`  Profile status: ${profileRes.status}`, await profileRes.text());
  }
}

console.log('\n✓ Done. All enterprise accounts configured.');
console.log('Default password for new accounts: DSS2026!');
console.log('Users can change their password at: https://app.draftsendsign.com/#/settings');
