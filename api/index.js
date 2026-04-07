const { createClient } = require(’@supabase/supabase-js’);
const bcrypt = require(‘bcryptjs’);

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_ANON_KEY
);

const SECURE_API_KEY = process.env.API_KEY || ‘PB_SECURE_API_KEY_2026’;

module.exports = async (req, res) => {
if (typeof req.body === “string”) {
try { req.body = JSON.parse(req.body); } catch {}
}
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);
if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.json({ success: false, error: ‘POST only’ });

try {
const { action, data = {}, apiKey } = req.body;
if (apiKey !== SECURE_API_KEY) return res.json({ success: false, error: ‘Unauthorized’ });

```
let result;
switch (action) {
  case 'login':                result = await loginUser(data); break;
  case 'signup':               result = await signupUser(data); break;
  case 'adminLogin':           result = await adminLogin(data); break;
  case 'staffLogin':           result = await staffLogin(data); break;
  case 'updateProfile':        result = await updateProfile(data); break;
  case 'getMenu':              result = await getMenu(data); break;
  case 'adminGetMenu':         result = await adminGetMenu(); break;
  case 'addMenuItem':          result = await addMenuItem(data); break;
  case 'updateMenuItem':       result = await updateMenuItem(data); break;
  case 'deleteMenuItem':       result = await deleteMenuItem(data); break;
  case 'updateMenuOrder':      result = await updateMenuOrder(data); break;
  case 'createOrder':          result = await createOrder(data); break;
  case 'getUserOrders':        result = await getUserOrders(data); break;
  case 'adminGetOrders':       result = await adminGetOrders(); break;
  case 'updateOrderStatus':    result = await updateOrderStatus(data); break;
  case 'rejectOrder':          result = await rejectOrder(data); break;
  case 'bulkOrdersWithBalance':result = await bulkOrdersWithBalance(data); break;
  case 'adminBulkCreate':      result = await adminBulkCreate(data); break;
  case 'applyCoupon':          result = await applyCoupon(data); break;
  case 'createCoupon':         result = await createCoupon(data); break;
  case 'adminGetCoupons':      result = await adminGetCoupons(); break;
  case 'deleteCoupon':         result = await deleteCoupon(data); break;
  case 'checkSubscriber':      result = await checkSubscriber(data); break;
  case 'adminGetSubscribers':  result = await adminGetSubscribers(); break;
  case 'addSubscriber':        result = await addSubscriber(data); break;
  case 'updateSubscriber':     result = await updateSubscriber(data); break;
  case 'removeSubscriber':     result = await removeSubscriber(data); break;
  case 'getUserByPhone':       result = await getUserByPhone(data); break;
  case 'promoteToSubscriber':  result = await promoteToSubscriber(data); break;
  case 'createRider':          result = await createRider(data); break;
  case 'updateRider':          result = await updateRider(data); break;
  case 'deleteRider':          result = await deleteRider(data); break;
  case 'riderLogin':           result = await riderLogin(data); break;
  case 'getRiderOrders':       result = await getRiderOrders(data); break;
  case 'getRiders':            result = await getRiders(); break;
  case 'assignRider':          result = await assignRider(data); break;
  case 'createStaff':          result = await createStaff(data); break;
  case 'updateStaff':          result = await updateStaff(data); break;
  case 'deleteStaff':          result = await deleteStaff(data); break;
  case 'getStaff':             result = await getStaff(); break;
  case 'getKhata':             result = await getKhata(data); break;
  case 'getSubscriberBalance': result = await getSubscriberBalance(data); break;
  case 'rechargeWallet':       result = await rechargeWallet(data); break;
  case 'adminGetAllKhata':     result = await adminGetAllKhata(); break;
  case 'addKhataEntry':        result = await addKhataEntry(data); break;
  case 'getOrderCutoff':       result = await getOrderCutoff(); break;
  case 'setOrderCutoff':       result = await setOrderCutoff(data); break;
  case 'getWeeklySchedule':    result = await getWeeklySchedule(); break;
  case 'setWeeklySchedule':    result = await setWeeklySchedule(data); break;
  case 'getKhataEnabled':      result = await getKhataEnabled(); break;
  case 'setKhataEnabled':      result = await setKhataEnabled(data); break;
  case 'getAnalytics':         result = await getAnalytics(); break;
  case 'getUsers':             result = await getUsers(); break;
  case 'resetAdminPassword':   result = await resetAdminPassword(data); break;
  case 'forceUdharOrder':      result = await forceUdharOrder(data); break;
  case 'deleteOldData':        result = await deleteOldData(data); break;
  default: return res.json({ success: false, error: 'Unknown action: ' + action });
}
return res.json({ success: true, data: result });
```

} catch (err) {
console.error(‘API Error:’, err);
return res.json({ success: false, error: err.message });
}
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function getIST() {
return new Date(Date.now() + 5.5 * 3600000);
}
function istDateStr(d) {
return String(d.getUTCDate()).padStart(2,‘0’) + ‘/’ +
String(d.getUTCMonth()+1).padStart(2,‘0’) + ‘/’ +
d.getUTCFullYear();
}
function istTimeStr(d) {
let h = d.getUTCHours(), m = d.getUTCMinutes();
const p = h >= 12 ? ‘PM’ : ‘AM’;
h = h % 12 || 12;
return String(h).padStart(2,‘0’) + ‘:’ + String(m).padStart(2,‘0’) + ’ ’ + p;
}
function cleanPhone(p) {
return String(p || ‘’).replace(/\D/g, ‘’);
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────
async function signupUser(data) {
if (!data.phone || !data.password || !data.name) throw new Error(‘Name, phone, password required’);
const ph = cleanPhone(data.phone);
const { data: existing } = await supabase.from(‘users’).select(‘phone’).eq(‘phone’, ph).maybeSingle();
if (existing) throw new Error(‘Phone already registered’);
const hashed = await bcrypt.hash(String(data.password), 10);
const { data: user, error } = await supabase.from(‘users’).insert({
name: data.name, phone: ph,
email: data.email || ‘’, address: data.address || ‘’,
password: hashed, role: ‘customer’
}).select().single();
if (error) throw new Error(error.message);
return { userId: user.user_id, name: user.name, phone: user.phone, email: user.email || ‘’, address: user.address || ‘’ };
}

async function loginUser(data) {
if (!data.phone || !data.password) throw new Error(‘Phone and password required’);
const ph = cleanPhone(data.phone);
const { data: user } = await supabase.from(‘users’).select(’*’).eq(‘phone’, ph).maybeSingle();
if (!user) throw new Error(‘User not found’);
const match = await bcrypt.compare(String(data.password), user.password);
if (!match) throw new Error(‘Incorrect password’);
return { userId: user.user_id, name: user.name, phone: user.phone, email: user.email || ‘’, address: user.address || ‘’ };
}

async function adminLogin(data) {
if (!data.email || !data.password) throw new Error(‘Email and password required’);
const email = String(data.email).trim().toLowerCase();
const { data: setting } = await supabase.from(‘admin_settings’).select(’*’).eq(‘admin_id’, email).maybeSingle();
if (!setting) throw new Error(‘Admin not found’);
const match = await bcrypt.compare(String(data.password), setting.password_hash);
if (!match) throw new Error(‘Incorrect password’);
return { email, name: ‘Admin’, role: ‘admin’ };
}

async function resetAdminPassword(data) {
if (!data.newPassword || String(data.newPassword).length < 6) throw new Error(‘Password must be 6+ characters’);
const hashed = await bcrypt.hash(String(data.newPassword), 10);
const email = data.email || ‘visaryhal2022@vishal.com’;
const { error } = await supabase.from(‘admin_settings’)
.update({ password_hash: hashed })
.eq(‘admin_id’, email);
if (error) throw new Error(error.message);
return { success: true, message: ‘Password updated’ };
}

async function updateProfile(data) {
if (!data.userId) throw new Error(‘userId required’);
const updates = {};
if (data.name !== undefined) updates.name = data.name;
if (data.email !== undefined) updates.email = data.email;
if (data.address !== undefined) updates.address = data.address;
if (data.newPassword) updates.password = await bcrypt.hash(String(data.newPassword), 10);
const { error } = await supabase.from(‘users’).update(updates).eq(‘user_id’, data.userId);
if (error) throw new Error(error.message);
return true;
}

async function staffLogin(data) {
if (!data.username || !data.password) throw new Error(‘Username and password required’);
const { data: s } = await supabase.from(‘staff’).select(’*’).eq(‘username’, data.username).maybeSingle();
if (!s) throw new Error(‘Invalid credentials’);
const match = await bcrypt.compare(String(data.password), s.password);
if (!match) throw new Error(‘Invalid credentials’);
if (s.status !== ‘active’) throw new Error(‘Account is inactive’);
return { username: s.username, name: s.name, role: ‘staff’ };
}

// ─────────────────────────────────────────────────────────────
// MENU
// ─────────────────────────────────────────────────────────────
async function getMenu(data) {
const ist = getIST();
const h = ist.getUTCHours() + ist.getUTCMinutes() / 60;
const menuType = h < 11.5 ? ‘morning’ : ‘evening’;
const { data: items, error } = await supabase.from(‘menu’)
.select(’*’).eq(‘availability’, true).eq(‘menu_type’, menuType)
.order(‘sort_order’, { ascending: true });
if (error) throw new Error(error.message);
return (items || []).map(formatMenuItem);
}

async function adminGetMenu() {
const { data: items, error } = await supabase.from(‘menu’)
.select(’*’).order(‘sort_order’, { ascending: true });
if (error) throw new Error(error.message);
return (items || []).map(formatMenuItem);
}

function formatMenuItem(i) {
let variants = [];
try { variants = i.variant ? JSON.parse(i.variant) : []; } catch { variants = []; }
return {
itemId: i.item_id, name: i.name, category: i.category || ‘’,
price: Number(i.price) || 0, variants,
imageUrl: i.image_url || ‘’, menuType: i.menu_type || ‘morning’,
availability: i.availability, sortOrder: i.sort_order || 9999,
highlight: i.highlight || ‘’
};
}

async function addMenuItem(data) {
if (!data.name) throw new Error(‘Item name required’);
const { data: items } = await supabase.from(‘menu’).select(‘sort_order’).order(‘sort_order’, { ascending: false }).limit(1);
const maxSort = items?.[0]?.sort_order || 0;
const { data: item, error } = await supabase.from(‘menu’).insert({
name: data.name, category: data.category || ‘’,
price: Number(data.price) || 0,
variant: data.variants ? JSON.stringify(data.variants) : null,
image_url: data.imageUrl || ‘’,
menu_type: data.menuType || ‘morning’,
availability: true,
highlight: data.highlight || ‘’,
sort_order: data.sortOrder || (maxSort + 1)
}).select().single();
if (error) throw new Error(error.message);
return { itemId: item.item_id };
}

async function updateMenuItem(data) {
if (!data.itemId) throw new Error(‘itemId required’);
const updates = {};
if (data.name !== undefined) updates.name = data.name;
if (data.category !== undefined) updates.category = data.category;
if (data.price !== undefined) updates.price = Number(data.price);
if (data.variants !== undefined) updates.variant = JSON.stringify(data.variants);
if (data.imageUrl !== undefined) updates.image_url = data.imageUrl;
if (data.menuType !== undefined) updates.menu_type = data.menuType;
if (data.availability !== undefined) updates.availability = data.availability === ‘TRUE’ || data.availability === true;
if (data.highlight !== undefined) updates.highlight = data.highlight;
if (data.sortOrder !== undefined) updates.sort_order = Number(data.sortOrder);
const { error } = await supabase.from(‘menu’).update(updates).eq(‘item_id’, data.itemId);
if (error) throw new Error(error.message);
return true;
}

async function deleteMenuItem(data) {
if (!data.itemId) throw new Error(‘itemId required’);
const { error } = await supabase.from(‘menu’).delete().eq(‘item_id’, data.itemId);
if (error) throw new Error(error.message);
return true;
}

async function updateMenuOrder(data) {
if (!data.items || !Array.isArray(data.items)) throw new Error(‘items array required’);
for (const item of data.items) {
await supabase.from(‘menu’).update({ sort_order: Number(item.sortOrder) }).eq(‘item_id’, item.itemId);
}
return true;
}

// ─────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────
async function createOrder(data) {
if (!data.userId) throw new Error(‘userId required’);
const items = Array.isArray(data.items) ? data.items : JSON.parse(data.items || ‘[]’);
if (!items.length) throw new Error(‘Cart is empty’);
const ist = getIST();
const { data: order, error } = await supabase.from(‘orders’).insert({
user_id: data.userId,
name: data.name, phone: cleanPhone(data.phone), address: data.address,
items: items,
total_amount: Number(data.totalAmount) || 0,
delivery_charge: Number(data.deliveryCharge) || 0,
final_amount: Number(data.finalAmount) || 0,
coupon_code: data.couponCode || ‘’,
discount: Number(data.discount) || 0,
user_type: data.userType || ‘daily’,
payment_status: ‘pending’,
order_status: ‘pending’,
order_date: istDateStr(ist),
order_time: istTimeStr(ist)
}).select().single();
if (error) throw new Error(error.message);
if (data.userType === ‘subscriber’ && data.payFromWallet) {
const ph = cleanPhone(data.phone);
const amount = Number(data.finalAmount) || 0;
await deductWalletBalance(ph, amount, `Order ${order.order_id}`, data.userId);
}
if (data.couponCode) await incrementCouponUsage(data.couponCode, cleanPhone(data.phone));
return { orderId: order.order_id };
}

async function getUserOrders(data) {
if (!data.userId) throw new Error(‘userId required’);
const { data: orders, error } = await supabase
.from(‘orders’).select(’*’).eq(‘user_id’, data.userId)
.order(‘order_date’, { ascending: false });
if (error) throw new Error(error.message);
return (orders || []).map(formatOrder);
}

async function adminGetOrders() {
const { data: orders, error } = await supabase
.from(‘orders’).select(’*’)
.order(‘order_date’, { ascending: false });
if (error) throw new Error(error.message);
return (orders || []).map(formatOrder);
}

// ─────────────────────────────────────────────────────────────
// DATE / TIME NORMALIZERS
// ─────────────────────────────────────────────────────────────
function normOrderDate(v) {
if (!v) return ‘’;
const s = String(v).trim();
if (/^\d{2}/\d{2}/\d{4}$/.test(s)) return s;
if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
const [yyyy, mm, dd] = s.split(’-’);
return `${dd}/${mm}/${yyyy}`;
}
if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
const ist = new Date(new Date(s).getTime() + 5.5 * 3600000);
if (!isNaN(ist.getTime())) {
return String(ist.getUTCDate()).padStart(2,‘0’) + ‘/’ +
String(ist.getUTCMonth()+1).padStart(2,‘0’) + ‘/’ +
ist.getUTCFullYear();
}
}
return s;
}

