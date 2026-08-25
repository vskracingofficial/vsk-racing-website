const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', open); });

const modal = document.querySelector('#registration-modal');
const eventName = document.querySelector('#selected-event');
const form = document.querySelector('#registration-form');
const success = document.querySelector('.success-message');
const supabaseClient = window.supabase && window.VSK_SUPABASE_ANON_KEY ? window.supabase.createClient(window.VSK_SUPABASE_URL, window.VSK_SUPABASE_ANON_KEY) : null;
document.querySelectorAll('.register-btn').forEach(button => button.addEventListener('click', () => {
  eventName.textContent = button.dataset.event;
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
}));
function closeModal() { modal?.classList.remove('open'); modal?.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
document.querySelector('.close-modal')?.addEventListener('click', closeModal);
document.querySelector('.close-success')?.addEventListener('click', closeModal);
modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
let currentStep = 1;
function showStep(step) { currentStep = step; document.querySelectorAll('.form-step').forEach(el => el.classList.toggle('active', Number(el.dataset.step) === step)); document.querySelectorAll('.registration-steps span').forEach(el => el.classList.toggle('active', Number(el.dataset.step) <= step)); }
document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => { const current = document.querySelector(`.form-step[data-step="${currentStep}"]`); if (!current.querySelectorAll('input:invalid, select:invalid').length) showStep(Number(button.dataset.next)); else current.querySelector('input:invalid, select:invalid')?.reportValidity(); }));
document.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => showStep(Number(button.dataset.back))));
form?.addEventListener('submit', async event => { event.preventDefault(); const submit = form.querySelector('[type="submit"]'); submit.disabled = true; submit.textContent = 'UPLOADING…'; const data = Object.fromEntries(new FormData(form)); data.event = eventName.textContent; data.status = 'Pending verification'; data.created_at = new Date().toISOString(); try { if (!supabaseClient) throw new Error('Database connection unavailable'); const safeName = String(data.name).replace(/[^a-z0-9]/gi, '-').toLowerCase(); const stamp = Date.now(); const upload = async (file, prefix) => { const path = `${stamp}-${safeName}/${prefix}-${file.name.replace(/[^a-z0-9.]/gi, '-')}`; const { error } = await supabaseClient.storage.from('vsk-documents').upload(path, file, { upsert: false }); if (error) throw error; return path; }; const payment_receipt_path = await upload(data.payment_receipt, 'payment'); const driving_license_path = await upload(data.driving_license, 'licence'); const { error } = await supabaseClient.from('registrations').insert({ event:data.event, email:data.email, name:data.name, place:data.place, date_of_birth:data.date_of_birth, phone:data.phone, emergency_phone:data.emergency_phone, emergency_contact:data.emergency_contact, racing_experience:data.racing_experience, program:data.program, media_package:data.media_package, meal_preference:data.meal_preference, payment_receipt_path, driving_license_path, status:data.status }); if (error) throw error; form.hidden = true; success.hidden = false; } catch (error) { console.error(error); alert('We could not submit your registration yet. Please try again or contact the VSK team.'); submit.disabled = false; submit.innerHTML = 'SUBMIT FOR VERIFICATION <span>→</span>'; } });
