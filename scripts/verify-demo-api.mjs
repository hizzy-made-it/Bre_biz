import assert from 'node:assert/strict';

// Integration checks for the live site. Synthetic data only; loopback targets only.
const origin = process.env.DEMO_TEST_ORIGIN;
const url = new URL(origin);
if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw new Error('Refusing to run against a non-loopback URL');
const password = process.env.ADMIN_PASSWORD;

const json = { 'Content-Type': 'application/json', Origin: origin };
const cookieFrom = (response) => (response.headers.get('set-cookie') ?? '').split(';')[0];
async function call(path, { method, body, cookie, headers = {} } = {}) {
  method ??= body === undefined ? 'GET' : 'POST';
  const response = await fetch(origin + path, { method, headers: { ...(body !== undefined ? json : { Origin: origin }), ...(cookie ? { Cookie: cookie } : {}), ...headers }, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body), redirect: 'manual' });
  const type = response.headers.get('content-type') ?? '';
  return { response, status: response.status, data: type.includes('json') ? await response.json() : await response.text() };
}
const future = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
let step = 0;
const ok = (label) => console.log(`  ✓ ${++step}. ${label}`);

// Public site is open to everyone.
assert.equal((await call('/api/health')).status, 200); ok('health');
const home = await call('/');
assert.equal(home.status, 200); assert.match(home.data, /Every Story/); assert.doesNotMatch(home.data, /demo access code/i); ok('home page loads without a login');
for (const page of ['/admin', '/portal']) assert.equal((await call(page)).status, 200);
ok('admin and portal sign-in pages render');
let site = (await call('/api/site')).data;
for (const secret of ['inquiries', 'clients', 'payments', 'events']) assert.equal(site[secret], undefined, `public site leaks ${secret}`);
assert.ok(site.services.length >= 1); ok('public data has no private records');

// Public inquiry.
const inquiry = { name: 'Test Host', email: 'host@example.test', phone: '', type: 'Garden party', service: site.services[0].title, date: future(40), time: '17:00', guests: 40, location: 'Sample Hall', budget: '', notes: '' };
assert.equal((await call('/api/inquiry', { body: inquiry, headers: { Origin: 'https://evil.example' } })).status, 403); ok('cross-origin inquiry refused');
assert.equal((await call('/api/inquiry', { body: { ...inquiry, email: 'nope' } })).status, 400); ok('invalid inquiry rejected');
const sent = await call('/api/inquiry', { body: inquiry });
assert.equal(sent.status, 200, JSON.stringify(sent.data)); assert.ok(sent.data.site.bookedSlots.some((s) => s.date === inquiry.date)); ok('inquiry saved and slot marked booked');
assert.equal((await call('/api/inquiry', { body: inquiry })).status, 400); ok('double booking refused');

// Admin auth.
assert.equal((await call('/api/admin')).status, 401); ok('admin data needs sign-in');
assert.equal((await call('/api/admin/login', { body: { password: 'wrong-password' } })).status, 401); ok('wrong admin password refused');
const login = await call('/api/admin/login', { body: { password } });
assert.equal(login.status, 200); const admin = cookieFrom(login.response); assert.match(login.response.headers.get('set-cookie'), /HttpOnly/); ok('admin signs in');
let { data: current } = await call('/api/admin', { cookie: admin });
assert.equal(current.state.inquiries.length, 1); assert.equal(current.stripeReady, false); ok('admin sees the inquiry');
const act = async (action, payload, expect = 200) => {
  const result = await call('/api/admin', { cookie: admin, body: { action, payload, version: current.version } });
  assert.equal(result.status, expect, `${action}: ${JSON.stringify(result.data)}`);
  if (result.status === 200) current = result.data;
  return result;
};

// Content, services, menus.
await act('saveContent', { values: { 'home.title': 'Celebrate Beautifully.', 'contact.email': 'hello@example.test' } });
site = (await call('/api/site')).data; assert.equal(site.content['home.title'], 'Celebrate Beautifully.'); ok('site text edits go live');
await act('saveContent', { values: { 'home.heroImage': 'https://evil.example/x.png' } }, 400); ok('unknown image sources refused');
await act('saveBarMenuItem', { name: 'Lavender Spritz', description: 'Sparkling and floral', category: 'Signature cocktails', price: '$12', image: '', published: true });
await act('saveFoodMenuItem', { ...current.state.foodMenu[0], price: '$8 / guest' });
site = (await call('/api/site')).data; assert.equal(site.barMenu[0].price, '$12'); assert.equal(site.foodMenu[0].price, '$8 / guest'); ok('menu items and prices publish');
await act('saveServices', { services: [...current.state.services.map((s, i) => i === 0 ? { ...s, price: 'From $500' } : s)] }); ok('service pricing saves');
const stale = await call('/api/admin', { cookie: admin, body: { action: 'saveContent', payload: { values: {} }, version: current.version - 1 } });
assert.equal(stale.status, 409); ok('stale admin edits are refused');

