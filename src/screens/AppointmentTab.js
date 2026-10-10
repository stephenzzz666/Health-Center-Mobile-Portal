import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export default function AppointmentTab({
  role = 'patient',
  isAdmin = false,
  userRole,
  appointments = [],
  onBookVisit,
}) {
  const checkIsAdmin =
    isAdmin === true ||
    role === 'admin' ||
    role === 'staff' ||
    userRole === 'admin' ||
    userRole === 'staff';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Scheduled Health Visits</Text>

        {!checkIsAdmin && (
          <TouchableOpacity style={styles.bookVisitBtn} onPress={onBookVisit}>
            <Text style={styles.bookVisitBtnText}>+ Book Visit</Text>
          </TouchableOpacity>
        )}
      </View>

      {appointments && appointments.length > 0 ? (
        <View style={styles.appointmentsList}>
          {appointments.map((item, index) => {
            const userNameStr = item.user_name || item.patient_name || 'Resident';
            const childNameStr = item.child_name && item.child_name !== 'N/A' ? ` (Child: ${item.child_name})` : '';
            const serviceStr = item.service || item.service_type || 'General Consultation';
            const dateStr = item.appointment_date || 'Today';
            const slotStr = item.time_slot || '08:00 AM - 10:00 AM';

            return (
              <View key={item.id || index} style={styles.appointmentCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.patientName}>
                    {userNameStr}{childNameStr}
                  </Text>
                  <Text style={styles.statusBadge}>{item.status || 'Scheduled'}</Text>
                </View>

                <Text style={styles.visitDetails}>
                  📋 Service: <Text style={{ fontWeight: '700', color: '#0f172a' }}>{serviceStr}</Text>
                </Text>
                <Text style={styles.visitDetails}>
                  📅 Date & Time: <Text style={{ fontWeight: '700', color: '#0f172a' }}>{dateStr}</Text> ({slotStr})
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No upcoming appointments recorded.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  bookVisitBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  bookVisitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  visitDetails: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
});