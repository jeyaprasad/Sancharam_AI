// Firebase Realtime Database integration for live trip sessions

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if actual Firebase environment variables are provided
export const isFirebaseConfigured = () => {
  return Boolean(
    import.meta.env.VITE_FIREBASE_DATABASE_URL || import.meta.env.VITE_FIREBASE_API_KEY
  );
};

// Generate UUID or unique trip ID
export const generateTripId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `trip_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `trip_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
};

// In-memory store fallback for live session synchronization
const tripMemoryDB = {};

/**
 * Creates or updates a live trip session in Firebase Realtime Database.
 * Saves: origin, destination, routeCoords, startTime, contact, status
 */
export const createTripSession = async (tripId, tripData) => {
  tripMemoryDB[tripId] = {
    ...tripData,
    positions: tripData.positions || [],
    updatedAt: Date.now()
  };

  if (isFirebaseConfigured() && firebaseConfig.databaseURL) {
    try {
      await fetch(`${firebaseConfig.databaseURL}/trips/${tripId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripMemoryDB[tripId])
      });
    } catch (err) {
      console.warn("Firebase RTDB sync info:", err);
    }
  }
  return true;
};

/**
 * Pushes a new position tick to positions/{tripId} and updates currentPosition.
 */
export const updateTripPosition = async (tripId, posData) => {
  if (!tripMemoryDB[tripId]) {
    tripMemoryDB[tripId] = { positions: [] };
  }
  const posEntry = { ...posData, timestamp: Date.now() };
  if (!tripMemoryDB[tripId].positions) tripMemoryDB[tripId].positions = [];
  tripMemoryDB[tripId].positions.push(posEntry);
  tripMemoryDB[tripId].currentPosition = posData;
  tripMemoryDB[tripId].updatedAt = Date.now();

  if (isFirebaseConfigured() && firebaseConfig.databaseURL) {
    try {
      // 1. Update currentPosition
      await fetch(`${firebaseConfig.databaseURL}/trips/${tripId}/currentPosition.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posData)
      });
      // 2. Push to positions subcollection
      await fetch(`${firebaseConfig.databaseURL}/positions/${tripId}.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posEntry)
      });
    } catch (err) {
      console.warn("Firebase RTDB position tick info:", err);
    }
  }
  return true;
};

/**
 * Subscribes to live trip session updates in Realtime Database.
 */
export const subscribeToTripSession = (tripId, callback) => {
  const fetchAndNotify = async () => {
    if (tripMemoryDB[tripId]) {
      callback(tripMemoryDB[tripId]);
    }

    if (isFirebaseConfigured() && firebaseConfig.databaseURL) {
      try {
        const res = await fetch(`${firebaseConfig.databaseURL}/trips/${tripId}.json`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            tripMemoryDB[tripId] = data;
            callback(data);
          }
        }
      } catch (err) {}
    }
  };

  fetchAndNotify();
  const interval = setInterval(fetchAndNotify, 1000);
  return () => clearInterval(interval);
};

/**
 * Updates status of a trip (Active, Alert, SOS, Arrived).
 */
export const updateTripStatus = async (tripId, status) => {
  if (tripMemoryDB[tripId]) {
    tripMemoryDB[tripId].status = status;
    tripMemoryDB[tripId].updatedAt = Date.now();
  }

  if (isFirebaseConfigured() && firebaseConfig.databaseURL) {
    try {
      await fetch(`${firebaseConfig.databaseURL}/trips/${tripId}/status.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status)
      });
    } catch (err) {
      console.warn("Firebase RTDB status update info:", err);
    }
  }
  return true;
};
