import React, { useState, useEffect } from 'react';

const CURRENCIES = [
  { code: "USD", name: "US Dollar",        symbol: "$" },
  { code: "EUR", name: "Euro",             symbol: "€" },
  { code: "GBP", name: "British Pound",    symbol: "£" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AED", name: "UAE Dirham",       symbol: "AED "},
  { code: "JPY", name: "Japanese Yen",     symbol: "¥" },
  { code: "AUD", name: "Australian Dollar",symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar",  symbol: "C$" },
  { code: "THB", name: "Thai Baht",        symbol: "฿" },
  { code: "MYR", name: "Malaysian Ringgit",symbol: "RM" },
];

const CurrencyWidget = () => {
  const [rates, setRates] = useState({});
  const [amount, setAmount] = useState(1000);
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://open.er-api.com/v6/latest/INR");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data.result === "success") {
          setRates(data.rates);
          setError(null);
        } else {
          throw new Error("API response unsuccessful");
        }
      } catch (err) {
        setError("Could not load rates. Check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const converted = rates[targetCurrency] 
    ? (amount * rates[targetCurrency]).toFixed(2) 
    : null;

  return (
    <div className="currency-widget" style={{ 
      padding: '2rem', 
      background: 'var(--wash)', 
      border: '1px solid var(--line)', 
      borderRadius: '16px', 
      boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
      color: 'var(--ink)' 
    }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 'bold',  color: 'var(--ink)' }}>Currency Converter</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="amount" style={{ fontSize: '0.85rem', color: 'var(--rust)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount (INR)</label>
          <input 
            id="amount"
            type="number" 
            min="0"
            max="9999999"
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--line)', background: '#ffffff', color: 'var(--ink)', fontSize: '1rem', outline: 'none' }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="target-currency" style={{ fontSize: '0.85rem', color: 'var(--rust)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>To</label>
          <select 
            id="target-currency"
            value={targetCurrency} 
            onChange={(e) => setTargetCurrency(e.target.value)}
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--line)', background: '#ffffff', color: 'var(--ink)', fontSize: '1rem', outline: 'none' }}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code} style={{ background: "#ffffff", color: "var(--ink)" }}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ 
        padding: '1.5rem', 
        background: '#ffffff', 
        borderRadius: '12px', 
        textAlign: 'center',
        border: '1px solid var(--line)',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {loading ? (
          <div style={{ color: 'var(--muted)' }}>Loading rates...</div>
        ) : error ? (
          <div style={{ color: '#ff6b6b' }}>{error}</div>
        ) : (!amount || amount <= 0) ? (
          <div style={{ color: 'var(--muted)' }}>Enter an amount</div>
        ) : (
          <>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--rust)' }}>
              {CURRENCIES.find(c => c.code === targetCurrency)?.symbol}{converted}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
              1 INR = {rates[targetCurrency].toFixed(4)} {targetCurrency}
            </div>
          </>
        )}
      </div>

      {!loading && !error && (
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 'normal', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1000 INR equals:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem' }}>
            {CURRENCIES.map(currency => (
              <div key={currency.code} style={{ padding: '0.75rem 0.5rem', background: '#ffffff', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>{currency.code}</div>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--rust)' }}>
                  {currency.symbol}{(1000 * rates[currency.code]).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyWidget;

