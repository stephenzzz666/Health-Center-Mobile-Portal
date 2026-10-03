import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';

// --- DOH OFFICIAL EPI IMMUNIZATION SCHEDULE CONFIG & GENERATOR ---
const DOH_SCHEDULE_CONFIG = [
  { id: 'bcg', name: 'BCG', dose: 'Single Dose', site: 'Right Upper Arm', daysFromBirth: 0, targetAge: 'At Birth' },
  { id: 'hepb', name: 'Hepatitis B', dose: 'Birth Dose', site: 'Anterolateral Thigh', daysFromBirth: 0, targetAge: 'At Birth' },
  { id: 'penta1', name: 'Pentavalent (DPT-HepB-Hib)', dose: '1st Dose', site: 'Anterolateral Thigh', daysFromBirth: 42, targetAge: '1.5 Months' },
  { id: 'penta2', name: 'Pentavalent (DPT-HepB-Hib)', dose: '2nd Dose', site: 'Anterolateral Thigh', daysFromBirth: 70, targetAge: '2.5 Months' },
  { id: 'penta3', name: 'Pentavalent (DPT-HepB-Hib)', dose: '3rd Dose', site: 'Anterolateral Thigh', daysFromBirth: 98, targetAge: '3.5 Months' },
  { id: 'opv1', name: 'Oral Polio Vaccine (OPV)', dose: '1st Dose', site: 'Oral Drops', daysFromBirth: 42, targetAge: '1.5 Months' },
  { id: 'opv2', name: 'Oral Polio Vaccine (OPV)', dose: '2nd Dose', site: 'Oral Drops', daysFromBirth: 70, targetAge: '2.5 Months' },
  { id: 'opv3', name: 'Oral Polio Vaccine (OPV)', dose: '3rd Dose', site: 'Oral Drops', daysFromBirth: 98, targetAge: '3.5 Months' },
  { id: 'ipv', name: 'Inactivated Polio Vaccine (IPV)', dose: 'Single Dose', site: 'Anterolateral Thigh', daysFromBirth: 98, targetAge: '3.5 Months' },
  { id: 'pcv1', name: 'Pneumococcal Conjugate Vaccine (PCV)', dose: '1st Dose', site: 'Anterolateral Thigh', daysFromBirth: 42, targetAge: '1.5 Months' },
  { id: 'pcv2', name: 'Pneumococcal Conjugate Vaccine (PCV)', dose: '2nd Dose', site: 'Anterolateral Thigh', daysFromBirth: 70, targetAge: '2.5 Months' },
  { id: 'pcv3', name: 'Pneumococcal Conjugate Vaccine (PCV)', dose: '3rd Dose', site: 'Anterolateral Thigh', daysFromBirth: 98, targetAge: '3.5 Months' },
  { id: 'mmr1', name: 'Measles, Mumps, Rubella (MMR)', dose: '1st Dose', site: 'Subcutaneous Upper Arm', daysFromBirth: 270, targetAge: '9 Months' },
  { id: 'mmr2', name: 'Measles, Mumps, Rubella (MMR)', dose: '2nd Dose', site: 'Subcutaneous Upper Arm', daysFromBirth: 365, targetAge: '1 Year' },
];

function generateOfficialEPIVaccines(birthDateStr) {
  if (!birthDateStr) return [];
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return [];
  const now = new Date();

  return DOH_SCHEDULE_CONFIG.map((item) => {
    const dueDate = new Date(birth);
    dueDate.setDate(birth.getDate() + item.daysFromBirth);
    const dateFormatted = dueDate.toISOString().split('T')[0];
    const isPast = dueDate <= now;

    return {
      ...item,
      dueDate: dateFormatted,
      completed: isPast,
    };
  });
}

