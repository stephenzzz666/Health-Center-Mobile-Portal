import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { supabase } from '../../supabase';

// Official DOH Expanded Program on Immunization (EPI) Schedule
export const INFANT_VACCINATION_SCHEDULE = [
  {
    id: "vax-0",
    age: "At Birth",
    vaccineName: "BCG (Bacillus Calmette–Guérin)",
    doses: "1 Dose",
    site: "Right upper arm (Intradermal)",
    purpose: "Protects against Tuberculosis (TB) and TB meningitis",
  },
  {
    id: "vax-1",
    age: "At Birth",
    vaccineName: "Hepatitis B (HBV - Birth Dose)",
    doses: "1 Dose (within 24 hours)",
    site: "Anterolateral thigh (Intramuscular)",
    purpose: "Protects against Hepatitis B infection",
  },
  {
    id: "vax-2",
    age: "6 Weeks",
    vaccineName: "Pentavalent Vaccine (DTP-HepB-Hib) - Dose 1",
    doses: "Dose 1",
    site: "Anterolateral thigh (Intramuscular)",
    purpose: "Protects against Diphtheria, Tetanus, Pertussis, Hepatitis B, and Hib",
  },
  {
    id: "vax-3",
    age: "6 Weeks",
    vaccineName: "Oral Polio Vaccine (OPV) - Dose 1",
    doses: "Dose 1",
    site: "Oral (Drops)",
    purpose: "Protects against Poliovirus",
  },
  {
    id: "vax-4",
    age: "6 Weeks",
    vaccineName: "Pneumococcal Conjugate Vaccine (PCV) - Dose 1",
    doses: "Dose 1",
    site: "Anterolateral thigh (Intramuscular)",
    purpose: "Protects against Pneumonia and Meningitis",
  },
  {
    id: "vax-5",
    age: "10 Weeks",
    vaccineName: "Pentavalent Vaccine (DTP-HepB-Hib) - Dose 2",
    doses: "Dose 2",
    site: "Anterolateral thigh (Intramuscular)",
    purpose: "Second booster for DTP, HepB, and Hib",
  },
  {
    id: "vax-6",
    age: "10 Weeks",
    vaccineName: "Oral Polio Vaccine (OPV) - Dose 2",
    doses: "Dose 2",
    site: "Oral (Drops)",
    purpose: "Second dose for Polio protection",
  },
  {
    id: "vax-7",
    age: "10 Weeks",
    vaccineName: "Pneumococcal Conjugate Vaccine (PCV) - Dose 2",
    doses: "Dose 2",
    site: "Anterolateral thigh (Intramuscular)",
    purpose: "Second dose for Pneumonia protection",
  },
  {
    id: "vax-8",
    age: "14 Weeks",
    vaccineName: "Pentavalent Vaccine (DTP-HepB-Hib) - Dose 3",
    doses: "Dose 3",
    site: "Anterolateral thigh (Intramuscular)",
    purpose: "Final primary dose for DTP, HepB, and Hib",
  },
  {
    id: "vax-9",
    age: "14 Weeks",
    vaccineName: "Oral Polio Vaccine (OPV) - Dose 3",
    doses: "Dose 3",
    site: "Oral (Drops)",
    purpose: "Third dose for Polio protection",
  },
  {
    id: "vax-10",
    age: "14 Weeks",
    vaccineName: "Inactivated Polio Vaccine (IPV) - Dose 1",
    doses: "Dose 1",
    site: "Anterolateral thigh (Intramuscular)",
    purpose: "Enhanced injectable protection against Poliovirus",
  },
  {
    id: "vax-11",
    age: "14 Weeks",
    vaccineName: "Pneumococcal Conjugate Vaccine (PCV) - Dose 3",
    doses: "Dose 3",
    site: "Anterolateral thigh (Intramuscular)",
    purpose: "Third primary dose for Pneumonia protection",
  },
  {
    id: "vax-12",
    age: "9 Months",
    vaccineName: "Measles, Mumps, Rubella (MMR) - Dose 1",
    doses: "Dose 1",
    site: "Outer upper arm (Subcutaneous)",
    purpose: "Protects against Measles, Mumps, and Rubella",
  },
  {
    id: "vax-13",
    age: "9 Months",
    vaccineName: "Inactivated Polio Vaccine (IPV) - Dose 2",
    doses: "Dose 2",
    site: "Anterolateral thigh (Intramuscular)",
    purpose: "Second dose for complete Poliovirus immunity",
  },
  {
    id: "vax-14",
    age: "12 Months",
    vaccineName: "Measles, Mumps, Rubella (MMR) - Dose 2",
    doses: "Dose 2",
    site: "Outer upper arm (Subcutaneous)",
    purpose: "Booster dose for long-term Measles/Mumps/Rubella immunity",
  },
  {
    id: "vax-15",
    age: "12 Months",
    vaccineName: "Pneumococcal Conjugate Vaccine (PCV) - Booster",
    doses: "Booster Dose",
    site: "Anterolateral thigh (Intramuscular)",
    purpose: "Booster for Pneumonia and Pneumococcal diseases",
  },
];

