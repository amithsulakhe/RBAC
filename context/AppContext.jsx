'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { fetchHospitals, fetchNavigation } from '@/lib/api';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);
const HOSPITAL_STORAGE_KEY = 'selectedHospitalId';

export function AppProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [navigation, setNavigation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [navLoading, setNavLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setHospitals([]);
      setSelectedHospital(null);
      setNavigation([]);
      setLoading(false);
      return;
    }

    async function loadHospitals() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchHospitals();
        setHospitals(data);

        const savedId = localStorage.getItem(HOSPITAL_STORAGE_KEY);
        const savedHospital = data.find((h) => h._id === savedId);
        setSelectedHospital(savedHospital || data[0] || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadHospitals();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNavigation([]);
      return;
    }

    async function loadNavigation() {
      try {
        setNavLoading(true);
        const hospitalId = selectedHospital?._id || '';
        const data = await fetchNavigation(hospitalId);
        setNavigation(data);
        if (selectedHospital) {
          localStorage.setItem(HOSPITAL_STORAGE_KEY, selectedHospital._id);
        }
      } catch (err) {
        setError(err.message);
        setNavigation([]);
      } finally {
        setNavLoading(false);
      }
    }

    loadNavigation();
  }, [isAuthenticated, selectedHospital]);

  const selectHospital = (hospitalId) => {
    const hospital = hospitals.find((h) => h._id === hospitalId);
    if (hospital) setSelectedHospital(hospital);
  };

  const refreshNavigation = async () => {
    if (!isAuthenticated) return;
    const data = await fetchNavigation(selectedHospital?._id || '');
    setNavigation(data);
  };

  return (
    <AppContext.Provider
      value={{
        hospitals,
        selectedHospital,
        navigation,
        loading,
        navLoading,
        error,
        selectHospital,
        refreshNavigation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