export default function App() {
  const [screen, setScreen] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('Stephen Cabrido');
  const [loading, setLoading] = useState(false);

  const [selectedChildModal, setSelectedChildModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date(2026, 9, 1));
  const [selectedDate, setSelectedDate] = useState('2026-10-12');
  const [slot, setSlot] = useState('09:00 AM - 10:00 AM');
  const [service, setService] = useState('General Consultation');
  const [patientNotes, setPatientNotes] = useState('');

  const [consultNum, setConsultNum] = useState(14);
  const [vaccineNum, setVaccineNum] = useState(8);
  const [prenatalNum, setPrenatalNum] = useState(5);
  const [myToken] = useState('A-015');

  const [appointments, setAppointments] = useState([]);
  const [infants, setInfants] = useState([]);
  const [infantIndex, setInfantIndex] = useState(0);

  const [babyForm, setBabyForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthDate: '',
    gender: 'Male',
    birthPlace: 'Brgy. Visayan Village Health Center',
    bloodType: 'A+',
    motherName: '',
    fatherName: '',
    contactNum: '09123456789',
  });

  useEffect(() => {
    async function loadData() {
      try {
        await Promise.all([fetchAppointments(), fetchInfants()]);
      } catch (err) {
        console.log('Data fetch error:', err);
      }
    }
    loadData();
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

  const handleRegisterInfant = async () => {
    if (!babyForm.firstName || !babyForm.lastName || !babyForm.birthDate || !babyForm.motherName) {
      Alert.alert('Missing Required Fields', 'Please complete First Name, Last Name, Birth Date, and Mother Name.');
      return;
    }

    setLoading(true);
    try {
      const chrNumber = `CHR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const { error } = await supabase.from('infants').insert([
        {
          chr_number: chrNumber,
          first_name: babyForm.firstName,
          middle_name: babyForm.middleName,
          last_name: babyForm.lastName,
          birth_date: babyForm.birthDate,
          gender: babyForm.gender,
          blood_type: babyForm.bloodType,
          mother_name: babyForm.motherName,
          father_name: babyForm.fatherName,
          contact_num: babyForm.contactNum,
        },
      ]);

      if (error) {
        Alert.alert('Database Error', error.message);
      } else {
        Alert.alert('Success', 'Child Health Record registered successfully!');
        await fetchInfants();
        setScreen('main');
        setActiveTab('children');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to register child record');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('appointments').insert([
        {
          user_name: name,
          service: service,
          date: selectedDate,
          slot: slot,
          status: 'Confirmed',
          notes: patientNotes,
        },
      ]);

      if (error) {
        Alert.alert('Booking Failed', error.message);
      } else {
        Alert.alert('Appointment Confirmed', `Booked for ${selectedDate} (${slot})`);
        await fetchAppointments();
        setScreen('main');
        setActiveTab('appointments');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const filteredChildren = infants.filter((child) => {
    return (
      child.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.chrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.motherName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const addedTodayCount = infants.filter((child) => child.created_at && child.created_at.startsWith(todayStr)).length;

  // --- REUSABLE PERSISTENT UI COMPONENTS ---
  const TopHeader = () => (
    <View style={styles.topHeader}>
      <View>
        <Text style={styles.headerPortalTitle}>BRGY. VISAYAN VILLAGE</Text>
        <Text style={styles.headerPortalSub}>Health Center Portal</Text>
      </View>
      <View style={styles.headerRightGroup}>
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>{role === 'admin' ? 'STAFF' : 'RESIDENT'}</Text>
        </View>
        <TouchableOpacity onPress={() => setScreen('login')} style={styles.logoutIconButton}>
          <Ionicons name="log-out-outline" size={20} color="#0f172a" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const BottomNavBar = () => (
    <View style={styles.bottomNavContainer}>
      <TouchableOpacity
        style={[styles.navItem, activeTab === 'dashboard' && styles.navItemActive]}
        onPress={() => { setScreen('main'); setActiveTab('dashboard'); }}
      >
        <Ionicons name="home-outline" size={22} color={activeTab === 'dashboard' ? '#16a34a' : '#64748b'} />
        <Text style={[styles.navLabel, activeTab === 'dashboard' && styles.navLabelActive]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === 'queue' && styles.navItemActive]}
        onPress={() => { setScreen('main'); setActiveTab('queue'); }}
      >
        <Ionicons name="list-outline" size={22} color={activeTab === 'queue' ? '#16a34a' : '#64748b'} />
        <Text style={[styles.navLabel, activeTab === 'queue' && styles.navLabelActive]}>Live Queue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === 'children' && styles.navItemActive]}
        onPress={() => { setScreen('main'); setActiveTab('children'); }}
      >
        <Ionicons name="person-outline" size={22} color={activeTab === 'children' ? '#16a34a' : '#64748b'} />
        <Text style={[styles.navLabel, activeTab === 'children' && styles.navLabelActive]}>Children</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === 'appointments' && styles.navItemActive]}
        onPress={() => { setScreen('main'); setActiveTab('appointments'); }}
      >
        <Ionicons name="calendar-outline" size={22} color={activeTab === 'appointments' ? '#16a34a' : '#64748b'} />
        <Text style={[styles.navLabel, activeTab === 'appointments' && styles.navLabelActive]}>Visits</Text>
      </TouchableOpacity>
    </View>
  );

  const InteractiveCalendar = () => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const changeMonth = (direction) => {
      setCurrentCalendarMonth(new Date(year, month + direction, 1));
    };

    const daysArray = [];
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      daysArray.push(d);
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.calNavBtn}>
            <Ionicons name="chevron-back-outline" size={16} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.calendarMonthTitle}>{monthNames[month]} {year}</Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.calNavBtn}>
            <Ionicons name="chevron-forward-outline" size={16} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarWeekRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <Text key={d} style={styles.calendarWeekHeader}>{d}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {daysArray.map((day, idx) => {
            if (!day) {
              return <View key={`empty-${idx}`} style={styles.calendarDayCellEmpty} />;
            }

            const formattedDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === formattedDayStr;

            return (
              <TouchableOpacity
                key={formattedDayStr}
                style={[styles.calendarDayCell, isSelected && styles.calendarDayCellSelected]}
                onPress={() => setSelectedDate(formattedDayStr)}
              >
                <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // --- 1. LOGIN SCREEN ---
  if (screen === 'login') {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loginCard}>
          <View style={styles.loginHeaderBox}>
            <Ionicons name="business-outline" size={42} color="#0f172a" style={{ marginBottom: 8 }} />
            <Text style={styles.loginTitle}>Barangay Visayan Village</Text>
            <Text style={styles.loginSubtitle}>Health Center Management Information System</Text>
          </View>

          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'patient' && styles.roleBtnActive]}
              onPress={() => setRole('patient')}
            >
              <Text style={[styles.roleText, role === 'patient' && styles.roleTextActive]}>Resident / Parent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'admin' && styles.roleBtnActive]}
              onPress={() => setRole('admin')}
            >
              <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>Staff / Admin</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Account User Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Full Name..."
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => { setScreen('main'); setActiveTab('dashboard'); }}
          >
            <Text style={styles.primaryButtonText}>Access Portal</Text>
          </TouchableOpacity>

          <View style={styles.loginFooter}>
            <Text style={styles.footerText}>Official DOH / Local Health Center Electronic System</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // --- 2. MAIN SCREEN WITH PERSISTENT NAVIGATION BARS ---
  if (screen === 'main') {
    const currentBaby = infants[infantIndex] || null;
    const currentVaccines = currentBaby ? generateOfficialEPIVaccines(currentBaby.birthDate) : [];

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <TopHeader />

        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 90 }}>
          {activeTab === 'dashboard' && (
            <View>
              <View style={styles.welcomeBanner}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.headerName}>{name}</Text>
                <Text style={styles.bannerRoleSub}>
                  {role === 'admin' ? 'Health Center Administrator & Staff Panel' : 'Barangay Resident Health Profile'}
                </Text>
              </View>

              {role === 'patient' ? (
                <View>
                  <View style={styles.tokenCard}>
                    <View style={styles.tokenBadgeHeader}>
                      <Text style={styles.tokenTitle}>Daily Queue Token</Text>
                      <Text style={styles.tokenStatusBadge}>Live Status</Text>
                    </View>
                    <Text style={styles.tokenNumber}>{myToken}</Text>
                    <Text style={styles.tokenSub}>Current Queue Serving: #012 | Est. Wait: ~15 mins</Text>
                  </View>

                  <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => setScreen('book_appointment')}>
                      <Ionicons name="calendar-outline" size={26} color="#0f172a" style={{ marginBottom: 6 }} />
                      <Text style={styles.actionTitle}>Book Visit</Text>
                      <Text style={styles.actionSub}>Schedule consultation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => setScreen('register_infant')}>
                      <Ionicons name="person-add-outline" size={26} color="#0f172a" style={{ marginBottom: 6 }} />
                      <Text style={styles.actionTitle}>+ New Child</Text>
                      <Text style={styles.actionSub}>Register newborn record</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.sectionTitle}>Overview Summary</Text>
                  <View style={styles.statGrid}>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{appointments.length}</Text>
                      <Text style={styles.statLabel}>My Appointments</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{infants.length}</Text>
                      <Text style={styles.statLabel}>Registered Children</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.statGrid}>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{appointments.length}</Text>
                      <Text style={styles.statLabel}>Total Scheduled Visits</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{infants.length}</Text>
                      <Text style={styles.statLabel}>Registered Children</Text>
                    </View>
                  </View>

                  <View style={styles.statGrid}>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{consultNum + vaccineNum + prenatalNum}</Text>
                      <Text style={styles.statLabel}>Today's Queue Count</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>100%</Text>
                      <Text style={styles.statLabel}>DOH EPI Sync Rate</Text>
                    </View>
                  </View>

                  <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => setScreen('register_infant')}>
                      <Ionicons name="person-add-outline" size={26} color="#0f172a" style={{ marginBottom: 6 }} />
                      <Text style={styles.actionTitle}>+ New Child</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => setScreen('book_appointment')}>
                      <Ionicons name="calendar-outline" size={26} color="#0f172a" style={{ marginBottom: 6 }} />
                      <Text style={styles.actionTitle}>Add Appointment</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {activeTab === 'queue' && (
            <View>
              <Text style={styles.sectionTitle}>Health Center Live Queue Control</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Daily Live Queue Counters</Text>
                <Text style={styles.cardDetail}>Real-time monitoring of active consultation priority tokens.</Text>

                <View style={styles.queueRow}>
                  <View style={styles.queueItem}>
                    <Text style={styles.queueLabel}>General Consultation</Text>
                    <Text style={styles.queueValue}>#{consultNum}</Text>
                    {role === 'admin' && (
                      <TouchableOpacity style={styles.smallBtn} onPress={() => setConsultNum((c) => c + 1)}>
                        <Text style={styles.smallBtnText}>Call Next Patient</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.queueItem}>
                    <Text style={styles.queueLabel}>Immunization / Vaccine</Text>
                    <Text style={styles.queueValue}>#{vaccineNum}</Text>
                    {role === 'admin' && (
                      <TouchableOpacity style={styles.smallBtn} onPress={() => setVaccineNum((v) => v + 1)}>
                        <Text style={styles.smallBtnText}>Call Next Patient</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.queueRow}>
                  <View style={styles.queueItem}>
                    <Text style={styles.queueLabel}>Prenatal & Maternal</Text>
                    <Text style={styles.queueValue}>#{prenatalNum}</Text>
                    {role === 'admin' && (
                      <TouchableOpacity style={styles.smallBtn} onPress={() => setPrenatalNum((p) => p + 1)}>
                        <Text style={styles.smallBtnText}>Call Next Patient</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'children' && (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.sectionTitle}>Child Health Registry</Text>
                <TouchableOpacity style={styles.smallBtn} onPress={() => setScreen('register_infant')}>
                  <Text style={styles.smallBtnText}>+ New Child</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Search by Name, CHR # or Mother..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {/* DYNAMIC INFANT STAT BADGES (REPLACES PUROK CHIPS) */}
              <View style={styles.counterRow}>
                <View style={styles.counterBadge}>
                  <Ionicons name="people-outline" size={16} color="#16a34a" />
                  <Text style={styles.counterBadgeText}>
                    Total Infants Added: <Text style={styles.counterBadgeBold}>{infants.length}</Text>
                  </Text>
                </View>
                <View style={[styles.counterBadge, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                  <Ionicons name="time-outline" size={16} color="#2563eb" />
                  <Text style={[styles.counterBadgeText, { color: '#1e40af' }]}>
                    Added Today: <Text style={styles.counterBadgeBold}>{addedTodayCount}</Text>
                  </Text>
                </View>
              </View>

              {role === 'patient' && infants.length > 0 && (
                <View style={styles.card}>
                  <View style={styles.childHeader}>
                    <View>
                      <Text style={styles.childName}>{currentBaby?.fullName}</Text>
                      <Text style={styles.chrSubText}>CHR Number: {currentBaby?.chrNumber}</Text>
                    </View>
                    {infants.length > 1 && (
                      <TouchableOpacity
                        style={styles.switchChildBtn}
                        onPress={() => setInfantIndex((prev) => (prev + 1) % infants.length)}
                      >
                        <Text style={styles.switchChildText}>Switch ({infantIndex + 1}/{infants.length})</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.subSectionTitle}>DOH Official EPI Vaccine Tracker</Text>
                  {currentVaccines.map((v) => (
                    <View key={v.id} style={styles.vaccineRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.vaccineName}>{v.name}</Text>
                        <Text style={styles.vaccineDoseDetail}>{v.dose} • {v.site}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={v.completed ? styles.statusDone : styles.statusPending}>
                          {v.completed ? 'Completed' : `Due: ${v.dueDate}`}
                        </Text>
                        <Text style={styles.targetAgeText}>{v.targetAge}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {filteredChildren.map((child, idx) => (
                <View key={child.id || idx} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.childName}>{child.fullName}</Text>
                    <Text style={styles.chrTag}>{child.chrNumber}</Text>
                  </View>
                  <Text style={styles.cardDetail}>DOB: {child.birthDate}</Text>
                  <Text style={styles.cardDetail}>Mother: {child.motherName} ({child.contactNum})</Text>
                  <TouchableOpacity
                    style={styles.viewDetailsBtn}
                    onPress={() => setSelectedChildModal(child)}
                  >
                    <Text style={styles.viewDetailsText}>View Complete CHR Profile</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'appointments' && (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.sectionTitle}>Scheduled Health Visits</Text>
                <TouchableOpacity style={styles.smallBtn} onPress={() => setScreen('book_appointment')}>
                  <Text style={styles.smallBtnText}>+ Book Visit</Text>
                </TouchableOpacity>
              </View>

              {appointments.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No upcoming appointments recorded.</Text>
                </View>
              ) : (
                appointments.map((item, idx) => (
                  <View key={item.id || idx} style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.cardTitle}>{item.service}</Text>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.status || 'Confirmed'}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardDetail}>Resident Name: {item.user_name}</Text>
                    <Text style={styles.cardDetail}>Scheduled Date: {item.date}</Text>
                    <Text style={styles.cardDetail}>Time Slot: {item.slot}</Text>
                    {item.notes ? <Text style={styles.cardSubDetail}>Notes: {item.notes}</Text> : null}
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>

        <BottomNavBar />

        {selectedChildModal && (
          <Modal visible={!!selectedChildModal} transparent={true} animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedChildModal.fullName}</Text>
                <Text style={styles.modalSubtitle}>CHR #: {selectedChildModal.chrNumber}</Text>

                <ScrollView style={{ maxHeight: 350, marginVertical: 12 }}>
                  <Text style={styles.modalSectionHeader}>Child Metrics</Text>
                  <Text style={styles.modalText}>Date of Birth: {selectedChildModal.birthDate}</Text>
                  <Text style={styles.modalText}>Blood Type: {selectedChildModal.bloodType}</Text>

                  <Text style={styles.modalSectionHeader}>Parent Details</Text>
                  <Text style={styles.modalText}>Mother Name: {selectedChildModal.motherName}</Text>
                  <Text style={styles.modalText}>Father Name: {selectedChildModal.fatherName}</Text>
                  <Text style={styles.modalText}>Contact: {selectedChildModal.contactNum}</Text>
                </ScrollView>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setSelectedChildModal(null)}
                >
                  <Text style={styles.primaryButtonText}>Close Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    );
  }

  // --- 3. BOOK APPOINTMENT SCREEN ---
  if (screen === 'book_appointment') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <TopHeader />

        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 90 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('main')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="arrow-back-outline" size={18} color="#16a34a" />
              <Text style={styles.backText}> Back to Portal Overview</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Book Health Visit Appointment</Text>

          <Text style={styles.label}>1. Select Service Category</Text>
          <View style={styles.pickerContainer}>
            {['General Consultation', 'Infant Immunization', 'Maternal Checkup', 'Dental Care'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.choiceBtn, service === s && styles.choiceBtnActive]}
                onPress={() => setService(s)}
              >
                <Text style={[styles.choiceText, service === s && styles.choiceTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>2. Pick Appointment Date</Text>
          <InteractiveCalendar />

          <View style={styles.selectedDateBadgeBox}>
            <Text style={styles.selectedDateBadgeText}>Selected Date: {selectedDate}</Text>
          </View>

          <Text style={styles.label}>3. Preferred Time Slot</Text>
          <View style={styles.pickerContainer}>
            {['08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.choiceBtn, slot === t && styles.choiceBtnActive]}
                onPress={() => setSlot(t)}
              >
                <Text style={[styles.choiceText, slot === t && styles.choiceTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>4. Additional Clinical Notes (Optional)</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Describe any symptoms, concerns, or special requests..."
            placeholderTextColor="#94a3b8"
            multiline={true}
            value={patientNotes}
            onChangeText={setPatientNotes}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleBookAppointment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Confirm & Reserve Appointment</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- 4. REGISTER INFANT SCREEN ---
  if (screen === 'register_infant') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <TopHeader />

        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 90 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('main')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="arrow-back-outline" size={18} color="#16a34a" />
              <Text style={styles.backText}> Back to Child Registry</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Newborn / Infant Registration</Text>

          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter child's first name"
            value={babyForm.firstName}
            onChangeText={(txt) => setBabyForm({ ...babyForm, firstName: txt })}
          />

          <Text style={styles.label}>Middle Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter child's middle name"
            value={babyForm.middleName}
            onChangeText={(txt) => setBabyForm({ ...babyForm, middleName: txt })}
          />

          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter child's last name"
            value={babyForm.lastName}
            onChangeText={(txt) => setBabyForm({ ...babyForm, lastName: txt })}
          />

          <Text style={styles.label}>Date of Birth (YYYY-MM-DD) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2026-05-15"
            value={babyForm.birthDate}
            onChangeText={(txt) => setBabyForm({ ...babyForm, birthDate: txt })}
          />

          <Text style={styles.label}>Mother's Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mother's name"
            value={babyForm.motherName}
            onChangeText={(txt) => setBabyForm({ ...babyForm, motherName: txt })}
          />

          <Text style={styles.label}>Father's Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter father's name"
            value={babyForm.fatherName}
            onChangeText={(txt) => setBabyForm({ ...babyForm, fatherName: txt })}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRegisterInfant}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Save Child Health Record</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  // Header styles
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerPortalTitle: { fontSize: 13, fontWeight: '800', color: '#16a34a', letterSpacing: 0.5 },
  headerPortalSub: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  userBadgeText: { fontSize: 10, fontWeight: '700', color: '#15803d' },
  logoutIconButton: { padding: 4 },

  // Bottom Nav
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navItemActive: { borderTopWidth: 2, borderTopColor: '#16a34a' },
  navLabel: { fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '500' },
  navLabelActive: { color: '#16a34a', fontWeight: '700' },

  // Login Screen
  loginContainer: { flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', padding: 20 },
  loginCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, elevation: 4 },
  loginHeaderBox: { alignItems: 'center', marginBottom: 20 },
  loginTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  loginSubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4 },
  roleContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 8, padding: 4, marginBottom: 16 },
  roleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  roleBtnActive: { backgroundColor: '#ffffff', elevation: 1 },
  roleText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  roleTextActive: { color: '#16a34a', fontWeight: '700' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 14, color: '#0f172a' },
  primaryButton: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  loginFooter: { marginTop: 20, alignItems: 'center' },
  footerText: { fontSize: 11, color: '#94a3b8' },

  // Banner & Token
  welcomeBanner: { marginBottom: 16 },
  welcomeText: { fontSize: 14, color: '#64748b' },
  headerName: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  bannerRoleSub: { fontSize: 12, color: '#16a34a', fontWeight: '600', marginTop: 2 },
  tokenCard: { backgroundColor: '#0f172a', borderRadius: 12, padding: 16, marginBottom: 16 },
  tokenBadgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tokenTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  tokenStatusBadge: { backgroundColor: '#16a34a', color: '#ffffff', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tokenNumber: { color: '#ffffff', fontSize: 32, fontWeight: '800', marginVertical: 4 },
  tokenSub: { color: '#cbd5e1', fontSize: 11 },

  // Cards & Grids
  actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionCard: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, alignItems: 'center' },
  actionTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  actionSub: { fontSize: 10, color: '#64748b', textAlign: 'center', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  subSectionTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginTop: 12, marginBottom: 8 },
  statGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12 },
  statNumber: { fontSize: 20, fontWeight: '800', color: '#16a34a' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  cardDetail: { fontSize: 12, color: '#475569', marginTop: 2 },
  cardSubDetail: { fontSize: 11, color: '#64748b', fontStyle: 'italic', marginTop: 4 },
  badge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { fontSize: 10, color: '#15803d', fontWeight: '700' },
  emptyCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  emptyText: { color: '#94a3b8', fontSize: 13 },

  // Queue
  queueRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  queueItem: { flex: 1, backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  queueLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  queueValue: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginVertical: 4 },
  smallBtn: { backgroundColor: '#16a34a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start' },
  smallBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },

  // Dynamic Counter Badges
  counterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  counterBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  counterBadgeText: { fontSize: 12, color: '#166534', fontWeight: '500' },
  counterBadgeBold: { fontWeight: '800' },

  // Children & Vaccines
  childHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  childName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  chrSubText: { fontSize: 11, color: '#64748b' },
  chrTag: { fontSize: 11, fontWeight: '700', color: '#16a34a', backgroundColor: '#f0fdf4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  switchChildBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  switchChildText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  vaccineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  vaccineName: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
  vaccineDoseDetail: { fontSize: 10, color: '#64748b' },
  statusDone: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  statusPending: { fontSize: 11, fontWeight: '700', color: '#eab308' },
  targetAgeText: { fontSize: 10, color: '#94a3b8' },
  viewDetailsBtn: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', alignItems: 'center' },
  viewDetailsText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  modalSubtitle: { fontSize: 12, color: '#16a34a', fontWeight: '700', marginBottom: 12 },
  modalSectionHeader: { fontSize: 12, fontWeight: '800', color: '#64748b', marginTop: 8, marginBottom: 4, textTransform: 'uppercase' },
  modalText: { fontSize: 13, color: '#334155', marginBottom: 2 },

  // Forms & Picker
  backBtn: { marginBottom: 12 },
  backText: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 6 },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  choiceBtn: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#ffffff' },
  choiceBtnActive: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  choiceText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  choiceTextActive: { color: '#16a34a', fontWeight: '700' },

  // Calendar
  calendarContainer: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, marginBottom: 12 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calendarMonthTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  calNavBtn: { padding: 4, backgroundColor: '#f1f5f9', borderRadius: 4 },
  calendarWeekRow: { flexDirection: 'row', marginBottom: 6 },
  calendarWeekHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#94a3b8' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDayCellEmpty: { width: '14.28%', height: 36 },
  calendarDayCell: { width: '14.28%', height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
  calendarDayCellSelected: { backgroundColor: '#16a34a' },
  calendarDayText: { fontSize: 12, color: '#0f172a', fontWeight: '500' },
  calendarDayTextSelected: { color: '#ffffff', fontWeight: '700' },
  selectedDateBadgeBox: { backgroundColor: '#f0fdf4', borderLeftWidth: 3, borderLeftColor: '#16a34a', padding: 10, borderRadius: 4, marginBottom: 12 },
  selectedDateBadgeText: { color: '#15803d', fontWeight: '700', fontSize: 12 },
});