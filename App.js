import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';

import TopHeader from './src/components/TopHeader';
import BottomNavBar from './src/components/BottomNavBar';

import AuthScreen from './src/screens/AuthScreen';
import DashboardTab from './src/screens/DashboardTab';
import QueueScreen from './src/screens/QueueScreen';
import InfantTrackerScreen from './src/screens/InfantTrackerScreen';
import AppointmentsTab from './src/screens/AppointmentTab';
import BookAppointmentScreen from './src/screens/BookAppointmentScreen';
import RegisterInfantScreen from './src/screens/RegisterInfantScreen';

import { supabase } from './supabase';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [consultNum, setConsultNum] = useState(14);
  const [vaccineNum, setVaccineNum] = useState(8);
  const [prenatalNum, setPrenatalNum] = useState(5);
  const [myToken] = useState('A-015');

  const [appointments, setAppointments] = useState([]);
  const [infants, setInfants] = useState([]);
  const [infantIndex, setInfantIndex] = useState(0);

  useEffect(() => {
    let apptChannel;

    async function initializeApp() {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const userMetaData = session.user.user_metadata || {};
            const userFullName = userMetaData.full_name || session.user.email?.split('@')[0] || 'User';
            const lowerName = userFullName.toLowerCase();
            const lowerEmail = (session.user.email || '').toLowerCase();

            // Francis gets Admin, Stephen/others get Resident/Patient
            const isFrancisAdmin = lowerName.includes('francis') || lowerEmail.includes('francis');
            const isExplicitAdmin = userMetaData.role === 'admin' || userMetaData.role === 'staff';
            const determinedRole = (isFrancisAdmin || isExplicitAdmin) ? 'admin' : 'patient';

            setName(userFullName);
            setRole(determinedRole);
            setScreen('main');
          } else {
            setScreen('login');
          }

          // Realtime Subscription for live sync across views
          apptChannel = supabase
            .channel('app_appointments_realtime')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'appointments' },
              () => {
                fetchAppointments();
              }
            )
            .subscribe();
        }

        await Promise.all([fetchAppointments(), fetchInfants()]);
      } catch (err) {
        console.log('App initialization error:', err);
      }
    }

    initializeApp();

    return () => {
      if (supabase && apptChannel) {
        supabase.removeChannel(apptChannel);
      }
    };
  }, []);

  // Logout Handler
  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.log('Logout error:', err);
    } finally {
      setName('');
      setRole('patient');
      setScreen('login');
      setActiveTab('dashboard');
    }
  };

  const fetchAppointments = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        const { data: fallbackData } = await supabase.from('appointments').select('*');
        if (fallbackData) setAppointments(fallbackData);
      } else if (data) {
        setAppointments([...data]);
      }
    } catch (e) {
      console.log('Appointments fetch error:', e);
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
          fullName: `${item.first_name || ''} ${item.middle_name ? item.middle_name[0] + '.' : ''} ${item.last_name || ''}`.trim(),
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

  // 1. Auth / Login Screen
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

  // 2. Sub-screens
  if (screen === 'book_appointment') {
    return (
      <BookAppointmentScreen
        supabase={supabase}
        role={role}
        name={name}
        infants={infants}
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

  const isAdminUser = role === 'admin' || role === 'staff';

  // 3. Main Tab Layout
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TopHeader role={role} setScreen={setScreen} onLogout={handleLogout} />

      <View style={styles.mainContent}>
        {activeTab === 'dashboard' && (
          <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 90 }}>
            <DashboardTab
              userName={name}
              userRole={role}
              role={role}
              isAdmin={isAdminUser}
              myToken={myToken}
              appointmentsCount={appointments.length}
              childrenCount={infants.length}
              consultNum={consultNum}
              vaccineNum={vaccineNum}
              prenatalNum={prenatalNum}
              onNavigate={(dest) => {
                if (dest === 'BookVisit') setScreen('book_appointment');
                else if (dest === 'NewChild') setScreen('register_infant');
                else if (dest === 'LiveQueue') setActiveTab('queue');
                else if (dest === 'Visits') setActiveTab('appointments');
              }}
              setScreen={setScreen}
              onLogout={handleLogout}
            />
          </ScrollView>
        )}

        {activeTab === 'queue' && (
          <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 90 }}>
            <QueueScreen
              role={role}
              userRole={role}
              isAdmin={isAdminUser}
              consultNum={consultNum}
              setConsultNum={setConsultNum}
              vaccineNum={vaccineNum}
              setVaccineNum={setVaccineNum}
              prenatalNum={prenatalNum}
              setPrenatalNum={setPrenatalNum}
              myToken={myToken}
            />
          </ScrollView>
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
          <View style={{ flex: 1 }}>
            <AppointmentsTab
              role={role}
              userRole={role}
              isAdmin={isAdminUser}
              appointments={appointments}
              onBookVisit={() => setScreen('book_appointment')}
              setScreen={setScreen}
            />
          </View>
        )}
      </View>

      <BottomNavBar
        role={role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setScreen={setScreen}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  mainContent: { flex: 1 },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
});