function normOrderTime(v) {
if (!v) return ‘’;
const s = String(v).trim();
if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(s)) return s;
const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
if (m) {
let h = parseInt(m[1]), mn = parseInt(m[2]);
const p = h >= 12 ? ‘PM’ : ‘AM’;
h = h % 12 || 12;
return String(h).padStart(2,‘0’) + ‘:’ + String(mn).padStart(2,‘0’) + ’ ’ + p;
}
if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
const ist = new Date(new Date(s).getTime() + 5.5 * 3600000);
if (!isNaN(ist.getTime())) {
let h = ist.getUTCHours(), mn = ist.getUTCMinutes();
const p = h >= 12 ? ‘PM’ : ‘AM’;
h = h % 12 || 12;
return String(h).padStart(2,‘0’) + ‘:’ + String(mn).padStart(2,‘0’) + ’ ’ + p;
}
}
return s;
}

function formatOrder(o) {
return {
orderId: o.order_id,
userId: o.user_id,
name: o.name, phone: o.phone, address: o.address,
items: typeof o.items === ‘string’ ? o.items : JSON.stringify(o.items),
totalAmount: o.total_amount,
deliveryCharge: o.delivery_charge,
finalAmount: Number(o.final_amount) || 0,
couponCode: o.coupon_code || ‘’,
discount: o.discount || 0,
userType: o.user_type || ‘daily’,
paymentStatus: o.payment_status || ‘pending’,
orderStatus: o.order_status || ‘pending’,
date: normOrderDate(o.order_date),
time: normOrderTime(o.order_time),
riderId: o.rider_id || ‘’
};
}

