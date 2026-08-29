import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Wallet, Utensils, Bus, Hotel, Ticket, ShoppingBag, HeartPulse,
  Trash2, IndianRupee, CheckCircle2, PieChart, ClipboardList, Award,
  ArrowRightLeft, Sparkles, AlertTriangle, Pencil, Save, Coins, Target,
  UserRoundCheck, Footprints, Compass, PiggyBank, Trophy, Loader2, X,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './payana-nidhi.css';

/* ═══════════════ STORAGE KEYS ═══════════════ */
const KEY_BUDGET = 'sancharam_trip_budget';
const KEY_EXPENSES = 'sancharam_expenses';
const KEY_CURRENCY = 'sancharam_currency_preferences';

/* ═══════════════ CATEGORY METADATA (single source of truth) ═══════════════ */
export const CATEGORIES = [
  { id: 'Food', label: 'Food & Dining', color: '#C4552E', Icon: Utensils },
  { id: 'Transport', label: 'Transport & Transit', color: '#2E6E63', Icon: Bus },
  { id: 'Stay', label: 'Stay & Accommodation', color: '#8C6A4F', Icon: Hotel },
  { id: 'Experiences', label: 'Experiences & Tickets', color: '#B97A1C', Icon: Ticket },
  { id: 'Shopping', label: 'Shopping & Gifts', color: '#A03F1F', Icon: ShoppingBag },
  { id: 'Emergency', label: 'Emergency & Medical', color: '#C0392B', Icon: HeartPulse },
];

const catMeta = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

/* ═══════════════ SMART CATEGORIZATION (keyword matching, not AI) ═══════════════ */
const KEYWORDS = {
  Food: ['coffee', 'food', 'breakfast', 'lunch', 'dinner', 'mess', 'restaurant', 'tiffin', 'snack', 'idli', 'dosa', 'meals', 'cafe'],
  Transport: ['cab', 'auto', 'metro', 'bus', 'train', 'airport', 'taxi', 'fuel', 'petrol', 'share', 'mtc'],
  Stay: ['hotel', 'room', 'stay', 'hostel', 'lodge', 'homestay', 'airbnb'],
  Experiences: ['ticket', 'museum', 'beach', 'tour', 'temple', 'entry', 'show', 'guide', 'boat'],
  Shopping: ['shopping', 'souvenir', 'clothes', 'gift', 'saree', 'market', 'store'],
  Emergency: ['medicine', 'hospital', 'emergency', 'pharmacy', 'doctor', 'clinic', 'first aid'],
};

export function suggestCategory(note) {
  const text = (note || '').toLowerCase();
  if (!text.trim()) return null;
  for (const cat of CATEGORIES) {
    const words = KEYWORDS[cat.id] || [];
    if (words.some((w) => text.includes(w))) return cat.id;
  }
  return null;
}

