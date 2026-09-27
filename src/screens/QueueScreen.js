import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function QueueScreen() {
  const [nowServing, setNowServing] = useState(12);
  const [myToken] = useState(15);

  const callNext = () => setNowServing((prev) => prev + 1);
  const resetQueue = () => setNowServing(1);

  const waitingCount = myToken > nowServing ? myToken - nowServing : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Brgy. Visayan Village Health Center</Text>
      <Text style={styles.subTitle}>Live Queue Management System</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>NOW SERVING</Text>
        <Text style={styles.tokenNumber}>A-{String(nowServing).padStart(3, '0')}</Text>
      </View>

      <View style={[styles.card, styles.patientCard]}>
        <Text style={styles.cardLabel}>YOUR TICKET NUMBER</Text>
        <Text style={styles.patientToken}>A-{String(myToken).padStart(3, '0')}</Text>
        <Text style={styles.statusText}>
          {nowServing === myToken
            ? '🔔 Please proceed to Counter 1!'
            : waitingCount > 0
            ? `Status: ${waitingCount} patient(s) ahead of you`
            : 'Completed'}
        </Text>
      </View>

      <View style={styles.adminBox}>
        <Text style={styles.adminTitle}>Admin / Staff Simulator</Text>
        <TouchableOpacity style={styles.button} onPress={callNext}>
          <Text style={styles.buttonText}>Call Next Patient (+1)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetQueue}>
          <Text style={styles.buttonText}>Reset Counter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f4f6f8', flexGrow: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a365d', textAlign: 'center', marginTop: 10 },
  subTitle: { fontSize: 13, color: '#4a5568', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '100%', alignItems: 'center', elevation: 3, marginBottom: 15 },
  patientCard: { backgroundColor: '#ebf8ff', borderColor: '#3182ce', borderWidth: 1 },
  cardLabel: { fontSize: 11, color: '#718096', fontWeight: 'bold', letterSpacing: 1 },
  tokenNumber: { fontSize: 48, fontWeight: 'bold', color: '#2b6cb0', marginVertical: 10 },
  patientToken: { fontSize: 32, fontWeight: 'bold', color: '#2c5282', marginVertical: 5 },
  statusText: { fontSize: 13, color: '#2b6cb0', fontWeight: '600', marginTop: 5 },
  adminBox: { width: '100%', marginTop: 15, padding: 15, backgroundColor: '#edf2f7', borderRadius: 10 },
  adminTitle: { fontSize: 13, fontWeight: 'bold', color: '#4a5568', marginBottom: 10, textAlign: 'center' },
  button: { backgroundColor: '#319795', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  resetButton: { backgroundColor: '#e53e3e' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});