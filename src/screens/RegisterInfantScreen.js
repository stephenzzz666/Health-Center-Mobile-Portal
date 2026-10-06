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

export default function RegisterInfantScreen({ role, name, setScreen, fetchInfants }) {
  const [loading, setLoading] = useState(false);
  const [babyName, setBabyName] = useState('');
  const [dob, setDob] = useState('2026-03-12');
  const [gender, setGender] = useState('Male');
  const [guardianName, setGuardianName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');

  const handleRegisterInfant = async () => {
    if (!babyName || !guardianName) {
      Alert.alert('Validation Error', 'Please fill in required fields (Baby Name and Guardian Name).');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('infants').insert([
        {
          name: babyName,
          dob: dob,
          gender: gender,
          guardian_name: guardianName,
          contact: contact,
          address: address,
          registered_by: name,
        },
      ]);

      if (error) {
        Alert.alert('Registration Failed', error.message);
      } else {
        Alert.alert('Registration Successful', `${babyName} has been registered.`);
        if (fetchInfants) await fetchInfants();
        setScreen('main');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to register infant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {TopHeader && <TopHeader role={role} setScreen={setScreen} />}

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 90 }}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('main')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="arrow-back-outline" size={18} color="#16a34a" />
            <Text style={styles.backText}> Back to Portal Overview</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Register Child Profile</Text>

        {/* Child Full Name */}
        <Text style={styles.label}>1. Child's Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Baby Ethan Dela Cruz"
          placeholderTextColor="#94a3b8"
          value={babyName}
          onChangeText={setBabyName}
        />

        {/* Date of Birth */}
        <Text style={styles.label}>2. Date of Birth</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
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
            placeholder="YYYY-MM-DD"
            value={dob}
            onChangeText={setDob}
          />
        )}

        {/* Gender Selection */}
        <Text style={styles.label}>3. Gender</Text>
        <View style={styles.pickerContainer}>
          {['Male', 'Female'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.choiceBtn, gender === g && styles.choiceBtnActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.choiceText, gender === g && styles.choiceTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Guardian Information */}
        <Text style={styles.label}>4. Parent / Guardian Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Maria Dela Cruz"
          placeholderTextColor="#94a3b8"
          value={guardianName}
          onChangeText={setGuardianName}
        />

        <Text style={styles.label}>5. Contact Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 09171234567"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          value={contact}
          onChangeText={setContact}
        />

        <Text style={styles.label}>6. Residential Address</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Zone 3, Brgy. Central"
          placeholderTextColor="#94a3b8"
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegisterInfant}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Save Child Record</Text>
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
  choiceBtn: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#ffffff' },
  choiceBtnActive: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  choiceText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  choiceTextActive: { color: '#16a34a', fontWeight: '700' },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 14, color: '#0f172a' },
  primaryButton: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});