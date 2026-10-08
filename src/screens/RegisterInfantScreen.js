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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('2026-03-12');
  const [gender, setGender] = useState('Male');
  const [motherName, setMotherName] = useState('');
  const [contactNum, setContactNum] = useState('');
  const [address, setAddress] = useState('');

  const notify = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleRegisterInfant = async () => {
    if (!firstName.trim() || !motherName.trim()) {
      notify('Validation Error', 'Please fill in required fields (Child First Name and Parent/Guardian Name).');
      return;
    }

    setLoading(true);
    try {
      if (!supabase) {
        throw new Error('Supabase client is not connected.');
      }

      // Maps fields matching your database/App.js schema safely
      const { error } = await supabase.from('infants').insert([
        {
          first_name: firstName.trim(),
          last_name: lastName.trim() || 'N/A',
          birth_date: dob,
          gender: gender,
          mother_name: motherName.trim(),
          contact_num: contactNum.trim() || 'N/A',
          address: address.trim() || 'N/A',
          chr_number: `CHR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      ]);

      if (error) {
        console.error('Supabase Insert Error:', error);
        notify('Registration Failed', error.message);
      } else {
        notify('Registration Successful', `${firstName} has been registered.`);
        if (fetchInfants) await fetchInfants();
        setScreen('main');
      }
    } catch (e) {
      console.error('Registration catch error:', e);
      notify('Error', e.message || 'Failed to register child.');
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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setScreen('main')}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="arrow-back-outline" size={18} color="#16a34a" />
            <Text style={styles.backText}> Back to Portal Overview</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Register Child Profile</Text>

        {/* Child First Name */}
        <Text style={styles.label}>1. Child's First Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Ethan"
          placeholderTextColor="#94a3b8"
          value={firstName}
          onChangeText={setFirstName}
        />

        {/* Child Last Name */}
        <Text style={styles.label}>Child's Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Dela Cruz"
          placeholderTextColor="#94a3b8"
          value={lastName}
          onChangeText={setLastName}
        />

        {/* Date of Birth */}
        <Text style={styles.label}>2. Date of Birth *</Text>
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
            placeholderTextColor="#94a3b8"
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
              activeOpacity={0.8}
            >
              <Text style={[styles.choiceText, gender === g && styles.choiceTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Guardian Information */}
        <Text style={styles.label}>4. Parent / Guardian Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Maria Dela Cruz"
          placeholderTextColor="#94a3b8"
          value={motherName}
          onChangeText={setMotherName}
        />

        <Text style={styles.label}>5. Contact Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 09171234567"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          value={contactNum}
          onChangeText={setContactNum}
        />

        <Text style={styles.label}>6. Residential Address</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Zone 3, Brgy. Central"
          placeholderTextColor="#94a3b8"
          value={address}
          onChangeText={setAddress}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.primaryButton, loading && { opacity: 0.7 }]}
          onPress={handleRegisterInfant}
          disabled={loading}
          activeOpacity={0.8}
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
  backBtn: { marginBottom: 12, paddingVertical: 4 },
  backText: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 4 },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  choiceBtn: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#ffffff' },
  choiceBtnActive: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  choiceText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  choiceTextActive: { color: '#16a34a', fontWeight: '700' },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 14, color: '#0f172a' },
  primaryButton: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 12, cursor: 'pointer' },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});