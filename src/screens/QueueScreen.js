import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function QueueScreen({
  role = 'patient',
  consultNum,
  setConsultNum,
  vaccineNum,
  setVaccineNum,
  prenatalNum,
  setPrenatalNum,
  myToken = 'A-015',
}) {
  const isAdmin = role === 'admin' || role === 'staff';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Brgy. Visayan Village Health Center</Text>
        <Text style={styles.headerSubtitle}>Live Queue Management System</Text>
      </View>

      {/* Now Serving Display Card */}
      <View style={styles.nowServingCard}>
        <Text style={styles.cardLabel}>NOW SERVING</Text>
        <Text style={styles.nowServingNumber}>
          A-0{consultNum ? consultNum : '12'}
        </Text>
      </View>

      {/* RESIDENT / PATIENT VIEW: Ticket Status Card */}
      {!isAdmin && (
        <View style={styles.patientTicketCard}>
          <Text style={styles.patientLabel}>YOUR TICKET NUMBER</Text>
          <Text style={styles.patientToken}>{myToken}</Text>
          <Text style={styles.patientStatus}>
            Status: {Math.max(0, (consultNum || 12) - 12)} patient(s) ahead of you
          </Text>
        </View>
      )}

      {/* ADMIN / STAFF VIEW ONLY: Queue Control Actions */}
      {isAdmin && (
        <View style={styles.adminSection}>
          <Text style={styles.adminSectionTitle}>Admin / Staff Controls</Text>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.callNextBtn}
            onPress={() => setConsultNum && setConsultNum((prev) => prev + 1)}
          >
            <Ionicons name="megaphone-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.callNextBtnText}>Call Next Patient (+1)</Text>
          </TouchableOpacity>

          {/* Service Counter Management Cards */}
          <View style={styles.counterGrid}>
            {/* Consultation Counter */}
            <View style={styles.counterCard}>
              <Text style={styles.counterTitle}>General Consultation</Text>
              <Text style={styles.counterNumber}>A-0{consultNum}</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => setConsultNum && setConsultNum((p) => Math.max(1, p - 1))}
                >
                  <Text style={styles.adjustBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => setConsultNum && setConsultNum((p) => p + 1)}
                >
                  <Text style={styles.adjustBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Immunization Counter */}
            <View style={styles.counterCard}>
              <Text style={styles.counterTitle}>Vaccination / Immunization</Text>
              <Text style={styles.counterNumber}>B-0{vaccineNum}</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => setVaccineNum && setVaccineNum((p) => Math.max(1, p - 1))}
                >
                  <Text style={styles.adjustBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => setVaccineNum && setVaccineNum((p) => p + 1)}
                >
                  <Text style={styles.adjustBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Prenatal Counter */}
            <View style={styles.counterCard}>
              <Text style={styles.counterTitle}>Maternal & Prenatal</Text>
              <Text style={styles.counterNumber}>C-0{prenatalNum}</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => setPrenatalNum && setPrenatalNum((p) => Math.max(1, p - 1))}
                >
                  <Text style={styles.adjustBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => setPrenatalNum && setPrenatalNum((p) => p + 1)}
                >
                  <Text style={styles.adjustBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  // Main "NOW SERVING" Card - Standardized Green
  nowServingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 8,
  },
  nowServingNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#16a34a', // App Theme Green
  },
  // Resident Ticket Card
  patientTicketCard: {
    backgroundColor: '#f0fdf4', // Light theme green highlight background
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0', // Green border
    marginBottom: 16,
  },
  patientLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  patientToken: {
    fontSize: 40,
    fontWeight: '800',
    color: '#15803d',
    marginBottom: 8,
  },
  patientStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  // Admin Section Controls
  adminSection: {
    marginTop: 8,
  },
  adminSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
    textAlign: 'center',
  },
  callNextBtn: {
    backgroundColor: '#16a34a', // Primary Green
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 20,
  },
  callNextBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  counterGrid: {
    gap: 12,
  },
  counterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  counterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  counterNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#16a34a',
    marginVertical: 6,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  adjustBtn: {
    backgroundColor: '#f1f5f9',
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  adjustBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
});