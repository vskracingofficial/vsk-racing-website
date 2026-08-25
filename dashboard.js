const entries = JSON.parse(localStorage.getItem('vskRegistrations') || '[]');
document.querySelector('#total-count').textContent = entries.length;
document.querySelector('#pending-count').textContent = entries.filter(x => x.status === 'Pending verification').length;
document.querySelector('#program-count').textContent = entries.filter(x => (x.program || '').startsWith('Six')).length;
const rows = document.querySelector('#registration-rows');
const safe = value => String(value || '—').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
if (entries.length) { document.querySelector('#empty-state').hidden = true; rows.innerHTML = entries.map(x => `<tr><td><b>${safe(x.name)}</b><br><small>${safe(x.place)}</small></td><td>${safe(x.program)}</td><td>${safe(x.email)}<br>${safe(x.phone)}</td><td>${x.payment_receipt?.name ? 'Uploaded ✓' : 'Not uploaded'}</td><td><span class="status">${safe(x.status)}</span></td></tr>`).join(''); }
