/**
 * Fetches risk zones data from the backend API or local dataset fallback.
 */
export const fetchRiskZones = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/risk-zones');
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.log("Flask backend not available, falling back to local risk_zones.json");
  }

  try {
    const response = await fetch('/data/risk_zones.json');
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error("Could not fetch risk zones:", error);
  }

  return [];
};

export const analyzeRoute = async (origin, destination, hour) => {
  try {
    const response = await fetch('http://localhost:5000/api/analyze-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, hour })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend analyze-route call failed:', err);
  }
  return null;
};
