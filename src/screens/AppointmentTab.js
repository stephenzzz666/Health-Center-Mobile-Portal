import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function AppointmentsTab({ appointments, setScreen }) {
  return (
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
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  smallBtn: { backgroundColor: '#16a34a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  smallBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  cardDetail: { fontSize: 12, color: '#475569', marginTop: 2 },
  cardSubDetail: { fontSize: 11, color: '#64748b', fontStyle: 'italic', marginTop: 4 },
  badge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { fontSize: 10, color: '#15803d', fontWeight: '700' },
  emptyCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  emptyText: { color: '#94a3b8', fontSize: 13 },
});