/* ═══════════════ CURRENCY (demo static rates → 1 unit = X INR) ═══════════════ */
const DEMO_RATES_TO_INR = {
  INR: 1, USD: 83, EUR: 90, GBP: 105.5, SGD: 61.5, AED: 22.6, JPY: 0.56,
};
const CURRENCY_META = {
  INR: { symbol: '₹', name: 'Indian Rupee' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar' },
  AED: { symbol: 'AED ', name: 'UAE Dirham' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
};
const CURRENCY_CODES = Object.keys(DEMO_RATES_TO_INR);

export function convertCurrency(amount, from, to) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return null;
  const inr = value * (DEMO_RATES_TO_INR[from] ?? 1);
  return inr / (DEMO_RATES_TO_INR[to] ?? 1);
}

/* ═══════════════ FORMATTING ═══════════════ */
const inrFmt = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatINR = (n) => `₹${inrFmt.format(Number(n) || 0)}`;
const formatMoney = (n, code) => {
  const meta = CURRENCY_META[code] || { symbol: '' };
  const locale = code === 'INR' ? 'en-IN' : 'en-US';
  const digits = code === 'JPY' ? 0 : 2;
  return `${meta.symbol}${new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(Number(n) || 0)}`;
};
const todayISO = () => new Date().toISOString().split('T')[0];
const prettyDate = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ═══════════════ BUDGET CALCULATION ═══════════════ */
export function computeBudget(expenses, dailyBudget) {
  const totalSpent = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const budget = Number(dailyBudget) || 0;
  const remaining = budget - totalSpent;
  const pct = budget > 0 ? (totalSpent / budget) * 100 : 0;
  return {
    totalSpent,
    budget,
    remaining,
    overBy: remaining < 0 ? Math.abs(remaining) : 0,
    percent: Math.min(pct, 100),
    rawPercent: pct,
    tone: pct > 100 ? 'over' : pct >= 80 ? 'warn' : 'ok',
  };
}

export function categoryBreakdown(expenses) {
  const totals = expenses.reduce((acc, e) => {
    const id = catMeta(e.category).id;
    acc[id] = (acc[id] || 0) + (parseFloat(e.amount) || 0);
    return acc;
  }, {});
  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  return Object.entries(totals)
    .filter(([, v]) => v > 0)
    .map(([id, value]) => ({
      ...catMeta(id),
      value,
      percent: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

/* ═══════════════ ACHIEVEMENTS ═══════════════ */
const ACHIEVEMENTS = [
  {
    id: 'budget_ninja', name: 'Budget Ninja', tamil: 'வரவு சூரியன்', Icon: UserRoundCheck,
    req: 'Total spending is less than 80% of daily budget',
    check: (ex, budget) => {
      const { totalSpent } = computeBudget(ex, budget);
      return { done: budget > 0 && totalSpent < 0.8 * budget, progress: null };
    },
  },
  {
    id: 'local_foodie', name: 'Local Foodie', tamil: 'உள்ளூர் சுவை', Icon: Utensils,
    req: 'At least 3 expenses in the Food category',
    check: (ex) => {
      const n = ex.filter((e) => e.category === 'Food').length;
      return { done: n >= 3, progress: Math.min(n / 3, 1), label: `${Math.min(n, 3)}/3` };
    },
  },
  {
    id: 'street_smart', name: 'Street Smart', tamil: 'வீதி வீரன்', Icon: Footprints,
    req: 'At least 2 expenses in Transport under ₹100 each',
    check: (ex) => {
      const n = ex.filter((e) => e.category === 'Transport' && (parseFloat(e.amount) || 0) < 100).length;
      return { done: n >= 2, progress: Math.min(n / 2, 1), label: `${Math.min(n, 2)}/2` };
    },
  },
  {
    id: 'hidden_explorer', name: 'Hidden Explorer', tamil: 'மறைந்த ஆய்வாளன்', Icon: Compass,
    req: 'At least 1 expense in the Experiences category',
    check: (ex) => ({ done: ex.some((e) => e.category === 'Experiences'), progress: null }),
  },
  {
    id: 'frugal_traveler', name: 'Frugal Traveler', tamil: 'சேமிப்பு பயணி', Icon: PiggyBank,
    req: 'Daily spending is under ₹500',
    check: (ex) => {
      const { totalSpent } = computeBudget(ex, 0);
      return { done: ex.length > 0 && totalSpent < 500, progress: null };
    },
  },
  {
    id: 'chennai_champion', name: 'Chennai Champion', tamil: 'சென்னை வீரன்', Icon: Trophy,
    req: 'All six categories have at least one expense',
    check: (ex) => {
      const n = new Set(ex.map((e) => catMeta(e.category).id)).size;
      return { done: n >= CATEGORIES.length, progress: n / CATEGORIES.length, label: `${n}/6` };
    },
  },
];

/* ═══════════════ SAMPLE SEED ═══════════════ */
const SAMPLE_EXPENSES = [
  { id: 'seed-1', amount: 450, category: 'Food', note: 'Filter coffee & Tiffin at Rayar Mess', date: '2026-08-29' },
  { id: 'seed-2', amount: 1200, category: 'Transport', note: 'Cab from Airport to Mylapore', date: '2026-08-29' },
];

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const writeJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
};

/* ═══════════════ DONUT CHART (pure SVG) ═══════════════ */
function Donut({ slices, total }) {
  const R = 58, STROKE = 20, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="pn-donut" style={{ width: 150, height: 150 }}>
      <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="Category spending share">
        <circle cx="75" cy="75" r={R} fill="none" stroke="#E4D8C2" strokeWidth={STROKE} />
        {slices.map((s) => {
          const len = (s.percent / 100) * C;
          const el = (
            <circle
              key={s.id} cx="75" cy="75" r={R} fill="none"
              stroke={s.color} strokeWidth={STROKE} strokeLinecap="butt"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 75 75)"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="pn-donut-mid">
        <b>{formatINR(total)}</b>
        <small>Total</small>
      </div>
    </div>
  );
}

/* ═══════════════ PAGE ═══════════════ */
const BudgetTrackerPage = () => {
  /* -- persisted state -- */
  const [expenses, setExpenses] = useState(() => {
    const saved = readJSON(KEY_EXPENSES, null);
    return Array.isArray(saved) ? saved : SAMPLE_EXPENSES;
  });
  const [dailyBudget, setDailyBudget] = useState(() => {
    const saved = readJSON(KEY_BUDGET, null);
    return typeof saved === 'number' && saved > 0 ? saved : 5000;
  });
  const [currencyPrefs, setCurrencyPrefs] = useState(() => {
    const saved = readJSON(KEY_CURRENCY, null);
    return saved && saved.from && saved.to ? saved : { amount: 100, from: 'USD', to: 'INR' };
  });

  useEffect(() => { writeJSON(KEY_EXPENSES, expenses); }, [expenses]);
  useEffect(() => { writeJSON(KEY_BUDGET, dailyBudget); }, [dailyBudget]);
  useEffect(() => { writeJSON(KEY_CURRENCY, currencyPrefs); }, [currencyPrefs]);

  /* -- toasts -- */
  const [toasts, setToasts] = useState([]);
  const pushToast = useCallback((message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  /* -- form -- */
  const [form, setForm] = useState({ amount: '', category: 'Food', note: '', date: todayISO() });
  const [autoCat, setAutoCat] = useState(true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const suggestion = autoCat ? suggestCategory(form.note) : null;
  const showSuggestion = suggestion && suggestion !== form.category;

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saving) return;
    const amt = parseFloat(form.amount);
    if (!form.amount || !Number.isFinite(amt) || amt <= 0) {
      setFormError('Please enter a valid amount in rupees greater than zero.');
      return;
    }
    if (!form.category) { setFormError('Please choose a category for this expense.'); return; }
    if (!form.date) { setFormError('Please pick the date of this expense.'); return; }

    setSaving(true);
    const entry = {
      id: `e-${Date.now()}`,
      amount: Math.round(amt * 100) / 100,
      category: form.category,
      note: form.note.trim(),
      date: form.date,
    };
    setExpenses((prev) => [entry, ...prev]);
    setForm({ amount: '', category: 'Food', note: '', date: todayISO() });
    setFormError('');
    pushToast('Expense saved successfully.');
    setTimeout(() => setSaving(false), 320);
  };

  /* -- budget editing -- */
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState(String(dailyBudget));
  const [budgetError, setBudgetError] = useState('');

  const saveBudget = () => {
    const v = parseFloat(budgetDraft);
    if (!Number.isFinite(v) || v <= 0) { setBudgetError('Daily budget must be a positive amount.'); return; }
    setDailyBudget(Math.round(v * 100) / 100);
    setBudgetError('');
    setEditingBudget(false);
    pushToast('Daily budget updated.');
  };

  /* -- delete with confirm -- */
  const [pendingDelete, setPendingDelete] = useState(null);
  const confirmDelete = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setPendingDelete(null);
    pushToast('Expense removed.');
  };

  /* -- filters -- */
  const [filter, setFilter] = useState('All');

  /* -- derived -- */
  const budgetView = useMemo(() => computeBudget(expenses, dailyBudget), [expenses, dailyBudget]);
  const breakdown = useMemo(() => categoryBreakdown(expenses), [expenses]);
  const achievements = useMemo(
    () => ACHIEVEMENTS.map((a) => ({ ...a, ...a.check(expenses, dailyBudget) })),
    [expenses, dailyBudget],
  );
  const visibleExpenses = useMemo(() => {
    const list = filter === 'All' ? expenses : expenses.filter((e) => e.category === filter);
    return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : String(b.id).localeCompare(String(a.id))));
  }, [expenses, filter]);

  /* -- badge unlock toasts -- */
  const prevUnlocked = useRef(null);
  useEffect(() => {
    const now = new Set(achievements.filter((a) => a.done).map((a) => a.id));
    if (prevUnlocked.current === null) { prevUnlocked.current = now; return; }
    now.forEach((id) => {
      if (!prevUnlocked.current.has(id)) {
        const a = ACHIEVEMENTS.find((x) => x.id === id);
        if (a) pushToast(`Badge unlocked — ${a.name}!`);
      }
    });
    prevUnlocked.current = now;
  }, [achievements, pushToast]);

  /* -- converter -- */
  const [converted, setConverted] = useState(() => convertCurrency(100, 'USD', 'INR'));
  const [convError, setConvError] = useState('');
  const [converting, setConverting] = useState(false);

  const runConvert = (e) => {
    e?.preventDefault();
    const v = parseFloat(currencyPrefs.amount);
    if (!Number.isFinite(v) || v < 0) { setConvError('Enter a valid amount to convert.'); setConverted(null); return; }
    setConvError('');
    setConverting(true);
    setTimeout(() => {
      setConverted(convertCurrency(v, currencyPrefs.from, currencyPrefs.to));
      setConverting(false);
    }, 220);
  };

  const swapCurrencies = () => {
    setCurrencyPrefs((p) => ({ ...p, from: p.to, to: p.from }));
    setConverted(null);
  };

  return (
    <div className="pn-page">
      <Navbar />

      <div className="pn-wrap">
        {/* ── PAGE HEADER ─────────────────────────────── */}
        <section className="pn-hero">
          <h1 className="pn-title">பயண நிதி</h1>
          <p className="pn-subtitle">Currency Converter &amp; INR Expense Manager</p>
          <p className="pn-lede">ஒவ்வொரு ரூபாவும் ஒரு பயணம் — track every rupee, understand your spending and travel smarter.</p>
          <p className="pn-quote">“ஒவ்வொரு பயணத்திற்கும் ஒரு கதை உண்டு — every journey has a story, and every rupee has a place.”</p>
          <div className="pn-rule" />
        </section>

        <div className="pn-grid">
          {/* ── BUDGET OVERVIEW ───────────────────────── */}
          <section className="pn-card pn-a-budget" aria-labelledby="pn-budget-h">
            <div className="pn-card-head">
              <h2 className="pn-card-title" id="pn-budget-h"><Target size={20} /> Trip Budget</h2>
              <span className="pn-chip">{expenses.length} logged {expenses.length === 1 ? 'entry' : 'entries'}</span>
            </div>
            <p className="pn-card-note">Know where your money goes. Make better travel decisions.</p>

            <div className="pn-budget-stats">
              <div className="pn-stat">
                <span className="pn-stat-k">Total Spent</span>
                <span className="pn-stat-v pn-stat-v--gold">{formatINR(budgetView.totalSpent)}</span>
              </div>
              <div className="pn-stat">
                <span className="pn-stat-k">Daily Budget</span>
                <span className="pn-stat-v">{formatINR(budgetView.budget)}</span>
              </div>
              <div className="pn-stat">
                <span className="pn-stat-k">Remaining</span>
                <span className={`pn-stat-v ${budgetView.remaining < 0 ? 'pn-stat-v--red' : 'pn-stat-v--green'}`}>
                  {budgetView.remaining < 0 ? formatINR(0) : formatINR(budgetView.remaining)}
                </span>
              </div>
            </div>

            <div
              className="pn-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100}
              aria-valuenow={Math.round(budgetView.percent)} aria-label="Percentage of daily budget spent"
            >
              <div
                className={`pn-bar-fill ${budgetView.tone === 'over' ? 'over' : budgetView.tone === 'warn' ? 'warn' : ''}`}
                style={{ width: `${budgetView.percent}%` }}
              />
            </div>
            <div className="pn-bar-meta">
              <span>{Math.round(budgetView.rawPercent)}% of budget spent</span>
              <span>{formatINR(budgetView.totalSpent)} / {formatINR(budgetView.budget)}</span>
            </div>

            <div className={`pn-status ${budgetView.tone === 'over' ? 'over' : budgetView.tone === 'warn' ? 'warn' : ''}`}>
              {budgetView.tone === 'over' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              {budgetView.tone === 'over'
                ? `Over budget by ${formatINR(budgetView.overBy)} — remaining shows ₹0.00 because the budget is exhausted.`
                : budgetView.tone === 'warn'
                  ? 'Close to your limit — spend carefully today.'
                  : 'Within target budget'}
            </div>

            {editingBudget ? (
              <div className="pn-budget-edit">
                <div className="pn-field" style={{ flex: '1 1 180px' }}>
                  <label className="pn-label" htmlFor="pn-budget-input">Daily budget (₹ INR)</label>
                  <input
                    id="pn-budget-input" className="pn-input pn-input--num" type="number" min="1" step="1"
                    value={budgetDraft}
                    onChange={(e) => { setBudgetDraft(e.target.value); setBudgetError(''); }}
                  />
                </div>
                <button type="button" className="pn-btn pn-btn--gold" onClick={saveBudget}>
                  <Save size={16} /> Save
                </button>
                <button
                  type="button" className="pn-btn pn-btn--ghost"
                  onClick={() => { setEditingBudget(false); setBudgetDraft(String(dailyBudget)); setBudgetError(''); }}
                >
                  Cancel
                </button>
                {budgetError && <div className="pn-error" style={{ width: '100%' }}><AlertTriangle size={15} /> {budgetError}</div>}
              </div>
            ) : (
              <div className="pn-budget-edit">
                <button
                  type="button" className="pn-btn pn-btn--ghost"
                  onClick={() => { setBudgetDraft(String(dailyBudget)); setEditingBudget(true); }}
                >
                  <Pencil size={15} /> Edit budget
                </button>
                <span className="pn-hint"><CheckCircle2 size={14} /> Saved to localStorage</span>
              </div>
            )}
          </section>

          {/* ── CURRENCY CONVERTER ────────────────────── */}
          <section className="pn-card pn-a-converter" aria-labelledby="pn-conv-h">
            <div className="pn-card-head">
              <h2 className="pn-card-title" id="pn-conv-h"><Coins size={20} /> Currency Converter</h2>
            </div>
            <p className="pn-card-note">Convert your travel money into Indian Rupees.</p>

            <form onSubmit={runConvert}>
              <div className="pn-field" style={{ marginBottom: 14 }}>
                <label className="pn-label" htmlFor="pn-conv-amount">Amount</label>
                <input
                  id="pn-conv-amount" className="pn-input pn-input--num" type="number" min="0" step="0.01"
                  value={currencyPrefs.amount}
                  onChange={(e) => { setCurrencyPrefs((p) => ({ ...p, amount: e.target.value })); setConvError(''); }}
                />
              </div>

              <div className="pn-conv-row">
                <div className="pn-field">
                  <label className="pn-label" htmlFor="pn-conv-from">From</label>
                  <select
                    id="pn-conv-from" className="pn-select" value={currencyPrefs.from}
                    onChange={(e) => setCurrencyPrefs((p) => ({ ...p, from: e.target.value }))}
                  >
                    {CURRENCY_CODES.map((c) => (
                      <option key={c} value={c}>{c} — {CURRENCY_META[c].name}</option>
                    ))}
                  </select>
                </div>
                <button type="button" className="pn-icon-btn" onClick={swapCurrencies} aria-label="Swap currencies" title="Swap currencies">
                  <ArrowRightLeft size={17} />
                </button>
                <div className="pn-field">
                  <label className="pn-label" htmlFor="pn-conv-to">To</label>
                  <select
                    id="pn-conv-to" className="pn-select" value={currencyPrefs.to}
                    onChange={(e) => setCurrencyPrefs((p) => ({ ...p, to: e.target.value }))}
                  >
                    {CURRENCY_CODES.map((c) => (
                      <option key={c} value={c}>{c} — {CURRENCY_META[c].name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="pn-btn pn-btn--gold pn-btn--full" disabled={converting}>
                {converting ? <><Loader2 size={16} className="pn-spin" /> Converting…</> : <><ArrowRightLeft size={16} /> Convert</>}
              </button>
            </form>

            {convError && <div className="pn-error"><AlertTriangle size={15} /> {convError}</div>}
          </section>

          {/* ── ADD EXPENSE ───────────────────────────── */}
          <section className="pn-card pn-a-form" aria-labelledby="pn-form-h">
            <div className="pn-card-head">
              <h2 className="pn-card-title" id="pn-form-h"><Wallet size={20} /> Log New Expense</h2>
              <label className="pn-toggle" htmlFor="pn-autocat">
                <input
                  id="pn-autocat" type="checkbox" checked={autoCat}
                  onChange={(e) => setAutoCat(e.target.checked)}
                />
                Auto Categorize
              </label>
            </div>
            <p className="pn-card-note">Track your trip spending in Indian Rupees (₹ INR). Saved automatically.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="pn-form-grid">
                <div className="pn-field">
                  <label className="pn-label" htmlFor="pn-amount">Amount (₹ INR) *</label>
                  <input
                    id="pn-amount" className="pn-input pn-input--num" type="number" min="0.01" step="0.01"
                    inputMode="decimal" required placeholder="0.00"
                    value={form.amount} onChange={(e) => setField('amount', e.target.value)}
                  />
                </div>

                <div className="pn-field">
                  <label className="pn-label" htmlFor="pn-category">Category *</label>
                  <select
                    id="pn-category" className="pn-select" required
                    value={form.category} onChange={(e) => setField('category', e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="pn-field">
                  <label className="pn-label" htmlFor="pn-date">Expense Date *</label>
                  <input
                    id="pn-date" className="pn-input pn-input--num" type="date" required
                    value={form.date} onChange={(e) => setField('date', e.target.value)}
                  />
                </div>
              </div>

              <div className="pn-field" style={{ marginTop: 14 }}>
                <label className="pn-label" htmlFor="pn-note">Note (Optional)</label>
                <textarea
                  id="pn-note" className="pn-textarea" placeholder="e.g. Filter coffee at Rayar Mess"
                  value={form.note} onChange={(e) => setField('note', e.target.value)}
                />
              </div>

              {showSuggestion && (
                <div className="pn-suggest">
                  <Sparkles size={14} />
                  Suggested category: {catMeta(suggestion).label}
                  <button type="button" onClick={() => setField('category', suggestion)}>Use it</button>
                </div>
              )}

              {formError && <div className="pn-error" role="alert"><AlertTriangle size={15} /> {formError}</div>}

              <button type="submit" className="pn-btn pn-btn--full" disabled={saving}>
                {saving ? <><Loader2 size={16} /> Saving…</> : <><Save size={16} /> Save Expense</>}
              </button>
            </form>
          </section>

          {/* ── ACHIEVEMENTS ──────────────────────────── */}
          <section className="pn-card pn-a-badges" aria-labelledby="pn-badge-h">
            <div className="pn-card-head">
              <h2 className="pn-card-title" id="pn-badge-h"><Award size={20} /> Travel Badges &amp; Achievements</h2>
              <span className="pn-chip pn-chip--gold">
                {achievements.filter((a) => a.done).length}/{achievements.length}
              </span>
            </div>
            <p className="pn-card-note">உங்கள் உண்மைச் செலவுகளிலிருந்து பெறப்பட்டவை — earned from your real expense records, no guesswork.</p>

            <div className="pn-badge-grid">
              {achievements.map((a) => (
                <article key={a.id} className={`pn-badge ${a.done ? 'on' : 'off'}`}>
                  <div className="pn-badge-top">
                    <span className="pn-badge-ico"><a.Icon size={17} /></span>
                    <span className="pn-badge-name">{a.name}</span>
                  </div>
                  <span className="pn-badge-tamil">{a.tamil}</span>
                  <p className="pn-badge-req-en">{a.req}</p>
                  {!a.done && typeof a.progress === 'number' && (
                    <div className="pn-badge-prog"><span style={{ width: `${Math.round(a.progress * 100)}%` }} /></div>
                  )}
                  <span className="pn-badge-state">
                    {a.done ? '✓ Unlocked' : a.label ? `Locked · ${a.label}` : 'Locked'}
                  </span>
                </article>
              ))}
            </div>
          </section>

          {/* ── CATEGORY SPENDING ─────────────────────── */}
          <section className="pn-card pn-a-chart" aria-labelledby="pn-chart-h">
            <div className="pn-card-head">
              <h2 className="pn-card-title" id="pn-chart-h"><PieChart size={20} /> Category Spending Share</h2>
            </div>
            <p className="pn-card-note">Only categories with spending appear here.</p>

            {breakdown.length === 0 ? (
              <div className="pn-empty">Nothing to chart yet. Log an expense to see your spending split.</div>
            ) : (
              <div className="pn-chart-wrap">
                <Donut slices={breakdown} total={budgetView.totalSpent} />
                <div className="pn-legend">
                  {breakdown.map((s) => (
                    <div className="pn-legend-row" key={s.id}>
                      <span className="pn-legend-dot" style={{ background: s.color }} />
                      <span className="pn-legend-name"><s.Icon size={15} style={{ color: s.color }} /> {s.label}</span>
                      <span className="pn-legend-val">{formatINR(s.value)}</span>
                      <span className="pn-legend-pct">{s.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── EXPENSE RECORDS ───────────────────────── */}
          <section className="pn-card pn-a-records" aria-labelledby="pn-rec-h">
            <div className="pn-card-head">
              <h2 className="pn-card-title" id="pn-rec-h"><ClipboardList size={20} /> Expense Records</h2>
              <span className="pn-chip">{expenses.length} logged {expenses.length === 1 ? 'entry' : 'entries'}</span>
            </div>

            <div className="pn-filters" role="group" aria-label="Filter expenses by category">
              <button
                type="button" className={`pn-filter ${filter === 'All' ? 'on' : ''}`}
                aria-pressed={filter === 'All'} onClick={() => setFilter('All')}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id} type="button" className={`pn-filter ${filter === c.id ? 'on' : ''}`}
                  aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {visibleExpenses.length === 0 ? (
              <div className="pn-empty">
                {expenses.length === 0
                  ? 'No expenses logged yet. Start by recording your first travel expense.'
                  : 'No expenses in this category yet.'}
              </div>
            ) : (
              <div className="pn-rec-list">
                {visibleExpenses.map((e) => {
                  const m = catMeta(e.category);
                  return (
                    <article className="pn-rec" key={e.id}>
                      <span className="pn-rec-ico" style={{ color: m.color }}><m.Icon size={18} /></span>
                      <div className="pn-rec-body">
                        <div className="pn-rec-cat">{m.label}</div>
                        <div className="pn-rec-meta">{prettyDate(e.date)}</div>
                        {e.note && <div className="pn-rec-note">{e.note}</div>}
                        {pendingDelete === e.id && (
                          <div className="pn-confirm" style={{ marginTop: 8 }}>
                            Delete this expense?
                            <button type="button" className="pn-btn pn-btn--ghost" style={{ padding: '5px 12px' }} onClick={() => confirmDelete(e.id)}>
                              Yes, delete
                            </button>
                            <button type="button" className="pn-btn pn-btn--ghost" style={{ padding: '5px 12px' }} onClick={() => setPendingDelete(null)}>
                              <X size={13} /> Keep
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="pn-rec-amt">{formatINR(e.amount)}</span>
                      <button
                        type="button" className="pn-rec-del"
                        onClick={() => setPendingDelete(pendingDelete === e.id ? null : e.id)}
                        aria-label={`Delete ${m.label} expense of ${formatINR(e.amount)}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── TOASTS ─────────────────────────────────── */}
      <div className="pn-toasts" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div className="pn-toast" key={t.id}>
            <CheckCircle2 size={17} /> {t.message}
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default BudgetTrackerPage;