async function updateOrderStatus(data) {
if (!data.orderId) throw new Error(‘orderId required’);
const updates = { order_status: data.status };
if (data.paymentStatus) updates.payment_status = data.paymentStatus;
if (data.riderId) updates.rider_id = data.riderId;
const { error } = await supabase.from(‘orders’).update(updates).eq(‘order_id’, data.orderId);
if (error) throw new Error(error.message);
return true;
}

async function rejectOrder(data) {
if (!data.orderId) throw new Error(‘orderId required’);
const { error } = await supabase.from(‘orders’)
.update({ order_status: ‘rejected’ }).eq(‘order_id’, data.orderId);
if (error) throw new Error(error.message);
return true;
}

// ─────────────────────────────────────────────────────────────
// FORCE UDHAR ORDER — FIX: was truncated/incomplete
// ─────────────────────────────────────────────────────────────
async function forceUdharOrder(data) {
if (!data.userId) throw new Error(‘userId required’);
const items = Array.isArray(data.items) ? data.items : JSON.parse(data.items || ‘[]’);
const ist = getIST();
const { data: order, error } = await supabase.from(‘orders’).insert({
user_id: data.userId,
name: data.name, phone: cleanPhone(data.phone), address: data.address || ‘’,
items: items,
total_amount: Number(data.totalAmount) || 0,
delivery_charge: 0,
final_amount: Number(data.finalAmount) || 0,
coupon_code: ‘’, discount: 0,
user_type: ‘subscriber’,
payment_status: ‘pending’,
order_status: ‘pending’,
order_date: istDateStr(ist),
order_time: istTimeStr(ist)
}).select().single();
if (error) throw new Error(error.message);
const ph = cleanPhone(data.phone);
const amount = Number(data.finalAmount) || 0;
await deductWalletBalance(ph, amount, `Udhar Order ${order.order_id}`, data.userId);
return { orderId: order.order_id };
}