// Photo uploads.
const png = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63f8ffff3f0005fe02fea7d6a6d00000000049454e44ae426082', 'hex');
const form = new FormData(); form.append('file', new Blob([png], { type: 'image/png' }), 'a.png');
const up = await fetch(origin + '/api/admin/upload', { method: 'POST', headers: { Origin: origin, Cookie: admin }, body: form });
const upData = await up.json(); assert.equal(up.status, 200, JSON.stringify(upData));
const media = await fetch(origin + upData.path); assert.equal(media.headers.get('content-type'), 'image/png'); ok('photo uploads and serves');
const bad = new FormData(); bad.append('file', new Blob(['<svg/>'], { type: 'image/png' }), 'x.png');
assert.equal((await fetch(origin + '/api/admin/upload', { method: 'POST', headers: { Origin: origin, Cookie: admin }, body: bad })).status, 400); ok('non-images refused');
const anon = new FormData(); anon.append('file', new Blob([png]), 'a.png');
assert.equal((await fetch(origin + '/api/admin/upload', { method: 'POST', headers: { Origin: origin }, body: anon })).status, 401); ok('uploads need admin');
await act('saveContent', { values: { 'about.image': upData.path } }); ok('uploaded photo used on site');

// Clients.
await act('convertInquiry', { id: current.state.inquiries[0].id });
let client = current.state.clients[0];
assert.equal(client.guests, 40); assert.match(client.portalCode, /^[A-Z2-9]{8}$/); ok('booked inquiry becomes a client with an access code');
await act('saveClient', { ...client, total: 2000, deposit: 500, internalNotes: 'secret note', clientNotes: 'Arrive at 4' });
await act('recordPayment', { clientId: client.id, amount: 200, method: 'cash', note: '' });
client = current.state.clients[0];

// Client portal.
assert.equal((await call('/api/portal')).status, 401); ok('portal needs sign-in');
assert.equal((await call('/api/portal/login', { body: { email: client.email, code: 'WRONGCODE' } })).status, 401); ok('wrong code refused');
const portalLogin = await call('/api/portal/login', { body: { email: client.email.toUpperCase(), code: client.portalCode.toLowerCase() } });
assert.equal(portalLogin.status, 200); const portal = cookieFrom(portalLogin.response);
let view = (await call('/api/portal', { cookie: portal })).data;
assert.equal(view.client.guests, 40); assert.equal(view.balance, 1800); assert.equal(view.depositDue, 300); assert.equal(view.client.clientNotes, 'Arrive at 4');
assert.ok(!JSON.stringify(view).includes('secret note')); assert.ok(!JSON.stringify(view).includes(client.portalCode)); ok('client sees schedule, guests and balance — not private notes');

// Event changes are logged for the client.
const event = current.state.events.find((e) => e.id === client.eventId);
await act('updateEvent', { ...event, guests: 55, drinks: ['Lavender Spritz'], foods: [{ id: 'f1', menuItemId: null, name: 'Herb crostini', category: 'Appetizers', notes: '' }] });
view = (await call('/api/portal', { cookie: portal })).data;
assert.equal(view.client.guests, 55); assert.ok(view.plan.drinks.includes('Lavender Spritz'));
assert.ok(view.client.updates.some((u) => /Guest count changed from 40 to 55/.test(u.message))); assert.ok(view.client.updates.some((u) => /Herb crostini/.test(u.message))); ok('menu and guest changes show on the client page');

assert.equal((await call('/api/portal/pay', { cookie: portal, body: { kind: 'deposit' } })).status, 503); ok('card payment waits for Stripe keys');
assert.equal((await call('/api/stripe/webhook', { body: '{}', headers: { 'Stripe-Signature': 't=1,v1=00' } })).status, 400); ok('unsigned webhooks refused');

await act('resetPortalCode', { id: client.id });
assert.equal((await call('/api/portal', { cookie: portal })).status, 401); ok('new access code signs out old sessions');
console.log(`All ${step} site checks passed.`);
