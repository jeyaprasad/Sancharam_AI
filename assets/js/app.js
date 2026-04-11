/* ============================================================
   SANCHARAM — TRAVEL PLANNER  |  app.js
   ============================================================
   TABLE OF CONTENTS
   ─────────────────
   1.  FIREBASE SETUP   ✅ LIVE
   2.  APP STATE
   3.  PAGE LOAD
   4.  FORM HELPERS
   5.  TRIP GENERATION
   6.  AI INTEGRATION   ✅ LIVE
   7.  RENDER RESULTS
   8.  SAVE & LOAD TRIPS  ✅ LIVE — saves to Firestore
   9.  AUTH MODAL
   10. GOOGLE SIGN-IN   ✅ LIVE — real Google OAuth
   11. GOOGLE PLACES    ← add real API in Step 5
   12. UI UTILITIES
   ============================================================ */


/* ── 1. FIREBASE SETUP ────────────────────────────────────────
   Your real Firebase project is connected here.
   DO NOT share these keys publicly or push to GitHub.
──────────────────────────────────────────────────────────────*/
import { initializeApp }                              from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore, collection, addDoc,
         getDocs, query, orderBy }                    from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { getAuth, GoogleAuthProvider,
         signInWithPopup, onAuthStateChanged,
         signOut as firebaseSignOut }                 from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

// ── Your Firebase project config ──────────────────────────
const firebaseConfig = {
  apiKey           : 'AIzaSyC_FyV4uNj0N86CARNxGv2DPpt_U6NuxCE',
  authDomain       : 'sancharam-app.firebaseapp.com',
  projectId        : 'sancharam-app',
  storageBucket    : 'sancharam-app.firebasestorage.app',
  messagingSenderId: '656232272737',
  appId            : '1:656232272737:web:b36787951a49a46fa8eb20',
};

// ── Start Firebase services ────────────────────────────────
const firebaseApp = initializeApp(firebaseConfig);
const db          = getFirestore(firebaseApp);   // Firestore database
const auth        = getAuth(firebaseApp);         // Google Auth
const provider    = new GoogleAuthProvider();     // Google sign-in provider


/* ── 2. APP STATE ─────────────────────────────────────────────*/
const state = {
  travelerCount : 2,
  budget        : 'Budget',
  currentTrip   : null,
  savedTrips    : [],
  isLoggedIn    : false,
  user          : null,
};


/* ── 3. PAGE LOAD ─────────────────────────────────────────────
   Runs once when the page is ready.
──────────────────────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  setDefaultDates();
  initScrollReveal();
  initHeroCardCycle();
  initNavTripLink();
  initGoogleSignInBtn();

  // ✅ Firebase: auto-detect if user is already signed in
  // (e.g. they signed in yesterday and refreshed the page)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in — update UI without asking them to sign in again
      onUserSignedIn({
        name : user.displayName,
        email: user.email,
        uid  : user.uid,
      });
    } else {
      // No user signed in — load from localStorage as fallback
      loadLocalTrips();
    }
  });
});


/* ── 4. FORM HELPERS ──────────────────────────────────────────*/
function setDefaultDates() {
  const today    = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const fmt      = d => d.toISOString().split('T')[0];
  document.getElementById('start-date').value = fmt(today);
  document.getElementById('end-date').value   = fmt(nextWeek);
}

function adjustTravelers(delta) {
  state.travelerCount = Math.max(1, Math.min(20, state.travelerCount + delta));
  document.getElementById('traveler-display').textContent = state.travelerCount;
}