// ─────────────────────────────────────────────────────────────
// BULK ORDERS
// ─────────────────────────────────────────────────────────────
async function bulkOrdersWithBalance(data) {
if (!Array.isArray(data.orders) || !data.orders.length) throw new Error(‘orders array required’);
const ist = getIST();
const results = [];
for (const o of data.orders) {
const items = Array.isArray(o.items) ? o.items : JSON.parse(o.items || ‘[]’);
const { data: order, error } = await supabase.from(‘orders’).insert({
user_id: o.userId,
name: o.name, phone: cleanPhone(o.phone), address: o.address || ‘’,
items: items,
total_amount: Number(o.totalAmount) || 0,
delivery_charge: Number(o.deliveryCharge) || 0,
final_amount: Number(o.finalAmount) || 0,
coupon_code: o.couponCode || ‘’, discount: Number(o.discount) || 0,
user_type: o.userType || ‘subscriber’,
payment_status: ‘pending’, order_status: ‘pending’,
order_date: istDateStr(ist), order_time: istTimeStr(ist)
}).select().single();
if (error) { results.push({ error: error.message, phone: o.phone }); continue; }
if (o.payFromWallet) {
await deductWalletBalance(cleanPhone(o.phone), Number(o.finalAmount) || 0, `Bulk Order ${order.order_id}`, o.userId);
}
results.push({ orderId: order.order_id, phone: o.phone });
}
return results;
}

