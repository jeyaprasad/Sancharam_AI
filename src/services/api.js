/**
 * Fetches risk zones data from the mock local dataset.
 * In a real application, this would fetch from a database or live API.
 */
export const fetchRiskZones = async () => {
  try {
    const response = await fetch('/data/risk_zones.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Could not fetch risk zones:", error);
    return [];
  }
};
