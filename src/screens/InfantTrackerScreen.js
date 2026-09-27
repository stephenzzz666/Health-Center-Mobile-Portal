import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { generateDOHVaccines } from '../utils/dohSchedule';

export default function InfantTrackerScreen() {
  const [infant] = useState({
    name: 'Baby James Cabrido',
    birthDate: '2026-08-01',
  });

  const vaccineList = generateDOHVaccines(infant.birthDate);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <Text style={styles.babyName}>{infant.name}</Text>
        <Text style={styles.dobText}>DOB: {infant.birthDate} (DOH EPI Schedule)</Text>
      </View>

      <Text style={styles.sectionHeader}>Vaccination Milestone Tracker</Text>

      {vaccineList.map((item, index) => (
        <View key={index} style={styles.itemCard}>
          <View style={styles.itemInfo}>
            <Text style={styles.vaccineName}>{item.name}</Text>
            <Text style={styles.dueDate}>Due Date: {item.dueDate}</Text>
          </View>
          <View style={[styles.badge, item.status === 'Completed' ? styles.badgeSuccess : styles.badgePending]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f7fafc', flexGrow: 1 },
  profileHeader: { backgroundColor: '#2b6cb0', padding: 15, borderRadius: 10, marginBottom: 20 },
  babyName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  dobText: { color: '#e2e8f0', fontSize: 12, marginTop: 4 },
  sectionHeader: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 12 },
  itemCard: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  itemInfo: { flex: 1 },
  vaccineName: { fontSize: 13, fontWeight: 'bold', color: '#1a202c' },
  dueDate: { fontSize: 12, color: '#718096', marginTop: 2 },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  badgeSuccess: { backgroundColor: '#c6f6d5' },
  badgePending: { backgroundColor: '#feebc8' },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#22543d' },
});