async function adminBulkCreate(data) {
if (!Array.isArray(data.orders) || !data.orders.length) throw new Error(‘orders array required’);
const ist = getIST();
const results = [];
for (const o of data.orders) {
const items = Array.isArray(o.items) ? o.items : JSON.parse(o.items || ‘[]’);
const { data: order, error } = await supabase.from(‘orders’).insert({
user_id: o.userId || null,
name: o.name, phone: cleanPhone(o.phone), address: o.address || ‘’,
items: items,
total_amount: Number(o.totalAmount) || 0,
delivery_charge: Number(o.deliveryCharge) || 0,
final_amount: Number(o.finalAmount) || 0,
coupon_code: ‘’, discount: 0,
user_type: o.userType || ‘daily’,
payment_status: ‘pending’, order_status: ‘pending’,
order_date: istDateStr(ist), order_time: istTimeStr(ist)
}).select().single();
if (error) { results.push({ error: error.message }); continue; }
results.push({ orderId: order.order_id });
}
return results;
}

// ─────────────────────────────────────────────────────────────
// COUPONS
// ─────────────────────────────────────────────────────────────
async function applyCoupon(data) {
if (!data.code || !data.phone) throw new Error(‘code and phone required’);
const ph = cleanPhone(data.phone);
const { data: coupon } = await supabase.from(‘coupons’).select(’*’).eq(‘code’, data.code.toUpperCase()).maybeSingle();
if (!coupon) throw new Error(‘Invalid coupon code’);
if (!coupon.active) throw new Error(‘Coupon is inactive’);
if (coupon.expiry && new Date(coupon.expiry) < new Date()) throw new Error(‘Coupon has expired’);
if (coupon.max_uses && coupon.used_count >= coupon.max_uses) throw new Error(‘Coupon usage limit reached’);
// per-user limit check
if (coupon.max_uses_per_user) {
const used = (coupon.used_by || []).filter(u => u === ph).length;
if (used >= coupon.max_uses_per_user) throw new Error(‘You have already used this coupon’);
}
const orderTotal = Number(data.orderTotal) || 0;
if (coupon.min_order && orderTotal < coupon.min_order) throw new Error(`Minimum order ₹${coupon.min_order} required`);
let discount = 0;
if (coupon.type === ‘percent’) {
discount = Math.floor(orderTotal * coupon.value / 100);
if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
} else {
discount = Number(coupon.value) || 0;
}
return { discount, code: coupon.code, type: coupon.type, value: coupon.value };
}

async function incrementCouponUsage(code, phone) {
const { data: coupon } = await supabase.from(‘coupons’).select(’*’).eq(‘code’, code.toUpperCase()).maybeSingle();
if (!coupon) return;
const usedBy = coupon.used_by || [];
usedBy.push(phone);
await supabase.from(‘coupons’).update({ used_count: (coupon.used_count || 0) + 1, used_by: usedBy }).eq(‘code’, code.toUpperCase());
}

async function createCoupon(data) {
if (!data.code) throw new Error(‘Coupon code required’);
const { data: coupon, error } = await supabase.from(‘coupons’).insert({
code: data.code.toUpperCase(),
type: data.type || ‘flat’,
value: Number(data.value) || 0,
min_order: Number(data.minOrder) || 0,
max_discount: data.maxDiscount ? Number(data.maxDiscount) : null,
max_uses: data.maxUses ? Number(data.maxUses) : null,
max_uses_per_user: data.maxUsesPerUser ? Number(data.maxUsesPerUser) : 1,
expiry: data.expiry || null,
active: true,
used_count: 0,
used_by: []
}).select().single();
if (error) throw new Error(error.message);
return { couponId: coupon.coupon_id };
}

async function adminGetCoupons() {
const { data: coupons, error } = await supabase.from(‘coupons’).select(’*’).order(‘created_at’, { ascending: false });
if (error) throw new Error(error.message);
return (coupons || []).map(c => ({
couponId: c.coupon_id, code: c.code, type: c.type, value: c.value,
minOrder: c.min_order || 0, maxDiscount: c.max_discount,
maxUses: c.max_uses, maxUsesPerUser: c.max_uses_per_user,
expiry: c.expiry, active: c.active, usedCount: c.used_count || 0
}));
}

async function deleteCoupon(data) {
if (!data.couponId) throw new Error(‘couponId required’);
const { error } = await supabase.from(‘coupons’).delete().eq(‘coupon_id’, data.couponId);
if (error) throw new Error(error.message);
return true;
}

// ─────────────────────────────────────────────────────────────
// SUBSCRIBERS
// ─────────────────────────────────────────────────────────────
async function checkSubscriber(data) {
if (!data.phone) throw new Error(‘phone required’);
const ph = cleanPhone(data.phone);
const { data: sub } = await supabase.from(‘subscribers’).select(’*’).eq(‘phone’, ph).maybeSingle();
if (!sub) return { isSubscriber: false };
return {
isSubscriber: true,
name: sub.name, phone: sub.phone,
plan: sub.plan || ‘’, balance: Number(sub.balance) || 0,
status: sub.status || ‘active’
};
}

async function adminGetSubscribers() {
const { data: subs, error } = await supabase.from(‘subscribers’).select(’*’).order(‘name’, { ascending: true });
if (error) throw new Error(error.message);
return (subs || []).map(formatSubscriber);
}

