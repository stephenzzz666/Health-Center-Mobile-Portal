import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet } from 'react-native';

import TopHeader from './src/components/TopHeader';
import BottomNavBar from './src/components/BottomNavBar';

import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import DashboardTab from './src/screens/DashboardTab';
import QueueScreen from './src/screens/QueueScreen';
import InfantTrackerScreen from './src/screens/InfantTrackerScreen';
import AppointmentsTab from './src/screens/AppointmentTab';
import BookAppointmentScreen from './src/screens/BookAppointmentScreen';
import RegisterInfantScreen from './src/screens/RegisterInfantScreen';

import { supabase } from './supabase';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [screen, setScreen] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('Stephen Cabrido');

  const [searchQuery, setSearchQuery] = useState('');
  const [consultNum, setConsultNum] = useState(14);
  const [vaccineNum, setVaccineNum] = useState(8);
  const [prenatalNum, setPrenatalNum] = useState(5);
  const [myToken] = useState('A-015');

  const [appointments, setAppointments] = useState([]);
  const [infants, setInfants] = useState([]);
  const [infantIndex, setInfantIndex] = useState(0);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Check existing Supabase user session
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const userMetaData = session.user.user_metadata || {};
            setName(userMetaData.full_name || session.user.email.split('@')[0]);
            setRole(userMetaData.role || 'patient');
            setScreen('main');
          } else {
            setScreen('login');
          }
        }

        // Fetch data in parallel
        await Promise.all([fetchAppointments(), fetchInfants()]);
      } catch (err) {
        console.log('App initialization error:', err);
      } finally {
        // Show splash screen for exactly 1 second (1000 ms) before opening login/main page
        setTimeout(() => {
          setIsInitializing(false);
        }, 1000);
      }
    }

    initializeApp();

    // Listen for Auth State Changes (Logout, Session Expiry, etc.)
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          setScreen('login');
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  const fetchAppointments = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
      if (error) console.log('Appointments fetch error:', error.message);
      else if (data) setAppointments(data);
    } catch (e) {
      console.log('Appointments catch error:', e);
    }
  };

  const fetchInfants = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase.from('infants').select('*').order('created_at', { ascending: false });
      if (error) console.log('Infants fetch error:', error.message);
      else if (data) {
        const formattedInfants = data.map((item) => ({
          ...item,
          fullName: `${item.first_name} ${item.middle_name ? item.middle_name[0] + '.' : ''} ${item.last_name}`,
          chrNumber: item.chr_number || `CHR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          birthDate: item.birth_date,
          motherName: item.mother_name,
          fatherName: item.father_name || 'N/A',
          contactNum: item.contact_num || 'N/A',
          bloodType: item.blood_type || 'A+',
          created_at: item.created_at,
        }));
        setInfants(formattedInfants);
      }
    } catch (e) {
      console.log('Infants catch error:', e);
    }
  };

  // 1. Show Branded Splash Screen for 1 Second
  if (isInitializing) {
    return <SplashScreen />;
  }

  // 2. Auth / Login Screen
  if (screen === 'login') {
    return (
      <AuthScreen
        name={name}
        setName={setName}
        role={role}
        setRole={setRole}
        setScreen={setScreen}
        setActiveTab={setActiveTab}
      />
    );
  }

  // 3. Sub-screens
  if (screen === 'book_appointment') {
    return (
      <BookAppointmentScreen
        role={role}
        name={name}
        setScreen={setScreen}
        fetchAppointments={fetchAppointments}
      />
    );
  }

  if (screen === 'register_infant') {
    return (
      <RegisterInfantScreen
        role={role}
        setScreen={setScreen}
        fetchInfants={fetchInfants}
      />
    );
  }

  // 4. Main Tab Layout
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TopHeader role={role} setScreen={setScreen} />

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 90 }}>
        {activeTab === 'dashboard' && (
          <DashboardTab
            name={name}
            role={role}
            myToken={myToken}
            appointments={appointments}
            infants={infants}
            consultNum={consultNum}
            vaccineNum={vaccineNum}
            prenatalNum={prenatalNum}
            setScreen={setScreen}
          />
        )}

        {activeTab === 'queue' && (
          <QueueScreen
            role={role}
            consultNum={consultNum}
            setConsultNum={setConsultNum}
            vaccineNum={vaccineNum}
            setVaccineNum={setVaccineNum}
            prenatalNum={prenatalNum}
            setPrenatalNum={setPrenatalNum}
          />
        )}

        {activeTab === 'children' && (
          <InfantTrackerScreen
            role={role}
            infants={infants}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            infantIndex={infantIndex}
            setInfantIndex={setInfantIndex}
            setScreen={setScreen}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsTab
            appointments={appointments}
            setScreen={setScreen}
          />
        )}
      </ScrollView>

      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setScreen={setScreen}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
});