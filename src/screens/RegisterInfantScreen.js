import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import { supabase } from '../../supabase';

export default function RegisterInfantScreen({ role, setScreen, fetchInfants }) {
  const [loading, setLoading] = useState(false);
  const [babyForm, setBabyForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthDate: '',
    gender: 'Male',
    bloodType: 'A+',
    motherName: '',
    fatherName: '',
    contactNum: '09123456789',
  });

  const handleRegisterInfant = async () => {
    if (!babyForm.firstName || !babyForm.lastName || !babyForm.birthDate || !babyForm.motherName) {
      Alert.alert('Missing Required Fields', 'Please complete First Name, Last Name, Birth Date, and Mother Name.');
      return;
    }

    setLoading(true);
    try {
      const chrNumber = `CHR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const { error } = await supabase.from('infants').insert([
        {
          chr_number: chrNumber,
          first_name: babyForm.firstName,
          middle_name: babyForm.middleName,
          last_name: babyForm.lastName,
          birth_date: babyForm.birthDate,
          gender: babyForm.gender,
          blood_type: babyForm.bloodType,
          mother_name: babyForm.motherName,
          father_name: babyForm.fatherName,
          contact_num: babyForm.contactNum,
        },
      ]);

      if (error) {
        Alert.alert('Database Error', error.message);
      } else {
        Alert.alert('Success', 'Child Health Record registered successfully!');
        await fetchInfants();
        setScreen('main');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to register child record');
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
            <Text style={styles.backText}> Back to Child Registry</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Newborn / Infant Registration</Text>

        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter child's first name"
          value={babyForm.firstName}
          onChangeText={(txt) => setBabyForm({ ...babyForm, firstName: txt })}
        />

        <Text style={styles.label}>Middle Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter child's middle name"
          value={babyForm.middleName}
          onChangeText={(txt) => setBabyForm({ ...babyForm, middleName: txt })}
        />

        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter child's last name"
          value={babyForm.lastName}
          onChangeText={(txt) => setBabyForm({ ...babyForm, lastName: txt })}
        />

        <Text style={styles.label}>Date of Birth (YYYY-MM-DD) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2026-05-15"
          value={babyForm.birthDate}
          onChangeText={(txt) => setBabyForm({ ...babyForm, birthDate: txt })}
        />

        <Text style={styles.label}>Mother's Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mother's name"
          value={babyForm.motherName}
          onChangeText={(txt) => setBabyForm({ ...babyForm, motherName: txt })}
        />

        <Text style={styles.label}>Father's Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter father's name"
          value={babyForm.fatherName}
          onChangeText={(txt) => setBabyForm({ ...babyForm, fatherName: txt })}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegisterInfant}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Save Child Health Record</Text>
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
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 14, color: '#0f172a' },
  primaryButton: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});