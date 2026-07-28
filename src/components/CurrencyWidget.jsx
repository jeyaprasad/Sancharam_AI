import React, { useState, useEffect } from 'react';

const CURRENCIES = [
  { code: "USD", name: "US Dollar",        symbol: "$"  },
  { code: "EUR", name: "Euro",             symbol: "€"  },
  { code: "GBP", name: "British Pound",    symbol: "£"  },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AED", name: "UAE Dirham",       symbol: "د.إ"},
  { code: "JPY", name: "Japanese Yen",     symbol: "¥"  },
  { code: "AUD", name: "Australian Dollar",symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar",  symbol: "C$" },
  { code: "THB", name: "Thai Baht",        symbol: "฿"  },
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
        const response = await fetch("https://api.frankfurter.app/latest?from=INR&to=USD,EUR,GBP,SGD,AED,JPY,AUD,CAD,THB,MYR");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setRates(data.rates);
        setError(null);
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
    <div className="currency-widget" style={{ padding: '1.5rem', border: '1px solid #333', borderRadius: '12px', background: 'var(--bg-card, #111)', color: 'var(--text, #f0f0f0)' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '600' }}>Currency Converter</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="amount" style={{ fontSize: '0.9rem', color: '#aaa' }}>Amount (INR)</label>
          <input 
            id="amount"
            type="number" 
            min="0"
            max="9999999"
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #333', background: '#222', color: '#fff', fontSize: '1rem' }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="target-currency" style={{ fontSize: '0.9rem', color: '#aaa' }}>To</label>
          <select 
            id="target-currency"
            value={targetCurrency} 
            onChange={(e) => setTargetCurrency(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #333', background: '#222', color: '#fff', fontSize: '1rem' }}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ 
        padding: '1.5rem', 
        background: '#1a1a1a', 
        borderRadius: '8px', 
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {loading ? (
          <div style={{ color: '#888' }}>Loading rates...</div>
        ) : error ? (
          <div style={{ color: '#ff6b6b' }}>{error}</div>
        ) : (!amount || amount <= 0) ? (
          <div style={{ color: '#888' }}>Enter an amount</div>
        ) : (
          <>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' }}>
              {CURRENCIES.find(c => c.code === targetCurrency)?.symbol} {converted}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>
              1 INR = {rates[targetCurrency]} {targetCurrency}
            </div>
          </>
        )}
      </div>

      {!loading && !error && (
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#aaa' }}>1000 INR equals:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem' }}>
            {CURRENCIES.map(currency => (
              <div key={currency.code} style={{ padding: '0.75rem 0.5rem', background: '#1a1a1a', borderRadius: '6px', textAlign: 'center', border: '1px solid #222' }}>
                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.25rem' }}>{currency.code}</div>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#ddd' }}>
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
