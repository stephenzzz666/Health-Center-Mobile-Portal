import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardTab({ name, role, myToken, appointments, infants, consultNum, vaccineNum, prenatalNum, setScreen }) {
  return (
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
  );
}

const styles = StyleSheet.create({
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
  actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionCard: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, alignItems: 'center' },
  actionTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  actionSub: { fontSize: 10, color: '#64748b', textAlign: 'center', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  statGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12 },
  statNumber: { fontSize: 20, fontWeight: '800', color: '#16a34a' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
});