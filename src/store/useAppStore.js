import { create } from 'zustand';

const useAppStore = create((set) => ({
  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),

  currentRoute: null,
  setCurrentRoute: (route) => set({ currentRoute: route }),

  riskZones: [],
  setRiskZones: (zones) => set({ riskZones: zones }),
}));

export default useAppStore;