function formatSubscriber(s) {
return {
subscriberId: s.subscriber_id, name: s.name, phone: s.phone,
plan: s.plan || ‘’, balance: Number(s.balance) || 0,
status: s.status || ‘active’, address: s.address || ‘’,
userId: s.user_id || ‘’
};
}

async function addSubscriber(data) {
if (!data.phone || !data.name) throw new Error(‘name and phone required’);
const ph = cleanPhone(data.phone);
const { data: existing } = await supabase.from(‘subscribers’).select(‘phone’).eq(‘phone’, ph).maybeSingle();
if (existing) throw new Error(‘Subscriber already exists’);
const { data: sub, error } = await supabase.from(‘subscribers’).insert({
name: data.name, phone: ph,
plan: data.plan || ‘’, balance: Number(data.balance) || 0,
status: ‘active’, address: data.address || ‘’,
user_id: data.userId || null
}).select().single();
if (error) throw new Error(error.message);
return { subscriberId: sub.subscriber_id };
}

async function updateSubscriber(data) {
if (!data.subscriberId) throw new Error(‘subscriberId required’);
const updates = {};
if (data.name !== undefined) updates.name = data.name;
if (data.plan !== undefined) updates.plan = data.plan;
if (data.balance !== undefined) updates.balance = Number(data.balance);
if (data.status !== undefined) updates.status = data.status;
if (data.address !== undefined) updates.address = data.address;
const { error } = await supabase.from(‘subscribers’).update(updates).eq(‘subscriber_id’, data.subscriberId);
if (error) throw new Error(error.message);
return true;
}

async function removeSubscriber(data) {
if (!data.subscriberId) throw new Error(‘subscriberId required’);
const { error } = await supabase.from(‘subscribers’).delete().eq(‘subscriber_id’, data.subscriberId);
if (error) throw new Error(error.message);
return true;
}

async function getUserByPhone(data) {
if (!data.phone) throw new Error(‘phone required’);
const ph = cleanPhone(data.phone);
const { data: user } = await supabase.from(‘users’).select(’*’).eq(‘phone’, ph).maybeSingle();
if (!user) return null;
return { userId: user.user_id, name: user.name, phone: user.phone, email: user.email || ‘’, address: user.address || ‘’ };
}

async function promoteToSubscriber(data) {
if (!data.userId || !data.phone) throw new Error(‘userId and phone required’);
const ph = cleanPhone(data.phone);
const { data: existing } = await supabase.from(‘subscribers’).select(‘phone’).eq(‘phone’, ph).maybeSingle();
if (existing) throw new Error(‘Already a subscriber’);
const { data: user } = await supabase.from(‘users’).select(’*’).eq(‘user_id’, data.userId).maybeSingle();
if (!user) throw new Error(‘User not found’);
const { data: sub, error } = await supabase.from(‘subscribers’).insert({
name: user.name, phone: ph,
plan: data.plan || ‘’, balance: Number(data.balance) || 0,
status: ‘active’, address: user.address || ‘’,
user_id: data.userId
}).select().single();
if (error) throw new Error(error.message);
return { subscriberId: sub.subscriber_id };
}

// ─────────────────────────────────────────────────────────────
// RIDERS
// ─────────────────────────────────────────────────────────────
async function createRider(data) {
if (!data.name || !data.phone || !data.password) throw new Error(‘name, phone, password required’);
const ph = cleanPhone(data.phone);
const hashed = await bcrypt.hash(String(data.password), 10);
const { data: rider, error } = await supabase.from(‘riders’).insert({
name: data.name, phone: ph, password: hashed, status: ‘active’
}).select().single();
if (error) throw new Error(error.message);
return { riderId: rider.rider_id };
}

async function updateRider(data) {
if (!data.riderId) throw new Error(‘riderId required’);
const updates = {};
if (data.name !== undefined) updates.name = data.name;
if (data.phone !== undefined) updates.phone = cleanPhone(data.phone);
if (data.status !== undefined) updates.status = data.status;
if (data.password) updates.password = await bcrypt.hash(String(data.password), 10);
const { error } = await supabase.from(‘riders’).update(updates).eq(‘rider_id’, data.riderId);
if (error) throw new Error(error.message);
return true;
}

async function deleteRider(data) {
if (!data.riderId) throw new Error(‘riderId required’);
const { error } = await supabase.from(‘riders’).delete().eq(‘rider_id’, data.riderId);
if (error) throw new Error(error.message);
return true;
}

async function riderLogin(data) {
if (!data.phone || !data.password) throw new Error(‘phone and password required’);
const ph = cleanPhone(data.phone);
const { data: rider } = await supabase.from(‘riders’).select(’*’).eq(‘phone’, ph).maybeSingle();
if (!rider) throw new Error(‘Rider not found’);
const match = await bcrypt.compare(String(data.password), rider.password);
if (!match) throw new Error(‘Incorrect password’);
if (rider.status !== ‘active’) throw new Error(‘Account inactive’);
return { riderId: rider.rider_id, name: rider.name, phone: rider.phone };
}

