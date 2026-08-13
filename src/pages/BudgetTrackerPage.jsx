import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CurrencyWidget from '@/components/CurrencyWidget';

const CATEGORY_STYLES = {
  Food: { bg: 'rgba(255, 152, 0, 0.15)', text: '#ff9800', border: 'rgba(255, 152, 0, 0.4)', icon: '🍱', color: '#ff9800' },
  Transport: { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3', border: 'rgba(33, 150, 243, 0.4)', icon: '🚌', color: '#2196f3' },
  Stay: { bg: 'rgba(156, 39, 176, 0.15)', text: '#ab47bc', border: 'rgba(156, 39, 176, 0.4)', icon: '🏨', color: '#ab47bc' },
  Experiences: { bg: 'rgba(255, 215, 0, 0.15)', text: '#FFD700', border: 'rgba(255, 215, 0, 0.4)', icon: '🎟️', color: '#FFD700' },
  Shopping: { bg: 'rgba(233, 30, 99, 0.15)', text: '#e91e63', border: 'rgba(233, 30, 99, 0.4)', icon: '🛍️', color: '#e91e63' },
  Emergency: { bg: 'rgba(255, 77, 77, 0.15)', text: '#ff4d4d', border: 'rgba(255, 77, 77, 0.4)', icon: '🚨', color: '#ff4d4d' }
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
            color: '#FFD700',
            padding: '0.9rem 2rem',
            borderRadius: '50px',
            fontSize: '1.05rem',
            fontWeight: 'bold',
            boxShadow: '0 10px 35px rgba(255, 215, 0, 0.4)',
            zIndex: 10000,
            animation: 'toastSlide 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          🎉 {toastMessage}
        </div>
      )}

      <div className="features-hero-bg">
        <header>
          <div className="nav-in">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
                border: '1px solid #FFD700',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', fontWeight: '700', color: '#1A1A1A', letterSpacing: '-0.3px' }}>
                San<span style={{ color: '#B4451F' }}>charam</span>
              </span>
            </Link>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/features">Features</Link>
              <Link to="/features/budget" aria-current="page">Budget</Link>
              <Link to="/features/itinerary">Planner</Link>
            </nav>
          </div>
        </header>

        <section className="hero wrap" style={{ paddingTop: '120px', minHeight: '340px' }}>
          <div className="rv in">
            <span className="pill" lang="ta"><i></i>பயண நிதி</span>
            <h1>Travel <em>Budget Tracker</em></h1>
            <p className="hero-sub" style={{ fontSize: '1.3rem', color: 'var(--accent, #FFD700)', marginTop: '0.5rem' }}>
              பயண நிதி · Currency Converter & INR Expense Manager
            </p>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '3rem 2rem 5rem 2rem' }}>
        {/* ── TOP SECTION 1: BADGES GRID (ALL 6 BADGES) ── */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem', fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
            🎖️ Travel Badges & Achievements
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
                    background: isEarned ? 'linear-gradient(135deg, #1e1e2d, #141422)' : '#12121a',
                    border: isEarned ? '1px solid #FFD700' : '1px solid #282838',
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
                  <div style={{ color: isEarned ? '#FFD700' : '#888', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '4px' }}>
                    {badge.name}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '0.75rem', lineHeight: '1.3' }}>
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

        {/* ── TOP SECTION 2: CURRENCY WIDGET COMPONENT ── */}
        <div style={{ marginBottom: '3.5rem' }}>
          <CurrencyWidget />
        </div>

        {/* ── MAIN CONTENT GRID: EXPENSE FORM & EXPENSES LIST ── */}
        <div className="budget-grid">
          {/* ── LEFT COLUMN: EXPENSE ENTRY FORM ── */}
          <div className="form-column">
            <form
              onSubmit={handleAddExpense}
              style={{
                background: '#14141d',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #282838',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                position: 'sticky',
                top: '100px'
              }}
            >
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.4rem', fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
                💳 Log New Expense
              </h2>
              <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Track your trip spending in Indian Rupees (₹ INR). Saved automatically.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* 1. Amount in INR */}
                <div>
                  <label style={{ display: 'block', color: '#FFD700', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
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
                      background: '#1a1a26',
                      border: '1px solid #33334d',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* 2. Category Dropdown */}
                <div>
                  <label style={{ display: 'block', color: '#FFD700', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 1rem',
                      background: '#1a1a26',
                      border: '1px solid #33334d',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Food">🍱 Food & Dining</option>
                    <option value="Transport">🚌 Transport & Transit</option>
                    <option value="Stay">🏨 Stay & Accommodation</option>
                    <option value="Experiences">🎟️ Experiences & Tickets</option>
                    <option value="Shopping">🛍️ Shopping & Gifts</option>
                    <option value="Emergency">🚨 Emergency & Medical</option>
                  </select>
                </div>

                {/* 3. Short Note (Optional) */}
                <div>
                  <label style={{ display: 'block', color: '#FFD700', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                    Note <small style={{ color: '#888', fontWeight: 'normal' }}>(Optional)</small>
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="E.g., Filter coffee & tiffin at Rayar Mess"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: '#1a1a26',
                      border: '1px solid #33334d',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* 4. Date Input */}
                <div>
                  <label style={{ display: 'block', color: '#FFD700', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
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
                      background: '#1a1a26',
                      border: '1px solid #33334d',
                      borderRadius: '8px',
                      color: '#fff',
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
                    color: '#000',
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
                  Save Expense 💸
                </button>
              </div>
            </form>
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
                  background: '#14141d',
                  border: '1px solid #FFD700',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}
              >
                <span style={{ color: '#aaa', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                  💰 Total Spent
                </span>
                <div style={{ color: '#FFD700', fontSize: '1.8rem', fontWeight: 'bold' }}>
                  ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <small style={{ color: '#777', fontSize: '0.75rem' }}>{expenses.length} logged entries</small>
              </div>

              {/* Card 2: Editable Daily Budget */}
              <div
                style={{
                  background: '#14141d',
                  border: '1px solid #33334d',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}
              >
                <span style={{ color: '#aaa', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                  🎯 Daily Budget (₹)
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold' }}>₹</span>
                  <input
                    type="number"
                    value={dailyBudget}
                    onChange={(e) => handleDailyBudgetChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.6rem',
                      background: '#1a1a28',
                      border: '1px solid #444466',
                      borderRadius: '6px',
                      color: '#fff',
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
                  background: '#14141d',
                  border: isPositiveRemaining ? '1px solid #2ec4b6' : '1px solid #ff4d4d',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  boxShadow: isPositiveRemaining ? '0 4px 15px rgba(46, 196, 182, 0.15)' : '0 4px 15px rgba(255, 77, 77, 0.15)'
                }}
              >
                <span style={{ color: '#aaa', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                  {isPositiveRemaining ? '✅ Remaining' : '⚠️ Deficit'}
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
                  background: '#14141d',
                  border: '1px solid #282838',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '2.5rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}
              >
                <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1rem', fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
                  📊 Category Spending Share
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeCategories.map((cat) => {
                    const style = CATEGORY_STYLES[cat.name] || CATEGORY_STYLES.Food;
                    return (
                      <div key={cat.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.9rem' }}>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>
                            {style.icon} {cat.name}
                          </span>
                          <span style={{ color: '#aaa' }}>
                            <strong style={{ color: '#FFD700' }}>₹{cat.total.toLocaleString('en-IN')}</strong> ({cat.percent}%)
                          </span>
                        </div>
                        <div style={{ height: '8px', background: '#222233', borderRadius: '4px', overflow: 'hidden' }}>
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
            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1.25rem', fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
              📋 Expense Records ({expenses.length})
            </h2>

            {expenses.length === 0 ? (
              <div style={{ color: '#aaa', textAlign: 'center', padding: '3rem', background: '#14141d', borderRadius: '14px', border: '1px dashed #333' }}>
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
                        background: '#14141d',
                        border: '1px solid #282838',
                        borderRadius: '14px',
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
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
                            <span style={{ fontSize: '0.8rem', color: '#777' }}>
                              📅 {exp.date}
                            </span>
                          </div>

                          <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '500' }}>
                            {exp.note || `${exp.category} Expense`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span style={{ color: '#FFD700', fontSize: '1.3rem', fontWeight: 'bold' }}>
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
                          🗑️
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

      <div className="wrap">
        <footer>
          <Link to="/" className="logo">San<span>charam</span></Link>
          <div className="f-links">
            <Link to="/features/safety">Safety</Link>
            <Link to="/features/itinerary">Planner</Link>
            <Link to="/features/uncharted">Uncharted</Link>
            <Link to="/features/blockchain">Guardian</Link>
            <Link to="/features/tribes">Tribes</Link>
          </div>
          <small>© 2026 Sancharam · Chennai</small>
        </footer>
      </div>
    </div>
  );
};

export default BudgetTrackerPage;
