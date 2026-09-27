import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { generateDOHVaccines } from './src/utils/dohSchedule';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('Stephen Cabrido');

  const [date, setDate] = useState('2026-09-28');
  const [slot, setSlot] = useState('09:00 AM - 10:00 AM');
  const [service, setService] = useState('General Consultation');
  const [appointments, setAppointments] = useState([
    { id: '1', date: '2026-09-28', slot: '09:00 AM - 10:00 AM', service: 'General Consultation', token: 'A-015', status: 'Confirmed' }
  ]);

  const [consultNum, setConsultNum] = useState(12);
  const [vaccineNum, setVaccineNum] = useState(5);
  const [myToken] = useState('A-015');

  const [infants, setInfants] = useState([]);
  const [babyName, setBabyName] = useState('');
  const [babyDOB, setBabyDOB] = useState('');
  const [infantIndex, setInfantIndex] = useState(0);

  const login = (userRole) => {
    setRole(userRole);
    setScreen(userRole === 'staff' ? 'staff' : 'dashboard');
  };

  const bookAppointment = () => {
    const token = `A-0${appointments.length + 16}`;
    const item = {
      id: String(Date.now()),
      date,
      slot,
      service,
      token,
      status: 'Confirmed'
    };
    setAppointments([...appointments, item]);
    Alert.alert('Booking Success', `Your appointment has been scheduled!\nQueue Token: ${token}`);
    setScreen('dashboard');
  };

  const cancelAppointment = (id) => {
    setAppointments(appointments.filter(item => item.id !== id));
    Alert.alert('Cancelled', 'Appointment removed successfully.');
  };

  const addBaby = () => {
    if (!babyName || !babyDOB) {
      Alert.alert('Incomplete Details', 'Please provide both Baby Name and Birth Date (YYYY-MM-DD)');
      return;
    }
    const baby = { id: String(Date.now()), name: babyName, birthDate: babyDOB };
    const list = [...infants, baby];
    setInfants(list);
    setInfantIndex(list.length - 1);
    setBabyName('');
    setBabyDOB('');
    Alert.alert('Registration Successful', 'Infant added and immunization schedule generated.');
  };

  const deleteBaby = (id) => {
    const list = infants.filter(item => item.id !== id);
    setInfants(list);
    if (infantIndex >= list.length) {
      setInfantIndex(Math.max(0, list.length - 1));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={styles.appHeader}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>BH</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Brgy. Visayan Village</Text>
            <Text style={styles.headerSub}>Health Center Mobile Portal</Text>
          </View>
        </View>
        {screen !== 'login' && (
          <TouchableOpacity style={styles.logoutBtn} onPress={() => setScreen('login')}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>

      {screen === 'login' && (
        <ScrollView contentContainerStyle={styles.authContainer}>
          <View style={styles.authCard}>
            <View style={styles.authHeaderIcon}>
              <Text style={styles.authIconText}>🏥</Text>
            </View>
            <Text style={styles.authTitle}>Welcome Back</Text>
            <Text style={styles.authSub}>Sign in to access barangay health services</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Stephen Cabrido" 
                placeholderTextColor="#94a3b8"
                value={name} 
                onChangeText={setName} 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Barangay ID / Phone Number</Text>
              <TextInput 
                style={styles.input} 
                placeholder="09123456789" 
                placeholderTextColor="#94a3b8"
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => login('patient')}>
              <Text style={styles.btnText}>Login as Resident / Parent</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.primaryBtn, styles.staffBtn]} onPress={() => login('staff')}>
              <Text style={styles.btnText}>Login as Healthcare Staff</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {screen === 'dashboard' && (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeBanner}>
            <View>
              <Text style={styles.welcomeGreeting}>Hello,</Text>
              <Text style={styles.welcomeName}>{name}</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{name ? name[0] : 'U'}</Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Quick Access Services</Text>
          <View style={styles.dashGrid}>
            <TouchableOpacity style={styles.dashCard} onPress={() => setScreen('queue')}>
              <View style={[styles.cardIconBox, { backgroundColor: '#e0f2fe' }]}>
                <Text style={styles.cardIcon}>🎟️</Text>
              </View>
              <Text style={styles.dashCardTitle}>Live Queue</Text>
              <Text style={styles.dashCardSub}>Now Serving: A-012</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dashCard} onPress={() => setScreen('booking')}>
              <View style={[styles.cardIconBox, { backgroundColor: '#dcfce7' }]}>
                <Text style={styles.cardIcon}>📅</Text>
              </View>
              <Text style={styles.dashCardTitle}>Book Appointment</Text>
              <Text style={styles.dashCardSub}>Daily slots available</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.dashCard, styles.fullWidthCard]} onPress={() => setScreen('infant')}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconBox, { backgroundColor: '#fae8ff' }]}>
                  <Text style={styles.cardIcon}>👶</Text>
                </View>
                <View style={styles.pillBadge}>
                  <Text style={styles.pillBadgeText}>DOH Standard</Text>
                </View>
              </View>
              <Text style={styles.dashCardTitle}>Infant Immunization Tracker</Text>
              <Text style={styles.dashCardSub}>Automatic schedule calculator & milestone tracking</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Active Appointments</Text>
            <Text style={styles.countBadge}>{appointments.length}</Text>
          </View>

          {appointments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardTitle}>No Booked Appointments</Text>
              <Text style={styles.emptyText}>You currently have no active health center appointments.</Text>
            </View>
          ) : (
            appointments.map((item) => (
              <View key={item.id} style={styles.apptCard}>
                <View style={styles.apptHeaderLine}>
                  <Text style={styles.apptService}>{item.service}</Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{item.status}</Text>
                  </View>
                </View>
                
                <Text style={styles.apptDate}>📅 {item.date} | ⏰ {item.slot}</Text>

                <View style={styles.apptFooterLine}>
                  <View style={styles.tokenContainer}>
                    <Text style={styles.tokenLabel}>Queue Token:</Text>
                    <Text style={styles.tokenValue}>{item.token}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.cancelApptBtn} 
                    onPress={() => cancelAppointment(item.id)}
                  >
                    <Text style={styles.cancelApptText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {screen === 'booking' && (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenHeader}>Book Consultation Slot</Text>

          <Text style={styles.label}>1. Select Health Service</Text>
          <View style={styles.chipRow}>
            {['General Consultation', 'Infant Vaccination', 'Dental Checkup'].map((item) => (
              <TouchableOpacity 
                key={item} 
                style={[styles.chip, service === item && styles.chipActive]}
                onPress={() => setService(item)}
              >
                <Text style={service === item ? styles.chipTextActive : styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>2. Available Schedule Dates</Text>
          <View style={styles.dateRow}>
            {[
              { dateStr: '2026-09-28', slots: 12 },
              { dateStr: '2026-09-29', slots: 4 },
              { dateStr: '2026-09-30', slots: 0 },
            ].map((d) => (
              <TouchableOpacity
                key={d.dateStr}
                disabled={d.slots === 0}
                style={[
                  styles.dateBox,
                  date === d.dateStr && styles.dateBoxActive,
                  d.slots === 0 && styles.dateBoxDisabled
                ]}
                onPress={() => setDate(d.dateStr)}
              >
                <Text style={date === d.dateStr ? styles.dateTextActive : styles.dateText}>{d.dateStr}</Text>
                <Text style={[styles.slotCountText, d.slots === 0 && { color: '#ef4444' }]}>
                  {d.slots === 0 ? 'FULL' : `${d.slots} left`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>3. Preferred Time Slot</Text>
          {['08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM', '01:00 PM - 02:00 PM'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.slotRow, slot === item && styles.slotRowActive]}
              onPress={() => setSlot(item)}
            >
              <Text style={slot === item ? styles.slotTextActive : styles.slotText}>⏰ {item}</Text>
              {slot === item && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 20 }]} onPress={bookAppointment}>
            <Text style={styles.btnText}>Confirm & Generate Ticket</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {screen === 'queue' && (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenHeader}>Live Monitor Counter</Text>

          <View style={styles.queueDisplayCard}>
            <Text style={styles.queueCardLabel}>GENERAL CONSULTATION</Text>
            <Text style={styles.queueBigNumber}>A-{String(consultNum).padStart(3, '0')}</Text>
            <View style={styles.livePulsePill}>
              <View style={styles.greenDot} />
              <Text style={styles.livePulseText}>Counter 1 Active</Text>
            </View>
          </View>

          <View style={[styles.queueDisplayCard, { borderTopColor: '#f97316' }]}>
            <Text style={styles.queueCardLabel}>IMMUNIZATION COUNTER</Text>
            <Text style={[styles.queueBigNumber, { color: '#ea580c' }]}>B-{String(vaccineNum).padStart(3, '0')}</Text>
            <View style={[styles.livePulsePill, { backgroundColor: '#ffedd5' }]}>
              <View style={[styles.greenDot, { backgroundColor: '#f97316' }]} />
              <Text style={[styles.livePulseText, { color: '#c2410c' }]}>Counter 2 Active</Text>
            </View>
          </View>

          <View style={styles.myTicketCard}>
            <View style={styles.myTicketTop}>
              <Text style={styles.myTicketLabel}>YOUR ASSIGNED TICKET</Text>
              <Text style={styles.myTicketNum}>{myToken}</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.myTicketStatus}>
              {consultNum === 15 ? '🟢 Please proceed to Counter 1 now!' : '⏳ 3 Patients Ahead of You'}
            </Text>
          </View>
        </ScrollView>
      )}

      {screen === 'infant' && (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenHeader}>Infant Immunization Tracker</Text>

          <View style={styles.addBabyCard}>
            <Text style={styles.cardSubTitle}>Register New Infant</Text>
            <TextInput 
              style={styles.inputSmall} 
              placeholder="Baby Full Name" 
              placeholderTextColor="#94a3b8"
              value={babyName} 
              onChangeText={setBabyName} 
            />
            <TextInput 
              style={styles.inputSmall} 
              placeholder="Birth Date (YYYY-MM-DD)" 
              placeholderTextColor="#94a3b8"
              value={babyDOB} 
              onChangeText={setBabyDOB} 
            />
            <TouchableOpacity style={styles.smallAddBtn} onPress={addBaby}>
              <Text style={styles.btnText}>Calculate Vaccine Schedule</Text>
            </TouchableOpacity>
          </View>

          {infants.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardTitle}>No Infants Registered</Text>
              <Text style={styles.emptyText}>Register an infant above to compute their DOH recommended vaccine timeline.</Text>
            </View>
          ) : (
            <View style={{ marginBottom: 30 }}>
              <Text style={styles.label}>Select Registered Infant:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                {infants.map((baby, idx) => (
                  <View key={baby.id} style={[styles.babyChipContainer, infantIndex === idx && styles.babyChipActive]}>
                    <TouchableOpacity onPress={() => setInfantIndex(idx)}>
                      <Text style={infantIndex === idx ? styles.babyChipTextActive : styles.babyChipText}>
                        👶 {baby.name}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteBaby(baby.id)} style={styles.deleteChipBtn}>
                      <Text style={styles.deleteChipText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              {infants[infantIndex] && (
                <View>
                  <View style={styles.infantHeaderCard}>
                    <Text style={styles.infantHeaderTitle}>Vaccine Schedule</Text>
                    <Text style={styles.infantHeaderName}>{infants[infantIndex].name}</Text>
                    <Text style={styles.infantHeaderDob}>Date of Birth: {infants[infantIndex].birthDate}</Text>
                  </View>

                  {generateDOHVaccines(infants[infantIndex].birthDate).map((vac) => (
                    <View key={vac.id} style={styles.vacRow}>
                      <View style={styles.vacInfo}>
                        <Text style={styles.vacName}>{vac.name}</Text>
                        <Text style={styles.vacAge}>Target Age: {vac.targetAge}</Text>
                        <Text style={styles.vacDue}>Due Date: {vac.dueDate}</Text>
                      </View>
                      <View style={[styles.statusBadge, vac.completed ? styles.statusDone : styles.statusPending]}>
                        <Text style={vac.completed ? styles.statusTextDone : styles.statusTextPending}>
                          {vac.completed ? 'Completed' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {screen === 'staff' && (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenHeader}>Healthcare Staff Portal</Text>

          <View style={styles.staffControlBox}>
            <Text style={styles.staffBoxTitle}>General Consultation Counter</Text>
            <Text style={styles.staffCounterNum}>A-{String(consultNum).padStart(3, '0')}</Text>
            
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setConsultNum(prev => prev + 1)}>
              <Text style={styles.btnText}>Call Next Patient (+1)</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.staffControlBox, { borderTopColor: '#f97316' }]}>
            <Text style={styles.staffBoxTitle}>Infant Immunization Counter</Text>
            <Text style={[styles.staffCounterNum, { color: '#ea580c' }]}>B-{String(vaccineNum).padStart(3, '0')}</Text>

            <TouchableOpacity style={[styles.primaryBtn, styles.staffVaccineBtn]} onPress={() => setVaccineNum(prev => prev + 1)}>
              <Text style={styles.btnText}>Call Next Infant (+1)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {screen !== 'login' && role === 'patient' && (
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => setScreen('dashboard')} style={styles.navItem}>
            <Text style={[styles.navIcon, screen === 'dashboard' && styles.navIconActive]}>🏠</Text>
            <Text style={[styles.navText, screen === 'dashboard' && styles.navTextActive]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('booking')} style={styles.navItem}>
            <Text style={[styles.navIcon, screen === 'booking' && styles.navIconActive]}>📅</Text>
            <Text style={[styles.navText, screen === 'booking' && styles.navTextActive]}>Book</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('queue')} style={styles.navItem}>
            <Text style={[styles.navIcon, screen === 'queue' && styles.navIconActive]}>🎟️</Text>
            <Text style={[styles.navText, screen === 'queue' && styles.navTextActive]}>Queue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('infant')} style={styles.navItem}>
            <Text style={[styles.navIcon, screen === 'infant' && styles.navIconActive]}>👶</Text>
            <Text style={[styles.navText, screen === 'infant' && styles.navTextActive]}>Infant</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  appHeader: { 
    backgroundColor: '#0f172a', 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBadge: { backgroundColor: '#2563eb', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  logoBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerSub: { color: '#94a3b8', fontSize: 11 },
  logoutBtn: { backgroundColor: '#ef4444', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  logoutText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  body: { flex: 1, padding: 18 },
  authContainer: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f1f5f9' },
  authCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, elevation: 3 },
  authHeaderIcon: { alignSelf: 'center', backgroundColor: '#e0f2fe', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  authIconText: { fontSize: 28 },
  authTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', textAlign: 'center' },
  authSub: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 10, fontSize: 14, color: '#0f172a' },
  inputSmall: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 10, color: '#0f172a' },
  primaryBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  staffBtn: { backgroundColor: '#059669' },
  staffVaccineBtn: { backgroundColor: '#ea580c' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  welcomeBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcomeGreeting: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  welcomeName: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  avatarCircle: { backgroundColor: '#2563eb', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 15, marginBottom: 12 },
  countBadge: { backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontSize: 12, fontWeight: 'bold', color: '#475569' },
  dashGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dashCard: { backgroundColor: '#fff', width: '48%', padding: 16, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: '#f1f5f9', elevation: 2 },
  fullWidthCard: { width: '100%' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardIcon: { fontSize: 20 },
  pillBadge: { backgroundColor: '#f3e8ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  pillBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#7e22ce' },
  dashCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  dashCardSub: { fontSize: 12, color: '#64748b', marginTop: 4 },
  emptyCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 15 },
  emptyCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 4 },
  emptyText: { fontSize: 12, color: '#94a3b8', textAlign: 'center' },
  apptCard: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1 },
  apptHeaderLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  apptService: { fontSize: 14, fontWeight: 'bold', color: '#2563eb' },
  statusPill: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusPillText: { fontSize: 11, fontWeight: 'bold', color: '#166534' },
  apptDate: { fontSize: 12, color: '#475569', marginVertical: 8 },
  apptFooterLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  tokenContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tokenLabel: { fontSize: 12, color: '#64748b' },
  tokenValue: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  cancelApptBtn: { backgroundColor: '#fee2e2', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  cancelApptText: { color: '#991b1b', fontSize: 12, fontWeight: 'bold' },
  screenHeader: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#334155', marginTop: 14, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#e2e8f0', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20 },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { fontSize: 12, color: '#475569' },
  chipTextActive: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateBox: { backgroundColor: '#fff', borderColor: '#cbd5e1', borderWidth: 1, padding: 12, borderRadius: 12, alignItems: 'center', flex: 1 },
  dateBoxActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff', borderWidth: 2 },
  dateBoxDisabled: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  dateText: { fontSize: 12, fontWeight: 'bold', color: '#334155' },
  dateTextActive: { fontSize: 12, fontWeight: 'bold', color: '#2563eb' },
  slotCountText: { fontSize: 10, color: '#16a34a', marginTop: 4, fontWeight: 'bold' },
  slotRow: { backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slotRowActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  slotText: { fontSize: 13, color: '#334155' },
  slotTextActive: { fontSize: 13, color: '#2563eb', fontWeight: 'bold' },
  checkmark: { fontSize: 14, fontWeight: 'bold', color: '#2563eb' },
  queueDisplayCard: { backgroundColor: '#fff', padding: 22, borderRadius: 16, alignItems: 'center', marginBottom: 16, elevation: 2, borderTopWidth: 5, borderTopColor: '#2563eb' },
  queueCardLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b', letterSpacing: 0.5 },
  queueBigNumber: { fontSize: 44, fontWeight: 'bold', color: '#2563eb', marginVertical: 6 },
  livePulsePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  livePulseText: { fontSize: 11, fontWeight: 'bold', color: '#15803d' },
  myTicketCard: { backgroundColor: '#fef3c7', padding: 18, borderRadius: 16, borderLeftWidth: 6, borderLeftColor: '#d97706', marginTop: 10 },
  myTicketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  myTicketLabel: { fontSize: 11, fontWeight: 'bold', color: '#92400e' },
  myTicketNum: { fontSize: 24, fontWeight: 'bold', color: '#78350f' },
  divider: { height: 1, backgroundColor: '#fde68a', marginVertical: 10 },
  myTicketStatus: { fontSize: 13, color: '#92400e', fontWeight: 'bold' },
  addBabyCard: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  cardSubTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  smallAddBtn: { backgroundColor: '#0d9488', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  babyChipContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e8f0', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginRight: 8 },
  babyChipActive: { backgroundColor: '#2563eb' },
  babyChipText: { fontSize: 13, color: '#334155' },
  babyChipTextActive: { fontSize: 13, color: '#fff', fontWeight: 'bold' },
  deleteChipBtn: { marginLeft: 10 },
  deleteChipText: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
  infantHeaderCard: { backgroundColor: '#0f172a', padding: 16, borderRadius: 12, marginBottom: 12 },
  infantHeaderTitle: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  infantHeaderName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  infantHeaderDob: { color: '#38bdf8', fontSize: 12, marginTop: 4 },
  vacRow: { backgroundColor: '#fff', padding: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  vacInfo: { flex: 1 },
  vacName: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
  vacAge: { fontSize: 11, color: '#64748b', marginTop: 2 },
  vacDue: { fontSize: 11, color: '#ef4444', fontWeight: 'bold', marginTop: 2 },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12 },
  statusDone: { backgroundColor: '#dcfce7' },
  statusPending: { backgroundColor: '#fef3c7' },
  statusTextDone: { fontSize: 11, fontWeight: 'bold', color: '#166534' },
  statusTextPending: { fontSize: 11, fontWeight: 'bold', color: '#92400e' },
  staffControlBox: { backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 16, elevation: 2, borderTopWidth: 5, borderTopColor: '#2563eb' },
  staffBoxTitle: { fontSize: 14, fontWeight: 'bold', color: '#475569' },
  staffCounterNum: { fontSize: 38, fontWeight: 'bold', color: '#2563eb', marginVertical: 10 },
  bottomNav: { flexDirection: 'row', backgroundColor: '#0f172a', height: 60, borderTopWidth: 1, borderTopColor: '#1e293b' },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navIcon: { fontSize: 18, opacity: 0.6 },
  navIconActive: { opacity: 1 },
  navText: { color: '#94a3b8', fontSize: 10, marginTop: 2 },
  navTextActive: { color: '#38bdf8', fontWeight: 'bold' },
});