async function getRiderOrders(data) {
if (!data.riderId) throw new Error(‘riderId required’);
const { data: orders, error } = await supabase
.from(‘orders’).select(’*’).eq(‘rider_id’, data.riderId)
.order(‘order_date’, { ascending: false });
if (error) throw new Error(error.message);
return (orders || []).map(formatOrder);
}

async function getRiders() {
const { data: riders, error } = await supabase.from(‘riders’).select(’*’).order(‘name’, { ascending: true });
if (error) throw new Error(error.message);
return (riders || []).map(r => ({
riderId: r.rider_id, name: r.name, phone: r.phone, status: r.status || ‘active’
}));
}

async function assignRider(data) {
if (!data.orderId || !data.riderId) throw new Error(‘orderId and riderId required’);
const { error } = await supabase.from(‘orders’).update({ rider_id: data.riderId }).eq(‘order_id’, data.orderId);
if (error) throw new Error(error.message);
return true;
}

// ─────────────────────────────────────────────────────────────
// STAFF
// ─────────────────────────────────────────────────────────────
async function createStaff(data) {
if (!data.name || !data.username || !data.password) throw new Error(‘name, username, password required’);
const { data: existing } = await supabase.from(‘staff’).select(‘username’).eq(‘username’, data.username).maybeSingle();
if (existing) throw new Error(‘Username already taken’);
const hashed = await bcrypt.hash(String(data.password), 10);
const { data: staff, error } = await supabase.from(‘staff’).insert({
name: data.name, username: data.username, password: hashed, status: ‘active’
}).select().single();
if (error) throw new Error(error.message);
return { staffId: staff.staff_id };
}

async function updateStaff(data) {
if (!data.staffId) throw new Error(‘staffId required’);
const updates = {};
if (data.name !== undefined) updates.name = data.name;
if (data.status !== undefined) updates.status = data.status;
if (data.password) updates.password = await bcrypt.hash(String(data.password), 10);
const { error } = await supabase.from(‘staff’).update(updates).eq(‘staff_id’, data.staffId);
if (error) throw new Error(error.message);
return true;
}

async function deleteStaff(data) {
if (!data.staffId) throw new Error(‘staffId required’);
const { error } = await supabase.from(‘staff’).delete().eq(‘staff_id’, data.staffId);
if (error) throw new Error(error.message);
return true;
}

async function getStaff() {
const { data: staff, error } = await supabase.from(‘staff’).select(’*’).order(‘name’, { ascending: true });
if (error) throw new Error(error.message);
return (staff || []).map(s => ({
staffId: s.staff_id, name: s.name, username: s.username, status: s.status || ‘active’
}));
}

// ─────────────────────────────────────────────────────────────
// KHATA / WALLET
// ─────────────────────────────────────────────────────────────
async function getKhata(data) {
if (!data.phone) throw new Error(‘phone required’);
const ph = cleanPhone(data.phone);
const { data: entries, error } = await supabase
.from(‘khata’).select(’*’).eq(‘phone’, ph)
.order(‘created_at’, { ascending: false });
if (error) throw new Error(error.message);
return (entries || []).map(formatKhataEntry);
}

async function getSubscriberBalance(data) {
if (!data.phone) throw new Error(‘phone required’);
const ph = cleanPhone(data.phone);
const { data: sub } = await supabase.from(‘subscribers’).select(‘balance’).eq(‘phone’, ph).maybeSingle();
return { balance: sub ? Number(sub.balance) || 0 : 0 };
}

async function rechargeWallet(data) {
if (!data.phone || !data.amount) throw new Error(‘phone and amount required’);
const ph = cleanPhone(data.phone);
const amount = Number(data.amount);
if (isNaN(amount) || amount <= 0) throw new Error(‘Invalid amount’);
// Update subscriber balance
const { data: sub } = await supabase.from(‘subscribers’).select(‘balance’).eq(‘phone’, ph).maybeSingle();
const newBalance = (sub ? Number(sub.balance) || 0 : 0) + amount;
await supabase.from(‘subscribers’).update({ balance: newBalance }).eq(‘phone’, ph);
// Add khata entry
const ist = getIST();
await supabase.from(‘khata’).insert({
phone: ph, type: ‘credit’, amount: amount,
description: data.description || ‘Wallet recharge’,
balance_after: newBalance,
created_date: istDateStr(ist), created_time: istTimeStr(ist)
});
return { newBalance };
}

async function deductWalletBalance(phone, amount, description, userId) {
const ph = cleanPhone(phone);
const { data: sub } = await supabase.from(‘subscribers’).select(‘balance’).eq(‘phone’, ph).maybeSingle();
const currentBalance = sub ? Number(sub.balance) || 0 : 0;
const newBalance = currentBalance - amount;
await supabase.from(‘subscribers’).update({ balance: newBalance }).eq(‘phone’, ph);
const ist = getIST();
await supabase.from(‘khata’).insert({
phone: ph, type: ‘debit’, amount: amount,
description: description || ‘Order payment’,
balance_after: newBalance,
created_date: istDateStr(ist), created_time: istTimeStr(ist)
});
return newBalance;
}

async function adminGetAllKhata() {
const { data: entries, error } = await supabase
.from(‘khata’).select(’*’).order(‘created_at’, { ascending: false });
if (error) throw new Error(error.message);
return (entries || []).map(formatKhataEntry);
}

