import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {Map, Wallet, TrendingDown, MapPin, Utensils, Bus, ShoppingBag, Trash2, Calendar, Hotel, PartyPopper, CreditCard, IndianRupee, Target, CheckCircle, PieChart, ClipboardList, Award, AlertTriangle, ShieldAlert, Route, Clock, Navigation, X, Check, ShieldCheck, ArrowRightLeft} from 'lucide-react';
import CurrencyWidget from '@/components/CurrencyWidget';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CATEGORY_STYLES = {
  Food: { bg: 'rgba(255, 152, 0, 0.15)', text: '#ff9800', border: 'rgba(255, 152, 0, 0.4)', icon: <Utensils size={18} />, color: '#ff9800' },
  Transport: { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3', border: 'rgba(33, 150, 243, 0.4)', icon: <Bus size={18} />, color: '#2196f3' },
  Stay: { bg: 'rgba(156, 39, 176, 0.15)', text: '#ab47bc', border: 'rgba(156, 39, 176, 0.4)', icon: <Hotel size={18} />, color: '#ab47bc' },
  Experiences: { bg: 'rgba(255, 215, 0, 0.15)', text: '#FFD700', border: 'rgba(255, 215, 0, 0.4)', icon: <PartyPopper size={18} />, color: 'var(--rust)' },
  Shopping: { bg: 'rgba(233, 30, 99, 0.15)', text: '#e91e63', border: 'rgba(233, 30, 99, 0.4)', icon: <ShoppingBag size={18} />, color: '#e91e63' },
  Emergency: { bg: 'rgba(255, 77, 77, 0.15)', text: '#ff4d4d', border: 'rgba(255, 77, 77, 0.4)', icon: <AlertTriangle size={18} />, color: '#ff4d4d' }
};

// ── BADGES DEFINITION ──
const BADGES = [
  {
    id: 'budget_ninja',
    name: 'Budget Ninja',
    emoji: '🥷',
    description: 'Total spending is less than 80% of daily budget',
    condition: (expenses, dailyBudget) => {
      const totalSpent = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      return expenses.length > 0 && totalSpent < 0.8 * dailyBudget;
    }
  },
  {
    id: 'local_foodie',
    name: 'Local Foodie',
    emoji: '🍱',
    description: 'At least 3 expenses in the Food category',
    condition: (expenses) => {
      const foodCount = expenses.filter((e) => e.category === 'Food').length;
      return foodCount >= 3;
    }
  },
  {
    id: 'street_smart',
    name: 'Street Smart',
    emoji: '🚌',
    description: 'At least 2 expenses in Transport under ₹100 each',
    condition: (expenses) => {
      const cheapTransports = expenses.filter(
        (e) => e.category === 'Transport' && (parseFloat(e.amount) || 0) < 100
      ).length;
      return cheapTransports >= 2;
    }
  },
  {
    id: 'hidden_explorer',
    name: 'Hidden Explorer',
    emoji: '🎟️',
    description: 'At least 1 expense in the Experiences category',
    condition: (expenses) => {
      return expenses.some((e) => e.category === 'Experiences');
    }
  },
  {
    id: 'frugal_traveler',
    name: 'Frugal Traveler',
    emoji: '🪙',
    description: 'Daily spending is under 500 INR',
    condition: (expenses) => {
      const totalSpent = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      return expenses.length > 0 && totalSpent < 500;
    }
  },
  {
    id: 'chennai_champion',
    name: 'Chennai Champion',
    emoji: '🏆',
    description: 'All six categories have at least one expense',
    condition: (expenses) => {
      const categories = new Set(expenses.map((e) => e.category));
      return categories.size >= 6;
    }
  }
];

const BudgetTrackerPage = () => {
  // Expenses State
  const [activeTab, setActiveTab] = useState('expenses');
    const [expenses, setExpenses] = useState([]);

  // Editable Daily Budget State (Saved to localStorage)
  const [dailyBudget, setDailyBudget] = useState(() => {
    const saved = localStorage.getItem('sancharam_daily_budget');
    return saved !== null ? parseFloat(saved) : 5000;
  });

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Toast Notification State & Ref for newly earned badges
  const [toastMessage, setToastMessage] = useState(null);
  const prevEarnedBadgesRef = useRef(new Set());
  const isInitialMountRef = useRef(true);

  // Load expenses from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sancharam_expenses');
      if (saved) {
        setExpenses(JSON.parse(saved));
      } else {
        const sampleData = [
          {
            id: 101,
            amount: 450,
            category: 'Food',
            note: 'Filter coffee & Tiffin at Rayar Mess',
            date: new Date().toISOString().split('T')[0]
          },
          {
            id: 102,
            amount: 1200,
            category: 'Transport',
            note: 'Cab from Airport to Mylapore',
            date: new Date().toISOString().split('T')[0]
          }
        ];
        setExpenses(sampleData);
        localStorage.setItem('sancharam_expenses', JSON.stringify(sampleData));
      }
    } catch (err) {
      console.warn('Could not load sancharam_expenses from localStorage:', err);
    }
  }, []);

  // Check for newly unlocked badges whenever expenses or dailyBudget change
  useEffect(() => {
    const currentEarnedIds = new Set();
    BADGES.forEach((badge) => {
      if (badge.condition(expenses, dailyBudget)) {
        currentEarnedIds.add(badge.id);
      }
    });

    if (isInitialMountRef.current) {
      prevEarnedBadgesRef.current = currentEarnedIds;
      isInitialMountRef.current = false;
      return;
    }

    // Identify newly unlocked badge
    currentEarnedIds.forEach((id) => {
      if (!prevEarnedBadgesRef.current.has(id)) {
        const badgeObj = BADGES.find((b) => b.id === id);
        if (badgeObj) {
          setToastMessage(`Badge unlocked: ${badgeObj.name}!`);
          setTimeout(() => {
            setToastMessage(null);
          }, 3000);
        }
      }
    });

    prevEarnedBadgesRef.current = currentEarnedIds;
  }, [expenses, dailyBudget]);

  // Save expenses to localStorage
  const saveExpensesToStorage = (updatedExpenses) => {
    setExpenses(updatedExpenses);
    try {
      localStorage.setItem('sancharam_expenses', JSON.stringify(updatedExpenses));
    } catch (err) {
      console.warn('Could not save sancharam_expenses to localStorage:', err);
    }
  };

  // Handle Daily Budget Input Change
  const handleDailyBudgetChange = (val) => {
    const numVal = parseFloat(val) || 0;
    setDailyBudget(numVal);
    try {
      localStorage.setItem('sancharam_daily_budget', numVal.toString());
    } catch (err) {
      console.warn('Could not save sancharam_daily_budget:', err);
    }
  };

  // Add New Expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid expense amount in INR.');
      return;
    }

    const newExpense = {
      id: Date.now(),
      amount: numAmount,
      category,
      note: note.trim(),
      date: date || new Date().toISOString().split('T')[0]
    };

    const updated = [newExpense, ...expenses];
    saveExpensesToStorage(updated);

    // Reset Form Fields
    setAmount('');
    setNote('');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // Delete Expense
  const handleDeleteExpense = (id) => {
    const updated = expenses.filter((exp) => exp.id !== id);
    saveExpensesToStorage(updated);
  };

  // Derived calculations
  const totalSpent = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const remaining = dailyBudget - totalSpent;
  const isPositiveRemaining = remaining >= 0;

  const categoryTotals = expenses.reduce((acc, item) => {
    const cat = item.category || 'Food';
    acc[cat] = (acc[cat] || 0) + (parseFloat(item.amount) || 0);
    return acc;
  }, {});

  const activeCategories = Object.keys(categoryTotals)
    .map((catName) => {
      const catSpent = categoryTotals[catName];
      const sharePercent = totalSpent > 0 ? (catSpent / totalSpent) * 100 : 0;
      return {
        name: catName,
        total: catSpent,
        percent: Math.round(sharePercent * 10) / 10
      };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <div className="features-container">
      {/* ── TOAST NOTIFICATION FOR NEWLY UNLOCKED BADGES ── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #1e1e2d, #14141f)',
            border: '2px solid #FFD700',
            color: 'var(--rust)',
            padding: '0.9rem 2rem',
            borderRadius: '50px',
            fontSize: '1.05rem',
            fontWeight: 'bold',
            boxShadow: '0 10px 35px rgba(255, 215, 0, 0.4)',
            zIndex: 10000,
            animation: 'toastSlide 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <PartyPopper size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> {toastMessage}
        </div>
      )}

      <div className="features-hero-bg">
        <Navbar />

        <section className="hero wrap" style={{ padding: '120px clamp(20px,5vw,48px) 40px clamp(20px,5vw,48px)', minHeight: '360px', display: 'flex', alignItems: 'center', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <div className="rv in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <span className="pill" lang="ta" style={{ background: 'rgba(255,255,255,0.9)', color: '#B4451F', border: '1px solid #B4451F', fontWeight: 'bold' }}><i></i>பயண நிதி</span>
            <h1 style={{ fontFamily: '"Catamaran", "Noto Sans Tamil", sans-serif', fontWeight: 900, letterSpacing: '-0.02em', transform: 'scaleY(1.15)', transformOrigin: 'bottom left', color: 'var(--rust)', fontSize: 'clamp(4rem, 8vw, 7.5rem)', margin: '0.5rem 0 1rem 0', textShadow: '2px 2px 0px rgba(255,255,255,0.8)' }}>பயண நிதி</h1>
            <div style={{
              marginTop: '1.5rem',
              background: 'linear-gradient(135deg, rgba(20,20,30,0.95), rgba(10,10,15,0.85))',
              backdropFilter: 'blur(16px)',
              padding: '1.5rem 2rem',
              borderRadius: '16px',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.8rem'
            }}>
              <p style={{ fontSize: '1.4rem', color: 'var(--rust)', margin: 0, fontFamily: '"Tiro Tamil", "Vijaya", "Latha", serif', letterSpacing: '0.5px', fontWeight: 'bold', whiteSpace: 'nowrap', textAlign: 'left' }}>
                பயண நிதி · Currency Converter & INR Expense Manager
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderTop: '1px solid rgba(255, 215, 0, 0.2)', paddingTop: '1rem', width: '100%' }}>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <Wallet size={18} color="#FFD700" /> INR Tracking
                </span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <PieChart size={18} color="#FFD700" /> Auto Categorization
                </span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <TrendingDown size={18} color="#FFD700" /> Smart Achievements
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '3rem 2rem 5rem 2rem' }}>
        {/* ── TOP SECTION 1: BADGES GRID (ALL 6 BADGES) ── */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--ink)', marginBottom: '1rem' }}>
            <Award size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> Travel Badges & Achievements
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '1rem'
            }}
          >
            {BADGES.map((badge) => {
              const isEarned = badge.condition(expenses, dailyBudget);
              return (
                <div
                  key={badge.id}
                  style={{
                    background: isEarned ? '#ffffff' : 'var(--wash)',
                    border: isEarned ? '1px solid var(--rust)' : '1px solid var(--line)',
                    borderRadius: '14px',
                    padding: '1.1rem 1rem',
                    textAlign: 'center',
                    boxShadow: isEarned ? '0 6px 20px rgba(255, 215, 0, 0.15)' : 'none',
                    filter: isEarned ? 'none' : 'grayscale(1)',
                    opacity: isEarned ? 1 : 0.45,
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '2.2rem', marginBottom: '6px' }}>
                    {isEarned ? badge.emoji : '🔒'}
                  </div>
                  <div style={{ color: isEarned ? 'var(--rust)' : 'var(--muted)', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '4px' }}>
                    {badge.name}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.75rem', lineHeight: '1.3' }}>
                    {badge.description}
                  </div>
                  {isEarned && (
                    <span style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.7rem', color: '#2ec4b6' }}>
                      ✓ Unlocked
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MAIN CONTENT GRID: EXPENSE FORM & EXPENSES LIST ── */}
        <div className="budget-grid">
          {/* ── LEFT COLUMN: EXPENSE ENTRY FORM ── */}
          <div className="form-column">
            <div style={{ display: 'flex', background: 'var(--wash)', border: '1px solid var(--line)', borderRadius: '50px', padding: '4px', marginBottom: '1.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
              <button
                type="button"
                onClick={() => setActiveTab('expenses')}
                style={{
                  flex: 1, padding: '0.75rem 1rem', borderRadius: '50px', border: 'none',
                  background: activeTab === 'expenses' ? '#ffffff' : 'transparent',
                  color: activeTab === 'expenses' ? 'var(--rust)' : 'var(--ink-2)',
                  fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer',
                  boxShadow: activeTab === 'expenses' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Expense Log
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('converter')}
                style={{
                  flex: 1, padding: '0.75rem 1rem', borderRadius: '50px', border: 'none',
                  background: activeTab === 'converter' ? '#ffffff' : 'transparent',
                  color: activeTab === 'converter' ? 'var(--rust)' : 'var(--ink-2)',
                  fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer',
                  boxShadow: activeTab === 'converter' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Converter
              </button>
            </div>

            {activeTab === 'converter' ? (
              <div style={{ position: 'sticky', top: '100px' }}>
                <CurrencyWidget />
              </div>
            ) : (
            <form
              onSubmit={handleAddExpense}
              style={{
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid var(--line)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
                position: 'sticky',
                top: '100px'
              }}
            >
              <h2 style={{ fontSize: '1.8rem', color: 'var(--ink)', marginBottom: '0.4rem' }}>
                <CreditCard size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> Log New Expense
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Track your trip spending in Indian Rupees (₹ INR). Saved automatically.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* 1. Amount in INR */}
                <div>
                  <label style={{ display: 'block', color: 'var(--rust)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                    Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="E.g., 450"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: 'var(--wash)',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      color: 'var(--ink)',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* 2. Category Dropdown */}
                <div>
                  <label style={{ display: 'block', color: 'var(--rust)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 1rem',
                      background: 'var(--wash)',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      color: 'var(--ink)',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Food">Food & Dining</option>
                    <option value="Transport">Transport & Transit</option>
                    <option value="Stay">Stay & Accommodation</option>
                    <option value="Experiences">Experiences & Tickets</option>
                    <option value="Shopping">Shopping & Gifts</option>
                    <option value="Emergency">Emergency & Medical</option>
                  </select>
                </div>

                {/* 3. Short Note (Optional) */}
                <div>
                  <label style={{ display: 'block', color: 'var(--rust)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                    Note <small style={{ color: 'var(--muted)', fontWeight: 'normal' }}>(Optional)</small>
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="E.g., Filter coffee & tiffin at Rayar Mess"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: 'var(--wash)',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      color: 'var(--ink)',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* 4. Date Input */}
                <div>
                  <label style={{ display: 'block', color: 'var(--rust)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: 'var(--wash)',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      color: 'var(--ink)',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  style={{
                    padding: '0.9rem 1.5rem',
                    background: 'var(--accent, #FFD700)',
                    color: 'var(--ink)',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    borderRadius: '50px',
                    border: 'none',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    marginTop: '0.5rem'
                  }}
                >
                  Save Expense <Wallet size={18} style={{marginLeft: "8px", verticalAlign: "middle"}} />
                </button>
              </div>
            </form>
            )}
          </div>

          {/* ── RIGHT COLUMN: SUMMARY METRIC CARDS & EXPENSES LIST ── */}
          <div className="list-column">
            {/* ── 1. THREE METRIC CARDS SUMMARY ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
              }}
            >
              {/* Card 1: Total Spent */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #FFD700',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}
              >
                <span style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                  <IndianRupee size={16} style={{marginRight: "6px", verticalAlign: "middle", color: "#FFD700"}} /> Total Spent
                </span>
                <div style={{ color: 'var(--rust)', fontSize: '1.8rem', fontWeight: 'bold' }}>
                  ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <small style={{ color: '#777', fontSize: '0.75rem' }}>{expenses.length} logged entries</small>
              </div>

              {/* Card 2: Editable Daily Budget */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--line)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}
              >
                <span style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                  <Target size={16} style={{marginRight: "6px", verticalAlign: "middle", color: "#FFD700"}} /> Daily Budget (₹)
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--ink)', fontSize: '1.4rem', fontWeight: 'bold' }}>₹</span>
                  <input
                    type="number"
                    value={dailyBudget}
                    onChange={(e) => handleDailyBudgetChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.6rem',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid #444466',
                      borderRadius: '6px',
                      color: 'var(--ink)',
                      fontSize: '1.4rem',
                      fontWeight: 'bold',
                      outline: 'none'
                    }}
                  />
                </div>
                <small style={{ color: '#777', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  Saved to localStorage
                </small>
              </div>

              {/* Card 3: Remaining Budget */}
              <div
                style={{
                  background: '#ffffff',
                  border: isPositiveRemaining ? '1px solid #2ec4b6' : '1px solid #ff4d4d',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  boxShadow: isPositiveRemaining ? '0 4px 15px rgba(46, 196, 182, 0.15)' : '0 4px 15px rgba(255, 77, 77, 0.15)'
                }}
              >
                <span style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                  {isPositiveRemaining ? <><CheckCircle size={16} style={{marginRight: "6px", verticalAlign: "middle", color: "#10b981"}} /> Remaining</> : <><ShieldAlert size={18} style={{marginRight: "4px", verticalAlign: "middle"}} /> Deficit</>}
                </span>
                <div style={{ color: isPositiveRemaining ? '#2ec4b6' : '#ff4d4d', fontSize: '1.8rem', fontWeight: 'bold' }}>
                  {isPositiveRemaining ? '' : '-'}₹{Math.abs(remaining).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <small style={{ color: isPositiveRemaining ? '#2ec4b6' : '#ff4d4d', fontSize: '0.75rem' }}>
                  {isPositiveRemaining ? 'Within target budget' : 'Exceeded daily limit'}
                </small>
              </div>
            </div>

            {/* ── 2. CATEGORY SPENDING BREAKDOWN ── */}
            {activeCategories.length > 0 && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--line)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '2.5rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}
              >
                <h3 style={{ fontSize: '1.3rem', color: 'var(--ink)', marginBottom: '1rem' }}>
                  <PieChart size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> Category Spending Share
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeCategories.map((cat) => {
                    const style = CATEGORY_STYLES[cat.name] || CATEGORY_STYLES.Food;
                    return (
                      <div key={cat.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--ink)', fontWeight: 'bold' }}>
                            {style.icon} {cat.name}
                          </span>
                          <span style={{ color: 'var(--muted)' }}>
                            <strong style={{ color: 'var(--rust)' }}>₹{cat.total.toLocaleString('en-IN')}</strong> ({cat.percent}%)
                          </span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--line)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${cat.percent}%`,
                              background: style.color,
                              borderRadius: '4px',
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 3. EXPENSES CARDS LIST ── */}
            <h2 style={{ fontSize: '1.8rem', color: 'var(--ink)', marginBottom: '1.25rem' }}>
              <ClipboardList size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#111"}} /> Expense Records ({expenses.length})
            </h2>

            {expenses.length === 0 ? (
              <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem', background: 'var(--wash)', borderRadius: '14px', border: '1px dashed var(--line)' }}>
                No expenses logged yet. Use the form on the left to add your first expense!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {expenses.map((exp) => {
                  const style = CATEGORY_STYLES[exp.category] || CATEGORY_STYLES.Food;
                  return (
                    <div
                      key={exp.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--line)',
                        borderRadius: '14px',
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s ease, border-color 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: style.bg,
                            border: `1px solid ${style.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem',
                            flexShrink: 0
                          }}
                        >
                          {style.icon}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '4px' }}>
                            <span
                              style={{
                                background: style.bg,
                                color: style.text,
                                border: `1px solid ${style.border}`,
                                padding: '2px 8px',
                                borderRadius: '14px',
                                fontSize: '0.72rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                              }}
                            >
                              {exp.category}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={14} /> {exp.date}
                            </span>
                          </div>

                          <div style={{ color: 'var(--ink)', fontSize: '1rem', fontWeight: '500' }}>
                            {exp.note || `${exp.category} Expense`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, marginLeft: 'auto' }}>
                        <span style={{ color: 'var(--rust)', fontSize: '1.25rem', fontWeight: '900', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', alignSelf: 'center', marginTop: '2px' }}>
                          ₹{parseFloat(exp.amount).toLocaleString('en-IN')}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id)}
                          title="Delete expense"
                          style={{
                            background: 'rgba(255, 77, 77, 0.15)',
                            color: '#ff4d4d',
                            border: '1px solid rgba(255, 77, 77, 0.3)',
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .budget-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        @media (min-width: 900px) {
          .budget-grid {
            grid-template-columns: 360px 1fr !important;
          }
        }

        @keyframes toastSlide {
          from {
            transform: translate(-50%, -40px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default BudgetTrackerPage;
















