import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InfantTrackerScreen({
  role = 'patient',
  infants = [],
  searchQuery = '',
  setSearchQuery,
  setScreen,
}) {
  const [trackerTab, setTrackerTab] = useState('registered'); // 'registered' | 'schedule'

  const notify = (title, msg) => {
    if (Platform.OS === 'web') window.alert(`${title}: ${msg}`);
    else Alert.alert(title, msg);
  };

  const handleCancelAppointment = (infantName) => {
    notify('Cancel Appointment', `Appointment for ${infantName} has been cancelled.`);
  };

  const handleDeleteInfant = (infantName) => {
    notify('Delete Record', `Record for ${infantName} has been deleted.`);
  };

  const displayList = infants && infants.length > 0 ? infants : mockInfants;

  return (
    <View style={styles.container}>
      {/* Top Section Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            trackerTab === 'registered' && styles.activeTabButton,
          ]}
          onPress={() => setTrackerTab('registered')}
        >
          <Text
            style={[
              styles.tabText,
              trackerTab === 'registered' && styles.activeTabText,
            ]}
          >
            Registered Infants ({displayList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            trackerTab === 'schedule' && styles.activeTabButton,
          ]}
          onPress={() => setTrackerTab('schedule')}
        >
          <Text
            style={[
              styles.tabText,
              trackerTab === 'schedule' && styles.activeTabText,
            ]}
          >
            DOH EPI Schedule
          </Text>
        </TouchableOpacity>
      </View>

      {/* REGISTERED INFANTS VIEW */}
      {trackerTab === 'registered' && (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {displayList.map((item, index) => {
            // Helper mapping to accept both Supabase DB fields (snake_case) and frontend fields (camelCase)
            const babyName =
              item.fullName ||
              item.name ||
              `${item.first_name || ''} ${item.last_name || ''}`.trim() ||
              'Baby Record';

            const parentName =
              item.motherName ||
              item.mother_name ||
              item.parentName ||
              'Maria Dela Cruz';

            const dob = item.birthDate || item.birth_date || '2026-03-12';
            const gender = item.gender || 'Male';
            const contact = item.contactNum || item.contact_num || '09171234567';
            const address = item.address || 'Zone 3, Brgy. Central';
            const nextVaccine =
              item.nextVaccine || item.next_vaccine || 'Oct 25, 2026 (PCV Dose 2)';

            return (
              <View key={item.id || index} style={styles.card}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.nameRow}>
                    <Ionicons name="person-circle-outline" size={24} color="#16a34a" />
                    <Text style={styles.babyName}>{babyName}</Text>
                  </View>

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteInfant(babyName)}
                  >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>

                {/* Parent / Guardian Green Pill Badge */}
                <View style={styles.parentBadge}>
                  <Ionicons name="person" size={14} color="#15803d" />
                  <Text style={styles.parentBadgeText}>
                    Parent / Guardian:{' '}
                    <Text style={styles.parentNameText}>{parentName}</Text>
                  </Text>
                </View>

                {/* Information Details */}
                <View style={styles.detailsBox}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color="#64748b" />
                    <Text style={styles.detailText}>
                      DOB: {dob} • {gender}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={14} color="#64748b" />
                    <Text style={styles.detailText}>Contact: {contact}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={14} color="#64748b" />
                    <Text style={styles.detailText}>Address: {address}</Text>
                  </View>
                </View>

                {/* Scheduled Vaccination Section */}
                <View style={styles.vaccineSection}>
                  <View style={styles.vaccineInfo}>
                    <Text style={styles.vaccineLabel}>Next Scheduled Vaccination:</Text>
                    <Text style={styles.vaccineDateText}>{nextVaccine}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.cancelApptBtn}
                    onPress={() => handleCancelAppointment(babyName)}
                  >
                    <Text style={styles.cancelApptText}>Cancel Appt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* DOH EPI SCHEDULE VIEW */}
      {trackerTab === 'schedule' && (
        <ScrollView contentContainerStyle={styles.listContainer}>
          <View style={styles.card}>
            <Text style={styles.scheduleTitle}>Expanded Program on Immunization (EPI)</Text>
            <Text style={styles.scheduleSubtitle}>Standard DOH Immunization Schedule for Infants</Text>

            <View style={styles.scheduleTable}>
              <View style={styles.tableRowHeader}>
                <Text style={styles.tableColHeader}>Age</Text>
                <Text style={styles.tableColHeader}>Vaccine</Text>
                <Text style={styles.tableColHeader}>Doses</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableColBold}>At Birth</Text>
                <Text style={styles.tableCol}>BCG, Hepatitis B</Text>
                <Text style={styles.tableCol}>1 dose each</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableColBold}>1 ½ Months</Text>
                <Text style={styles.tableCol}>Pentavalent, OPV, PCV</Text>
                <Text style={styles.tableCol}>Dose 1</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableColBold}>2 ½ Months</Text>
                <Text style={styles.tableCol}>Pentavalent, OPV, PCV</Text>
                <Text style={styles.tableCol}>Dose 2</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableColBold}>3 ½ Months</Text>
                <Text style={styles.tableCol}>Pentavalent, OPV, IPV, PCV</Text>
                <Text style={styles.tableCol}>Dose 3</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableColBold}>9 Months</Text>
                <Text style={styles.tableCol}>MCV1 (Measles, Mumps, Rubella)</Text>
                <Text style={styles.tableCol}>Dose 1</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableColBold}>1 Year</Text>
                <Text style={styles.tableCol}>MCV2 (MMR)</Text>
                <Text style={styles.tableCol}>Dose 2</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const mockInfants = [
  {
    id: '1',
    fullName: 'Baby Ethan Dela Cruz',
    motherName: 'Maria Dela Cruz',
    birthDate: '2026-03-12',
    gender: 'Male',
    contactNum: '09171234567',
    address: 'Zone 3, Brgy. Central',
    nextVaccine: 'Oct 25, 2026 (PCV Dose 2)',
  },
  {
    id: '2',
    fullName: 'Baby Sophia Santos',
    motherName: 'Ana Clara Santos',
    birthDate: '2026-06-01',
    gender: 'Female',
    contactNum: '09189876543',
    address: 'Zone 1, Brgy. Central',
    nextVaccine: 'Nov 10, 2026 (Pentavalent Dose 1)',
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#16a34a',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  babyName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  parentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 12,
  },
  parentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  parentNameText: {
    fontWeight: '700',
    color: '#166534',
  },
  detailsBox: {
    gap: 6,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  vaccineSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  vaccineDateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16a34a',
  },
  cancelApptBtn: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cancelApptText: {
    color: '#b45309',
    fontSize: 12,
    fontWeight: '700',
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  scheduleSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 16,
  },
  scheduleTable: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
  },
  tableColHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  tableColBold: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },
  tableCol: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
  },
});