function selectBudget(el) {
  document.querySelectorAll('.budget-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  state.budget = el.textContent.trim();
}


/* ── 5. TRIP GENERATION ───────────────────────────────────────*/
async function generateTrip() {
  const destination = document.getElementById('destination').value.trim();
  const startDate   = document.getElementById('start-date').value;
  const endDate     = document.getElementById('end-date').value;
  const style       = document.getElementById('travel-style').value;
  const interests   = document.getElementById('interests').value.trim();

  if (!destination)           { showToast('Please enter a destination ✈️');    return; }
  if (!startDate || !endDate) { showToast('Please pick your travel dates 📅'); return; }
  if (new Date(endDate) <= new Date(startDate)) {
    showToast('End date must be after start date'); return;
  }

  const days = Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1;
  const generateBtn = document.querySelector('.btn-generate');
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.5';
    generateBtn.innerText = 'Generating...';
  }

  showLoading(
    `Planning your ${days}-day trip to ${destination}…`,
    'Asking Gemini AI for personalised recommendations'
  );

  try {
    // ★ STEP 4 — Call Gemini AI Natively
    const tripData = await callGeminiAI(destination, days, state.travelerCount, state.budget, style, interests);

    state.currentTrip = tripData;
    renderResults(tripData);
  } catch (err) {
    if (err.message.includes('OFFLINE')) {
      showToast('❌ You are offline. Please reconnect and try again.');
    } else if (err.message.includes('QUOTA_EXCEEDED')) {
      showToast('⚠️ AI is busy (Quota Exceeded). Please wait a moment.');
    } else if (err.message.includes('SERVER_ERROR') || err.message.includes('API_ERROR')) {
       showToast('⚠️ AI service issue. Please try again later.');
    } else {
      showToast('Something went wrong. Please try again.');
    }
    console.error(err);
  } finally {
    hideLoading();
    const generateBtn = document.querySelector('.btn-generate');
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.style.opacity = '1';
      generateBtn.innerText = 'Generate Itinerary →';
    }
  }
}


