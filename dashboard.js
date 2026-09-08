const client = window.supabase && window.VSK_SUPABASE_ANON_KEY
  ? window.supabase.createClient(window.VSK_SUPABASE_URL, window.VSK_SUPABASE_ANON_KEY)
  : null;
const loginPanel = document.querySelector('#login-panel');
const dashboardContent = document.querySelector('#dashboard-content');
const loginForm = document.querySelector('#admin-login');
const loginError = document.querySelector('#login-error');
const dashboardError = document.querySelector('#dashboard-error');
const rows = document.querySelector('#registration-rows');
const safe = value => String(value || '—').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

function showLogin(message = '') {
  loginPanel.hidden = false;
  dashboardContent.hidden = true;
  loginError.hidden = !message;
  loginError.textContent = message;
}

function render(entries) {
  document.querySelector('#total-count').textContent = entries.length;
  document.querySelector('#pending-count').textContent = entries.filter(x => x.status === 'Pending verification').length;
  document.querySelector('#program-count').textContent = entries.filter(x => (x.program || '').startsWith('Six')).length;
  document.querySelector('#empty-state').hidden = entries.length > 0;
  rows.innerHTML = entries.map(x => `<tr><td><b>${safe(x.name)}</b><br><small>${safe(x.place)}</small></td><td>${safe(x.program)}</td><td>${safe(x.email)}<br>${safe(x.phone)}</td><td>${x.payment_receipt_path ? 'Uploaded ✓' : 'Not uploaded'}</td><td><span class="status">${safe(x.status)}</span></td></tr>`).join('');
}

async function loadEntries() {
  const { data, error } = await client.from('registrations').select('*').order('created_at', { ascending: false });
  if (error) {
    dashboardError.hidden = false;
    dashboardError.textContent = `Could not load registrations: ${error.message}`;
    return;
  }
  dashboardError.hidden = true;
  render(data || []);
}

async function showDashboard() {
  loginPanel.hidden = true;
  dashboardContent.hidden = false;
  await loadEntries();
}

loginForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!client) return showLogin('Database configuration is unavailable.');
  const fields = new FormData(loginForm);
  const submit = loginForm.querySelector('button');
  submit.disabled = true;
  const { error } = await client.auth.signInWithPassword({ email: fields.get('email'), password: fields.get('password') });
  submit.disabled = false;
  if (error) return showLogin(error.message);
  await showDashboard();
});

document.querySelector('#sign-out')?.addEventListener('click', async () => {
  await client.auth.signOut();
  showLogin();
});

(async () => {
  if (!client) return showLogin('Database configuration is unavailable.');
  const { data: { session } } = await client.auth.getSession();
  if (session) await showDashboard();
  else showLogin();
})();