// Fallback Capstone Demo Data
const DEMO_INFANTS = [
  {
    id: 'infant-101',
    name: 'Baby Ethan Dela Cruz',
    dob: '2026-03-12',
    gender: 'Male',
    guardianName: 'Maria Dela Cruz',
    contact: '09171234567',
    address: 'Zone 3, Brgy. Central',
    nextAppointment: 'Oct 25, 2026 (PCV Dose 2)',
    appointmentStatus: 'Scheduled',
  },
  {
    id: 'infant-102',
    name: 'Baby Sophia Santos',
    dob: '2026-06-01',
    gender: 'Female',
    guardianName: 'Ana Clara Santos',
    contact: '09189876543',
    address: 'Zone 1, Brgy. Central',
    nextAppointment: 'Nov 10, 2026 (Pentavalent Dose 1)',
    appointmentStatus: 'Scheduled',
  },
];

export default function InfantTrackerScreen({
  role = 'Health Worker',
  infants: initialInfants = [],
  searchQuery = '',
  onRefresh,
}) {
  const startingData = initialInfants && initialInfants.length > 0 ? initialInfants : DEMO_INFANTS;
  const [infants, setInfants] = useState(startingData);
  const [activeTab, setActiveTab] = useState('records'); // 'records' or 'schedule'

  // Synchronize state whenever App.js passes new data props
  useEffect(() => {
    if (initialInfants && initialInfants.length > 0) {
      setInfants(initialInfants);
    }
  }, [initialInfants]);

  // Handle removing/deleting an infant record (Web & Native Compatible)
  const handleRemoveInfant = (infantId, infantName) => {
    const confirmMsg = `Are you sure you want to permanently delete the profile for ${infantName}? This action cannot be undone.`;

    const executeDelete = async () => {
      // 1. Instantly remove from local UI state
      setInfants(prev => prev.filter(item => item.id !== infantId));

      // 2. Perform DB delete in Supabase
      try {
        if (supabase) {
          const { error } = await supabase
            .from('infants')
            .delete()
            .eq('id', infantId);

          if (error) console.log('Supabase deletion response:', error.message);
        }
      } catch (err) {
        console.log('Record removed locally.');
      }

      if (onRefresh) onRefresh();
    };

    // Cross-Platform Dialog Execution
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        executeDelete();
      }
    } else {
      Alert.alert(
        "Confirm Deletion",
        confirmMsg,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete Record", style: "destructive", onPress: executeDelete },
        ]
      );
    }
  };

  // Handle canceling a scheduled vaccination appointment
  const handleCancelAppointment = (infantId, infantName) => {
    const confirmMsg = `Are you sure you want to cancel the upcoming appointment for ${infantName}?`;

    const executeCancel = async () => {
      // 1. Instantly update UI status
      setInfants(prev =>
        prev.map(item => {
          if (item.id === infantId) {
            return {
              ...item,
              nextAppointment: 'Appointment Cancelled',
              appointmentStatus: 'Cancelled',
            };
          }
          return item;
        })
      );

      // 2. Perform DB update in Supabase
      try {
        if (supabase) {
          const { error } = await supabase
            .from('appointments')
            .update({ status: 'Cancelled' })
            .eq('infant_id', infantId);

          if (error) console.log('Supabase update response:', error.message);
        }
      } catch (err) {
        console.log('Appointment status updated locally.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        executeCancel();
      }
    } else {
      Alert.alert(
        "Cancel Appointment",
        confirmMsg,
        [
          { text: "Keep Appointment", style: "cancel" },
          { text: "Yes, Cancel Appt", style: "destructive", onPress: executeCancel },
        ]
      );
    }
  };

  // Search filter matching Infant Name or Parent/Guardian Name
  const filteredInfants = infants.filter(infant => {
    const query = (searchQuery || '').toLowerCase();
    const nameMatch = (infant.name || '').toLowerCase().includes(query);
    const parentMatch = (infant.guardianName || infant.parentName || '').toLowerCase().includes(query);
    return nameMatch || parentMatch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.container}>
        
        {/* Navigation Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'records' && styles.activeTabButton]}
            onPress={() => setActiveTab('records')}
          >
            <Text style={[styles.tabText, activeTab === 'records' && styles.activeTabText]}>
              Registered Infants ({filteredInfants.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'schedule' && styles.activeTabButton]}
            onPress={() => setActiveTab('schedule')}
          >
            <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
              DOH EPI Schedule
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: INFANT PROFILES & APPOINTMENTS */}
        {activeTab === 'records' ? (
          filteredInfants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👶</Text>
              <Text style={styles.emptyTitle}>No Infant Records Found</Text>
              <Text style={styles.emptySubtitle}>Try searching for a different baby or parent name.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredInfants}
              keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isCancelled = item.appointmentStatus === 'Cancelled' || item.nextAppointment === 'Appointment Cancelled';
                const parentDisplayName = item.guardianName || item.parentName || 'Registered Parent';

                return (
                  <View style={styles.card}>
                    {/* Header Row: Infant & Parent Info */}
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        {/* Baby Name */}
                        <Text style={styles.babyName}>👶 {item.name || 'Unnamed Infant'}</Text>
                        
                        {/* Parent / Guardian Badge */}
                        <View style={styles.parentBadge}>
                          <Text style={styles.parentBadgeText}>
                            👤 <Text style={styles.boldText}>Parent / Guardian:</Text> {parentDisplayName}
                          </Text>
                        </View>

                        {/* Additional Patient Metadata */}
                        <Text style={styles.metaText}>📅 DOB: {item.dob || 'N/A'} • {item.gender || 'Infant'}</Text>
                        {item.contact && <Text style={styles.metaText}>📞 Contact: {item.contact}</Text>}
                        {item.address && <Text style={styles.metaText}>🏠 Address: {item.address}</Text>}
                      </View>

                      {/* Delete Infant Record Button */}
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleRemoveInfant(item.id, item.name || 'this infant')}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardDivider} />

                    {/* Footer Row: Vaccination Appointment Status & Actions */}
                    <View style={styles.appointmentBox}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.appointmentLabel}>Next Scheduled Vaccination:</Text>
                        <Text style={[styles.appointmentDate, isCancelled && styles.cancelledText]}>
                          {item.nextAppointment || 'No active appointment'}
                        </Text>
                      </View>

                      {!isCancelled && item.nextAppointment && (
                        <TouchableOpacity
                          style={styles.cancelApptButton}
                          onPress={() => handleCancelAppointment(item.id, item.name || 'this infant')}
                        >
                          <Text style={styles.cancelApptText}>Cancel Appt</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              }}
            />
          )
        ) : (
          /* TAB 2: DOH 1-YEAR VACCINATION SCHEDULE */
          <FlatList
            data={INFANT_VACCINATION_SCHEDULE}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.scheduleCard}>
                <View style={styles.ageBadge}>
                  <Text style={styles.ageBadgeText}>{item.age}</Text>
                </View>
                <Text style={styles.vaccineTitle}>{item.vaccineName}</Text>
                <Text style={styles.scheduleDetail}>📍 <Text style={styles.boldText}>Site:</Text> {item.site}</Text>
                <Text style={styles.scheduleDetail}>🛡 <Text style={styles.boldText}>Protection:</Text> {item.purpose}</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#f8fafc',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#0284c7',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  activeTabText: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  babyName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  parentBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  parentBadgeText: {
    fontSize: 12,
    color: '#0369a1',
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  appointmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
  },
  appointmentLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  appointmentDate: {
    fontSize: 13,
    color: '#0284c7',
    fontWeight: 'bold',
    marginTop: 2,
  },
  cancelledText: {
    color: '#ef4444',
    textDecorationLine: 'line-through',
  },
  cancelApptButton: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  cancelApptText: {
    color: '#b45309',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justify: 'center',
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  scheduleCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ageBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  ageBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  vaccineTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  scheduleDetail: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  boldText: {
    fontWeight: '600',
  },
});