/* ── 6. GEMINI AI INTEGRATION ─────────────*/
async function callGeminiAI(destination, days, travelers, budget, style, interests) {

  const prompt  = `
    Create a ${days}-day travel itinerary for ${destination}.
    Travelers: ${travelers}. Budget: ${budget}. Style: ${style}.
    Interests: ${interests || 'general sightseeing'}.
    Return ONLY valid JSON without any markdown formatting wrappers:
    { "itinerary": [{ "day":1, "theme":"...","activities":[{ "time":"08:00","name":"...","desc":"...","duration":"...","tickets":"..." }] }],
      "hotels": [{ "name":"...","address":"...","price":"...","rating":4.5 }] }
  `;
  if (!navigator.onLine) throw new Error('OFFLINE');
  const res = await fetch(`/.netlify/functions/itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt })
  });
  
  if (!res.ok) {
    if (res.status === 429) throw new Error("QUOTA_EXCEEDED");
    if (res.status >= 500) throw new Error("SERVER_ERROR");
    throw new Error("API_ERROR");
  }
  
  const json = await res.json();
  const raw = json.candidates[0].content.parts[0].text;
  const parsed = JSON.parse(raw.replace(/```json|```/g,'').trim());
  return { destination, days, travelers, budget, style, interests, ...parsed, createdAt: new Date().toISOString() };
}


/* ── 7. RENDER RESULTS ────────────────────────────────────────*/
function renderResults(data) {
  document.getElementById('results-title').textContent =
    `Your ${data.destination} Adventure`;
  document.getElementById('results-subtitle').textContent =
    `${data.days} day${data.days>1?'s':''} · ${data.travelers} traveler${data.travelers>1?'s':''} · ${data.budget} budget` +
    (data.style ? ` · ${data.style}` : '');

  // Day cards
  document.getElementById('itinerary-days').innerHTML = data.itinerary.map((day, idx) => `
    <div class="day-card ${idx===0?'open':''}" onclick="toggleDay(this)">
      <div class="day-card-header">
        <div class="day-title-group">
          <span class="day-number">${String(day.day).padStart(2,'0')}</span>
          <div>
            <div class="day-title">Day ${day.day}</div>
            <div class="day-theme">${day.theme}</div>
          </div>
        </div>
        <div class="day-toggle">⌄</div>
      </div>
      <div class="day-card-body">
        ${day.activities.map(act => `
          <div class="activity-item">
            <div class="activity-time">${act.time}</div>
            <div>
              <div class="activity-name">${act.name}</div>
              <div class="activity-desc">${act.desc}</div>
              <div class="activity-meta">
                <span>⏱ ${act.duration}</span>
                <span class="green">🎟 ${act.tickets}</span>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('');

  // Hotel cards
  document.getElementById('hotels-grid').innerHTML = data.hotels.map(h => `
    <div class="hotel-card">
      <div class="hotel-img">${h.name.split(' ').slice(-1)[0].toUpperCase().slice(0,4)}</div>
      <div class="hotel-body">
        <div class="hotel-name">${h.name}</div>
        <div class="hotel-address">${h.address}</div>
        <div class="hotel-footer">
          <div>
            <span class="hotel-price">${h.price}</span>
            <span class="hotel-price-label">per night</span>
          </div>
          <div class="hotel-rating"><span class="star">★</span> ${h.rating}</div>
        </div>
      </div>
    </div>`).join('');

  const section = document.getElementById('results-section');
  section.classList.add('visible');
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleDay(card) {
  const wasOpen = card.classList.contains('open');
  document.querySelectorAll('.day-card.open').forEach(c => c.classList.remove('open'));
  if (!wasOpen) card.classList.add('open');
}

function clearResults() {
  document.getElementById('results-section').classList.remove('visible');
  state.currentTrip = null;
}


/* ── 8. SAVE & LOAD TRIPS ─────────────────────────────────────
   ✅ FIREBASE LIVE — saves to Firestore when signed in,
   falls back to localStorage when not signed in.
──────────────────────────────────────────────────────────────*/

/** Called when user clicks "Save Trip" */
async function saveTrip() {
  if (!state.currentTrip) return;

  if (!state.isLoggedIn) {
    showToast('Sign in to save trips to the cloud 🔒');
    openAuthModal();
    return;
  }

  try {
    showLoading('Saving your trip…', 'Writing to Firebase Firestore');

    // ✅ Save to Firestore under: users → {uid} → trips → {auto-id}
    const tripData = {
      ...state.currentTrip,
      savedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, 'users', state.user.uid, 'trips'),
      tripData
    );

    // Add to local state too so it shows immediately
    state.savedTrips.unshift({ ...tripData, id: docRef.id });

    hideLoading();
    showToast('Trip saved to the cloud! ✓', 'success');
    renderSavedTrips();

  } catch (err) {
    hideLoading();
    showToast('Save failed. Check your connection.');
    console.error('Firestore save error:', err);
  }
}

/** Load trips from Firestore for signed-in user */
async function loadFirestoreTrips() {
  if (!state.isLoggedIn) return;

  try {
    const q    = query(
      collection(db, 'users', state.user.uid, 'trips'),
      orderBy('savedAt', 'desc')
    );
    const snap = await getDocs(q);
    state.savedTrips = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderSavedTrips();
  } catch (err) {
    console.error('Firestore load error:', err);
    showToast('Could not load trips. Check your connection.');
  }
}

/** Fallback: load from localStorage when user is not signed in */
function loadLocalTrips() {
  const raw        = localStorage.getItem('voya_trips');
  state.savedTrips = raw ? JSON.parse(raw) : [];
  renderSavedTrips();
}

/** Render the My Trips grid from state.savedTrips */
function renderSavedTrips() {
  const grid = document.getElementById('trips-grid');
  if (!grid) return;

  if (state.savedTrips.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>No saved trips yet</p>
        <p>Plan a trip above and hit "Save Trip" to see it here.</p>
      </div>`;
    return;
  }

  grid.innerHTML = state.savedTrips.map(trip => `
    <div class="trip-card" onclick="viewSavedTrip('${trip.id}')">
      <div class="trip-card-thumb">${trip.destination.split(',')[0].toUpperCase().slice(0,4)}</div>
      <div class="trip-card-body">
        <div class="trip-destination">${trip.destination}</div>
        <div class="trip-date">
          ${trip.days} days · ${trip.travelers} traveler${trip.travelers>1?'s':''} ·
          ${new Date(trip.savedAt || trip.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
        </div>
        <div class="trip-chips">
          <span class="trip-chip">${trip.budget}</span>
          ${trip.style ? `<span class="trip-chip">${trip.style}</span>` : ''}
        </div>
      </div>
    </div>`).join('');
}

function viewSavedTrip(id) {
  const trip = state.savedTrips.find(t => String(t.id) === String(id));
  if (!trip) return;
  state.currentTrip = trip;
  renderResults(trip);
}


/* ── 9. AUTH MODAL ────────────────────────────────────────────*/
function openAuthModal()  { document.getElementById('auth-modal').classList.add('show');    }
function closeAuthModal() { document.getElementById('auth-modal').classList.remove('show'); }

/** Called after Firebase confirms sign-in — updates all UI */
function onUserSignedIn(user) {
  state.isLoggedIn = true;
  state.user       = user;

  closeAuthModal();
  hideLoading();

  // Update the nav button to show user's name
  const authBtn = document.getElementById('auth-btn');
  authBtn.textContent = user.name || 'My Account';
  authBtn.onclick     = handleSignOut; // clicking it now signs out

  showToast(`Welcome, ${user.name?.split(' ')[0] || 'Traveler'}! ✓`, 'success');

  // Load their trips from Firestore
  loadFirestoreTrips();
}

/** Handle sign-out */
async function handleSignOut() {
  try {
    await firebaseSignOut(auth);
    state.isLoggedIn = false;
    state.user       = null;
    state.savedTrips = [];

    const authBtn   = document.getElementById('auth-btn');
    authBtn.textContent = 'Sign In';
    authBtn.onclick     = openAuthModal;

    renderSavedTrips();
    showToast('Signed out successfully');
  } catch (err) {
    console.error('Sign-out error:', err);
  }
}


/* ── 10. GOOGLE SIGN-IN ───────────────────────────────────────
   ✅ FIREBASE LIVE — real Google OAuth popup
──────────────────────────────────────────────────────────────*/

/** Wire up the Google sign-in button (called on DOMContentLoaded) */
function initGoogleSignInBtn() {
  document.getElementById('google-signin-btn').addEventListener('click', signInWithGoogle);
}

/** Opens the real Google sign-in popup via Firebase Auth */
async function signInWithGoogle() {
  showLoading('Opening Google sign-in…', 'A popup window will appear');
  try {
    const result = await signInWithPopup(auth, provider);
    onUserSignedIn({
      name : result.user.displayName,
      email: result.user.email,
      uid  : result.user.uid,
    });
  } catch (err) {
    hideLoading();
    // User closed the popup — don't show an error for that
    if (err.code !== 'auth/popup-closed-by-user') {
      showToast('Sign-in failed. Please try again.');
      console.error('Auth error:', err);
    }
  }
}


/* ── 11. GOOGLE PLACES ────────────────────────────────────────
   ★ STEP 5 — uncomment to fetch real hotel photos
──────────────────────────────────────────────────────────────*/
async function fetchPlacePhoto(hotelName, city) {
  // ★ STEP 5: Add Places API Key to pull real hotel photos dynamically
  const KEY = 'YOUR_GOOGLE_PLACES_API_KEY';
  const res  = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
    `?input=${encodeURIComponent(hotelName+' '+city)}&inputtype=textquery&fields=photos&key=${KEY}`
  );
  const data = await res.json();
  const ref  = data.candidates?.[0]?.photos?.[0]?.photo_reference;
  return ref
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${ref}&key=${KEY}`
    : null;
}


/* ── 12. UI UTILITIES ─────────────────────────────────────────*/
function showLoading(text = 'Loading…', sub = '') {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading-sub').textContent  = sub;
  document.getElementById('loading-overlay').classList.add('show');
}
function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('show');
}

function showToast(msg, type = '') {
  const toast       = document.getElementById('toast');
  toast.textContent = (type === 'success' ? '✓  ' : '') + msg;
  toast.className   = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function initScrollReveal() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function initHeroCardCycle() {
  const dests = [
    { code: 'PARIS', city: 'Paris, France'   },
    { code: 'TOKYO', city: 'Tokyo, Japan'    },
    { code: 'BALI',  city: 'Bali, Indonesia' },
    { code: 'ROME',  city: 'Rome, Italy'     },
    { code: 'DUBAI', city: 'Dubai, UAE'      },
  ];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % dests.length;
    const nameEl = document.getElementById('hero-dest-name');
    const cityEl = document.getElementById('hero-dest-city');
    if (!nameEl || !cityEl) return;
    nameEl.style.opacity = '0';
    setTimeout(() => {
      nameEl.textContent   = dests[i].code;
      cityEl.textContent   = dests[i].city;
      nameEl.style.opacity = '';
    }, 400);
  }, 3000);
}

function initNavTripLink() {
  document.getElementById('nav-trips-link')?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('my-trips').scrollIntoView({ behavior: 'smooth' });
  });
}

// Make these available to onclick handlers in HTML
window.adjustTravelers  = adjustTravelers;
window.selectBudget     = selectBudget;
window.generateTrip     = generateTrip;
window.toggleDay        = toggleDay;
window.clearResults     = clearResults;
window.saveTrip         = saveTrip;
window.viewSavedTrip    = viewSavedTrip;
window.openAuthModal    = openAuthModal;
window.closeAuthModal   = closeAuthModal;