async function addKhataEntry(data) {
if (!data.phone || !data.type || !data.amount) throw new Error(‘phone, type, amount required’);
const ph = cleanPhone(data.phone);
const amount = Number(data.amount);
// Update balance
const { data: sub } = await supabase.from(‘subscribers’).select(‘balance’).eq(‘phone’, ph).maybeSingle();
const currentBalance = sub ? Number(sub.balance) || 0 : 0;
const newBalance = data.type === ‘credit’ ? currentBalance + amount : currentBalance - amount;
if (sub) await supabase.from(‘subscribers’).update({ balance: newBalance }).eq(‘phone’, ph);
const ist = getIST();
const { data: entry, error } = await supabase.from(‘khata’).insert({
phone: ph, type: data.type, amount: amount,
description: data.description || ‘’,
balance_after: newBalance,
created_date: istDateStr(ist), created_time: istTimeStr(ist)
}).select().single();
if (error) throw new Error(error.message);
return { entryId: entry.khata_id, newBalance };
}

function formatKhataEntry(e) {
return {
entryId: e.khata_id, phone: e.phone,
type: e.type, amount: Number(e.amount) || 0,
description: e.description || ‘’,
balanceAfter: Number(e.balance_after) || 0,
date: e.created_date || ‘’, time: e.created_time || ‘’
};
}

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────
async function getOrderCutoff() {
const { data } = await supabase.from(‘settings’).select(‘value’).eq(‘key’, ‘order_cutoff’).maybeSingle();
return { cutoff: data?.value || ‘11:00’ };
}

async function setOrderCutoff(data) {
if (!data.cutoff) throw new Error(‘cutoff required’);
await supabase.from(‘settings’).upsert({ key: ‘order_cutoff’, value: data.cutoff }, { onConflict: ‘key’ });
return true;
}

async function getWeeklySchedule() {
const { data } = await supabase.from(‘settings’).select(‘value’).eq(‘key’, ‘weekly_schedule’).maybeSingle();
let schedule = { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false };
if (data?.value) {
try { schedule = JSON.parse(data.value); } catch {}
}
return { schedule };
}

async function setWeeklySchedule(data) {
if (!data.schedule) throw new Error(‘schedule required’);
await supabase.from(‘settings’).upsert({ key: ‘weekly_schedule’, value: JSON.stringify(data.schedule) }, { onConflict: ‘key’ });
return true;
}

async function getKhataEnabled() {
const { data } = await supabase.from(‘settings’).select(‘value’).eq(‘key’, ‘khata_enabled’).maybeSingle();
return { enabled: data?.value === ‘true’ || data?.value === true };
}

async function setKhataEnabled(data) {
await supabase.from(‘settings’).upsert({ key: ‘khata_enabled’, value: String(data.enabled) }, { onConflict: ‘key’ });
return true;
}

// ─────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────
async function getAnalytics() {
const [ordersRes, usersRes, subsRes] = await Promise.all([
supabase.from(‘orders’).select(‘final_amount, order_status, user_type, order_date’),
supabase.from(‘users’).select(‘user_id’),
supabase.from(‘subscribers’).select(‘subscriber_id, balance’)
]);
const orders = ordersRes.data || [];
const totalOrders = orders.length;
const completedOrders = orders.filter(o => o.order_status === ‘delivered’).length;
const pendingOrders = orders.filter(o => o.order_status === ‘pending’).length;
const totalRevenue = orders
.filter(o => o.order_status !== ‘rejected’)
.reduce((sum, o) => sum + (Number(o.final_amount) || 0), 0);
const totalUsers = (usersRes.data || []).length;
const totalSubscribers = (subsRes.data || []).length;
const totalWalletBalance = (subsRes.data || []).reduce((sum, s) => sum + (Number(s.balance) || 0), 0);
return {
totalOrders, completedOrders, pendingOrders,
totalRevenue, totalUsers, totalSubscribers, totalWalletBalance
};
}

// ─────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────
async function getUsers() {
const { data: users, error } = await supabase.from(‘users’).select(’*’).order(‘name’, { ascending: true });
if (error) throw new Error(error.message);
return (users || []).map(u => ({
userId: u.user_id, name: u.name, phone: u.phone,
email: u.email || ‘’, address: u.address || ‘’, role: u.role || ‘customer’
}));
}

// ─────────────────────────────────────────────────────────────
// DELETE OLD DATA
// ─────────────────────────────────────────────────────────────
async function deleteOldData(data) {
if (!data.beforeDate) throw new Error(‘beforeDate required (DD/MM/YYYY)’);
// Convert DD/MM/YYYY to YYYY-MM-DD for comparison
const parts = String(data.beforeDate).split(’/’);
if (parts.length !== 3) throw new Error(‘Invalid date format, use DD/MM/YYYY’);
const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
const { error } = await supabase.from(‘orders’)
.delete()
.lt(‘order_date’, isoDate);
if (error) throw new Error(error.message);
return { deleted: true, beforeDate: data.beforeDate };
}
