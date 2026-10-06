import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import { supabase } from '../../supabase';

export default function BookAppointmentScreen({ role, name, setScreen, fetchAppointments }) {
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState('General Consultation');
  const [selectedDate, setSelectedDate] = useState('2026-10-12');
  const [slot, setSlot] = useState('09:00 AM - 10:00 AM');
  const [patientNotes, setPatientNotes] = useState('');

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
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TopHeader role={role} setScreen={setScreen} />

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

        {/* 2. Interactive Calendar Date Picker */}
        <Text style={styles.label}>2. Preferred Date</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '14px',
              color: '#0f172a',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="e.g. 2026-10-12"
            value={selectedDate}
            onChangeText={setSelectedDate}
          />
        )}

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 6 },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  choiceBtn: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#ffffff' },
  choiceBtnActive: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  choiceText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  choiceTextActive: { color: '#16a34a', fontWeight: '700' },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 14, color: '#0f172a' },
  primaryButton: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});